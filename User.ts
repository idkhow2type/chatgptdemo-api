import { parse } from 'node-html-parser';
import { request, GenericInitialise } from './utils.js';
import { Headers } from 'node-fetch';

export default class User extends GenericInitialise {
    private _session: string;
    private _uid: string;
    private _token: string;
    constructor(session: string = undefined) {
        super();
        this._session = session;
    }
    async initialise() {
        super.initialise()
        const page = parse(
            await (
                await request('', 'GET', {
                    headers: new Headers({
                        cookie: 'session=' + this._session,
                    }),
                })
            ).text()
        );
        this._uid = page.querySelector('#USERID').innerText;
        this._token = page.querySelector('#TTT').innerText;
    }

    public get uid(): string {
        return this._uid;
    }

    public get token(): string {
        return this._token;
    }

    public get session(): string {
        return this._session;
    }

    /**
     * getUserThreads
     */
    public async getUserThreads() {
        request('get_user_cbat', 'POST', {
            body: JSON.stringify({ user_id: this.uid }),
        });
    }
}
