import { parse } from 'node-html-parser';
import { request, Base } from './utils.js';
import { Headers } from 'node-fetch';
import cookie from 'cookie';
export default class User extends Base {
    constructor(session = undefined) {
        super();
        this._session = session;
    }
    async initialise() {
        super.initialise();
        const res = await request('', 'GET', {
            headers: new Headers({
                cookie: 'session=' + this._session,
            }),
        });
        const page = parse(await res.text());
        function decodeString(encodedString, salt) {
            encodedString = decodeURIComponent(encodedString);
            var decodedString = '';
            for (var i = 0; i < encodedString.length; i++) {
                var charCode = encodedString.charCodeAt(i) - salt;
                decodedString += String.fromCharCode(charCode);
            }
            return decodedString;
        }
        this._session = cookie.parse(res.headers.get('Set-Cookie')).session;
        this._uid = page.querySelector('#USERID').innerText;
        this._token = decodeString(page.querySelector('#TTT').innerText, parseInt(page
            .querySelector('.right-side-container>script')
            .innerText.match(/(?<=new_token = decodeString\(token, )\d+(?=\);)/)[0]));
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
        const infos = await (await request('get_user_chat', 'POST', {
            body: JSON.stringify({ user_id: this._uid }),
        })).json();
        return infos.map((info) => ({ id: info._id, name: info.chat_name }));
    }
}
//# sourceMappingURL=User.js.map