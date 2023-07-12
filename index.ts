import 'dotenv/config';
import User from './User.js';
import Thread from './Thread.js';

const user = new User();
await user.initialise();
const thread = new Thread('my chat', user);
await thread.initialise();

console.log(await thread.sendMessage('Đám mây có ngon không'));
