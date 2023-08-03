import { parse } from 'node-html-parser';
import { request, Base } from './utils.js';
import { Headers } from 'node-fetch';
import cookie from 'cookie';

interface ThreadInfo {
    id: string;
    name: string;
}

export default class User extends Base {
    private _session: string;
    private _uid: string;
    private _token: string;
    constructor(session: string = undefined) {
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
        this._token = decodeString(
            page.querySelector('#TTT').innerText,
            parseInt(
                page
                    .querySelector('.right-side-container>script')
                    .innerText.match(
                        /(?<=new_token = decodeString\(token, )\d+(?=\);)/
                    )[0]
            )
        );
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
