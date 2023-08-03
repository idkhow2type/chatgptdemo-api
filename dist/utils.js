import { Headers } from 'node-fetch';
let secrets;
export function initialise(value) {
    secrets = value;
}
export async function request(route, method, options) {
    if (!secrets)
        throw new Error('Secrets not found');
    const { headers = new Headers(), body = null } = options;
    headers.set('cookie', `cf_clearance=${secrets.cf_clearance};${headers.get('cookie')}`);
    return await fetch('https://chat.chatgptdemo.net/' + route, {
        method: method,
        headers: new Headers([
            ...headers,
            ['authority', 'chat.chatgptdemo.net'],
            ['content-type', 'application/json'],
            ['referer', 'https://chat.chatgptdemo.net/'],
            ['user-agent', secrets.user_agent],
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