import 'dotenv/config';
import { Headers } from 'node-fetch';

export async function request(
    route: string,
    method: string,
    options: { headers?: Headers; body?: any }
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
