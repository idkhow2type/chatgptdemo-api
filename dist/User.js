import { parse } from 'node-html-parser';
import { request, GenericInitialise } from './utils.js';
import { Headers } from 'node-fetch';
export default class User extends GenericInitialise {
    constructor(session = undefined) {
        super();
        this._session = session;
    }
    async initialise() {
        super.initialise();
        const page = parse(await (await request('', 'GET', {
            headers: new Headers({
                cookie: 'session=' + this._session,
            }),
        })).text());
        this._uid = page.querySelector('#USERID').innerText;
        this._token = page.querySelector('#TTT').innerText;
    }
    get uid() {
        return this._uid;
    }
    get token() {
        return this._token;
    }
    get session() {
        return this._session;
    }
    /**
     * getUserThreads
     */
    async getUserThreads() {
        const infos = await (await request('get_user_cbat', 'POST', {
            body: JSON.stringify({ user_id: this.uid }),
        })).json();
        return infos.map((info) => ({ id: info._id, name: info.chat_name }));
    }
}
//# sourceMappingURL=User.js.map