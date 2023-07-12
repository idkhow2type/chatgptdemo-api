import 'dotenv/config';
import { request, GenericInitialise } from './utils.js';
export default class Thread extends GenericInitialise {
    constructor(option, user) {
        super();
        this._name = option.name;
        this._id = option.id;
        this.user = user;
        this._messages = [];
    }
    async initialise() {
        super.initialise();
        if (this._name) {
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
            await this.refreshThread(this._id);
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
    /**
     * saveBotMessage
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
    async refreshThread(id = this._id) {
        const chat = await (await request('get_chat', 'POST', {
            body: JSON.stringify({
                chat_id: id,
            }),
        })).json();
        this._messages = chat.messages;
        this._id = id;
        this._name = chat.chat_name;
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
}
//# sourceMappingURL=Thread.js.map