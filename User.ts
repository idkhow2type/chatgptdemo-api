import { parse } from 'node-html-parser';
import { request, GenericInitialise } from './utils.js';
import { Headers } from 'node-fetch';

interface ThreadInfo {
    id: string;
    name: string;
}

export default class User extends GenericInitialise {
    private _session: string;
    private _uid: string;
    private _token: string;
    constructor(session: string = undefined) {
        super();
        this._session = session;
    }
    async initialise() {
        super.initialise();
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
        const infos: Array<any> = await (
            await request('get_user_chat', 'POST', {
                body: JSON.stringify({ user_id: this._uid }),
            })
        ).json();
        return infos.map(
            (info) => ({ id: info._id, name: info.chat_name } as ThreadInfo)
        );
    }
}
