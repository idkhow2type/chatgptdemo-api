import 'dotenv/config';
import { Headers } from 'node-fetch';
export declare function request(route: string, method: string, options?: {
    headers?: Headers;
    body?: any;
}): Promise<Response>;
export declare class Base {
    private _isInit;
    constructor();
    /**
     * initialise
     */
    initialise(): void;
    protected _decorGlobal(callback: (methodName: string) => void, exclude?: Array<string>): void;
}
type Without<T, U> = {
    [P in Exclude<keyof T, keyof U>]?: never;
};
export type XOR<T, U> = T | U extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;
export {};
