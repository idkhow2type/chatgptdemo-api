import { parse } from 'node-html-parser';
import { request } from './utils.js';
import { Headers } from 'node-fetch';

export default class User {
    private _session: string;
    private _uid: string;
    private _token: string;
    private _isInit: boolean;
    constructor(session: string = undefined) {
        this._session = session;
        this._isInit = false;
    }
    async initialise() {

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
        this._isInit = true;
    }

    public get uid(): string {
        if (!this._isInit) {
            throw new Error('Uninitialised');
        }
        return this._uid;
    }

    public get token(): string {
        if (!this._isInit) {
            throw new Error('Uninitialised');
        }
        return this._token;
    }
}
