import 'dotenv/config';
import { request } from './utils.js';
import User from './User.js';

interface Message {
    user: string;
    user_time: number;
    bot: string;
    bot_time: number;
}

export default class Thread {
    private _name: string;
    private _id: string;
    private _messages: Array<Message>;
    private _isInit: boolean;
    readonly user: User;
    constructor(name: string, user: User) {
        this._name = name;
        this.user = user;
        this._messages = [];
        this._isInit = false;
    }

    public async initialise() {
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
        this._isInit = true;
    }

    public set name(name: string) {
        if (!this._isInit) {
            throw new Error('Uninitialised');
        }
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
        if (!this._isInit) {
            throw new Error('Uninitialised');
        }
        return this._name;
    }

    public get id(): string {
        if (!this._isInit) {
            throw new Error('Uninitialised');
        }
        return this._id;
    }

    public get messages(): Array<Message> {
        if (!this._isInit) {
            throw new Error('Uninitialised');
        }
        return this._messages;
    }

    /**
     * sendMessage
     */
    public async sendMessage(userMessage: string, save: boolean = true) {
        if (!this._isInit) {
            throw new Error('Uninitialised');
        }

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

        
    }
}
