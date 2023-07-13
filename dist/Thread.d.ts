import 'dotenv/config';
import { XOR, Base } from './utils.js';
import User from './User.js';
interface Message {
    user: string;
    user_time: number;
    bot: string;
    bot_time: number;
}
export default class Thread extends Base {
    private _name;
    private _id;
    private _messages;
    private _deleted;
    readonly user: User;
    constructor(option: XOR<{
        name: string;
    }, {
        id: string;
    }>, user: User);
    initialise(): Promise<void>;
    set name(name: string);
    private setNameAsync;
    get name(): string;
    get id(): string;
    get messages(): ReadonlyArray<Message>;
    get deleted(): boolean;
    /**
     * saveBotMessage
     * the api lets the client save bot messages manually for some reason
     * calling this is not recommended, but it is possible
     */
    saveBotMessage(botMessage: string, timestamp?: number): Promise<Response>;
    /**
     * refreshMessages
     */
    refresh(id?: string): Promise<void>;
    sendMessage(userMessage: string, save?: boolean): Promise<string>;
    /**
     * delete
     */
    delete(): Promise<void>;
}
export {};
