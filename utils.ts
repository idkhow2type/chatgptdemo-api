import { Headers } from 'node-fetch';

// kinda hacky but it gives nice user experience
interface secretsInterface {
    cf_clearance: string;
    user_agent: string;
}
let secrets: secretsInterface;
export function initialise(value: secretsInterface) {
    secrets = value;
}

export async function request(
    route: string,
    method: string,
    options?: { headers?: Headers; body?: any },
) {
    if (!secrets) throw new Error('Secrets not found');

    const { headers = new Headers(), body = null } = options;

    headers.set(
        'cookie',
        `cf_clearance=${secrets.cf_clearance};${headers.get('cookie')}`
    );

    return await fetch('https://chat.chatgptdemo.net/' + route, {
        method: method,
        headers: new Headers([
            ...headers,
            ['authority', 'chat.chatgptdemo.net'],
            ['content-type', 'application/json'],
            ['referer','https://chat.chatgptdemo.net/'],
            ['user-agent', secrets.user_agent],
        ]),
        body,
    });
}

export class Base {
    private _isInit: boolean;
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
    public initialise() {
        this._isInit = true;
    }

    protected _decorGlobal(
        callback: (methodName: string) => void,
        exclude: Array<string> = []
    ) {
        const originalMethods = Object.getOwnPropertyNames(
            this.constructor.prototype
        );
        for (const methodName of originalMethods) {
            const originalMethod = this[methodName];
            if (
                typeof originalMethod === 'function' &&
                ![...exclude, 'constructor', '_decorGlobal'].includes(
                    methodName
                )
            ) {
                this[methodName] = function (...args: any[]) {
                    // Code snippet to be added to all methods
                    callback(methodName);

                    // Call the original method
                    return originalMethod.apply(this, args);
                };
            }
        }
    }
}

type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
export type XOR<T, U> = T | U extends object
    ? (Without<T, U> & U) | (Without<U, T> & T)
    : T | U;
