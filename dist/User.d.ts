import { GenericInitialise } from './utils.js';
export default class User extends GenericInitialise {
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
    getUserThreads(): Promise<void>;
}
