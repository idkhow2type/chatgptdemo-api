import 'dotenv/config';
import { Headers } from 'node-fetch';

export async function request(
    route: string,
    method: string,
    options?: { headers?: Headers; body?: any }
) {
    const { headers = new Headers(), body = null } = options;

    headers.set(
        'cookie',
        `cf_clearance=${process.env.cf_clearance};${headers.get('cookie')}`
    );

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

export class GenericInitialise {
    private _isInit: boolean;
    constructor() {
        this._isInit = false;
        const originalMethods = Object.getOwnPropertyNames(
            this.constructor.prototype
        );
        for (const methodName of originalMethods) {
            const originalMethod = this[methodName];
            if (
                typeof originalMethod === 'function' &&
                methodName !== 'initialise'
            ) {
                this[methodName] = function (...args: any[]) {
                    // Code snippet to be added to all methods
                    if (!this._isInit) {
                        throw new Error('Uninitialised');
                    }

                    // Call the original method
                    return originalMethod.apply(this, args);
                };
            }
        }
    }
    /**
     * initialise
     */
    public initialise() {
        this._isInit = true;
    }
}

type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
export type XOR<T, U> = T | U extends object
    ? (Without<T, U> & U) | (Without<U, T> & T)
    : T | U;
