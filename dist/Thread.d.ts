import 'dotenv/config';
import { XOR, GenericInitialise } from './utils.js';
import User from './User.js';
interface Message {
    user: string;
    user_time: number;
    bot: string;
    bot_time: number;
}
export default class Thread extends GenericInitialise {
    private _name;
    private _id;
    private _messages;
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
    /**
     * saveBotMessage
     */
    saveBotMessage(botMessage: string, timestamp?: number): Promise<Response>;
    /**
     * refreshMessages
     */
    refreshThread(id?: string): Promise<void>;
    sendMessage(userMessage: string, save?: boolean): Promise<string>;
}
export {};
