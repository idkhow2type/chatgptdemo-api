import 'dotenv/config';
import { Headers } from 'node-fetch';
export async function request(route, method, options) {
    const { headers = new Headers(), body = null } = options;
    headers.set('cookie', `cf_clearance=${process.env.cf_clearance};${headers.get('cookie')}`);
    return await fetch('https://chat.chatgptdemo.net/' + route, {
        method: method,
        headers: new Headers([
            ...headers,
            ['authority', 'chat.chatgptdemo.net'],
            ['content-type', 'application/json'],
            ['user-agent', process.env.user_agent],
        ]),
        body,
    });
}
export class Base {
    constructor() {
        this._isInit = false;
        this._decorGlobal(() => {
            if (!this._isInit) {
                throw new Error('Uninitialised');
            }
        }, ['initialise']);
    }
    /**
     * initialise
     */
    initialise() {
        this._isInit = true;
    }
    _decorGlobal(callback, exclude = []) {
        const originalMethods = Object.getOwnPropertyNames(this.constructor.prototype);
        for (const methodName of originalMethods) {
            const originalMethod = this[methodName];
            if (typeof originalMethod === 'function' &&
                ![...exclude, 'constructor', '_decorGlobal'].includes(methodName)) {
                this[methodName] = function (...args) {
                    // Code snippet to be added to all methods
                    callback(methodName);
                    // Call the original method
                    return originalMethod.apply(this, args);
                };
            }
        }
    }
}
//# sourceMappingURL=utils.js.map