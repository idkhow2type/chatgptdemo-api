import { Base } from './utils.js';
interface ThreadInfo {
    id: string;
    name: string;
}
export default class User extends Base {
    private _session;
    private _uid;
    private _token;
    constructor(session?: string);
    initialise(): Promise<void>;
    get uid(): string;
    get token(): string;
    get session(): string;
    /**
     * getUserThreads
     */
    getUserThreads(): Promise<ThreadInfo[]>;
}
export {};
