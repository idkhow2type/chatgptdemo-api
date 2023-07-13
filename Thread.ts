import 'dotenv/config';
import { request, XOR, Base } from './utils.js';
import User from './User.js';

interface Message {
    user: string;
    user_time: number;
    bot: string;
    bot_time: number;
}

export default class Thread extends Base {
    private _name: string;
    private _id: string;
    private _messages: Array<Message>;
    private _deleted: boolean;
    readonly user: User;
    constructor(option: XOR<{ name: string }, { id: string }>, user: User) {
        super();
        this._name = option.name;
        this._id = option.id;
        this.user = user;
        this._messages = [];
        this._deleted = false;
        this._decorGlobal(() => {
            if (this._deleted) {
                throw new Error('Thread deleted');
            }
        }, ['refresh', 'delete']);
    }

    public async initialise() {
        super.initialise();
        const userThreads = await this.user.getUserThreads();
        if (this._name) {
            const namedThread = userThreads.find(
                (thread) => thread.name === this._name
            ); // bad name ik stfu
            if (namedThread) {
                this._id = namedThread.id;
                await this.refresh();
                return;
            }
            const res = await request('new_chat', 'POST', {
                body: JSON.stringify({
                    user_id: this.user.uid,
                }),
            });
            this._id = (await res.json()).id_;

            await request('update_chat_name', 'POST', {
                body: JSON.stringify({
                    chat_id: this._id,
                    chat_name: this._name,
                }),
            });
        } else {
            // There is a broken access control vulnerability in the api
            // any user can view any thread if they have the thread id
            // not our job to protect against this but its annoying to deal with
            if (!userThreads.find((thread) => thread.id === this._id)) {
                throw new Error('Thread not created by user');
            }
        }
    }

    public set name(name: string) {
        this.setNameAsync(name);
    }
    private async setNameAsync(name: string) {
        await request('update_chat_name', 'POST', {
            body: JSON.stringify({
                chat_id: this._id,
                chat_name: name,
            }),
        });
    }

    public get name(): string {
        return this._name;
    }

    public get id(): string {
        return this._id;
    }

    public get messages(): ReadonlyArray<Message> {
        return this._messages;
    }

    public get deleted(): boolean {
        return this._deleted;
    }

    /**
     * saveBotMessage
     * the api lets the client save bot messages manually for some reason
     * calling this is not recommended, but it is possible
     */
    public async saveBotMessage(
        botMessage: string,
        timestamp: number = Date.now(),
    ) {
        const index = this._messages.length - 1

        this._messages[index].bot = botMessage;
        this._messages[index].bot_time = timestamp;
        
        try {
            return await request('update_messages', 'POST', {
                body: JSON.stringify({
                    bot_response: botMessage,
                    chat_id: this._id,
                    timestamp,
                }),
            });
        } catch (err) {
            console.error(err);
            this._messages[index].bot = null;
            this._messages[index].bot_time = null;
        }
    }

    /**
     * refreshMessages
     */
    public async refresh(id: string = this._id) {
        this._id = id;
        try {
            const chat = await (
                await request('get_chat', 'POST', {
                    body: JSON.stringify({
                        chat_id: id,
                    }),
                })
            ).json();

            this._messages = chat.messages;
            this._name = chat.chat_name;
        } catch (error) {
            this._deleted = true;
        }
    }

    public async sendMessage(userMessage: string, save: boolean = true) {
        this._messages.push({
            user: userMessage,
            user_time: Date.now(),
            bot: null,
            bot_time: null,
        });

        const reader = (
            await request('chat_api_stream', 'POST', {
                body: JSON.stringify({
                    chat_id: this._id,
                    question: userMessage,
                    timestamp: Date.now(),
                    token: this.user.token,
                }),
            })
        ).body.getReader();

        let data = '';
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            data += new TextDecoder().decode(value);
        }

        const content = data.split('data: ').reduce((prev, curr) => {
            return prev + (JSON.parse(curr).choices[0].delta.content ?? '');
        });

        if (save) {
            this.saveBotMessage(content, Date.now()); // this might be awaited, prob dont need to
        }

        return content;
    }

    /**
     * delete
     */
    public async delete() {
        await request('delete_chat', 'POST', {
            body: JSON.stringify({
                chat_id: this._id,
            }),
        });
        this._deleted = true;
    }
}
