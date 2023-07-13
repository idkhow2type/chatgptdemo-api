import 'dotenv/config';
import { request, Base } from './utils.js';
export default class Thread extends Base {
    constructor(option, user) {
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
    async initialise() {
        super.initialise();
        const userThreads = await this.user.getUserThreads();
        if (this._name) {
            const namedThread = userThreads.find((thread) => thread.name === this._name); // bad name ik stfu
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
        }
        else {
            // There is a broken access control vulnerability in the api
            // any user can view any thread if they have the thread id
            // not our job to protect against this but its annoying to deal with
            if (!userThreads.find((thread) => thread.id === this._id)) {
                throw new Error('Thread not created by user');
            }
        }
    }
    set name(name) {
        this.setNameAsync(name);
    }
    async setNameAsync(name) {
        await request('update_chat_name', 'POST', {
            body: JSON.stringify({
                chat_id: this._id,
                chat_name: name,
            }),
        });
    }
    get name() {
        return this._name;
    }
    get id() {
        return this._id;
    }
    get messages() {
        return this._messages;
    }
    get deleted() {
        return this._deleted;
    }
    /**
     * saveBotMessage
     * the api lets the client save bot messages manually for some reason
     * calling this is not recommended, but it is possible
     */
    async saveBotMessage(botMessage, timestamp = Date.now()) {
        return await request('update_messages', 'POST', {
            body: JSON.stringify({
                bot_response: botMessage,
                chat_id: this._id,
                timestamp,
            }),
        });
    }
    /**
     * refreshMessages
     */
    async refresh(id = this._id) {
        this._id = id;
        try {
            const chat = await (await request('get_chat', 'POST', {
                body: JSON.stringify({
                    chat_id: id,
                }),
            })).json();
            this._messages = chat.messages;
            this._name = chat.chat_name;
        }
        catch (error) {
            this._deleted = true;
        }
    }
    async sendMessage(userMessage, save = true) {
        const message = {
            user: userMessage,
            user_time: Date.now(),
            bot: null,
            bot_time: null,
        };
        const reader = (await request('chat_api_stream', 'POST', {
            body: JSON.stringify({
                chat_id: this._id,
                question: userMessage,
                timestamp: Date.now(),
                token: this.user.token,
            }),
        })).body.getReader();
        let data = '';
        while (true) {
            const { done, value } = await reader.read();
            if (done)
                break;
            data += new TextDecoder().decode(value);
        }
        const content = data.split('data: ').reduce((prev, curr) => {
            return prev + (JSON.parse(curr).choices[0].delta.content ?? '');
        });
        if (save) {
            message.bot = content;
            message.bot_time = Date.now();
            this.saveBotMessage(content, message.bot_time); // this might be awaited, prob dont need to
            this._messages.push(message);
        }
        return content;
    }
    /**
     * delete
     */
    async delete() {
        await request('delete_chat', 'POST', {
            body: JSON.stringify({
                chat_id: this._id,
            }),
        });
        this._deleted = true;
    }
}
//# sourceMappingURL=Thread.js.map