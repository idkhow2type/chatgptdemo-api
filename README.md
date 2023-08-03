# chatgptdemo.net API wrapper

A reverse engineered wrapper for a hidden API on [chatgptdemo.net](https://chat.chatgptdemo.net) that lets you use GPT 3.5 for free

## Installation
```console
npm i git+https://github.com/idkhow2type/chatgptdemo-api.git
```

## Usage
1. Go to [chatgptdemo.net](https://chat.chatgptdemo.net), get the `cf_clearance` cookie and user agent
2. Initialise with the `cf_clearance` cookie and user agent
    ```ts
    import { Thread, User, initialise } from './index.js';
    initialise({
        cf_clearance: '<cf_clearance>',
        user_agent: '<user agent>',
    });

    // ...
    ```

### User
A user can be initialised with no arguments or with a session cookie. Using a session cookie will help retain the same user reference across multiple object instances. If no session cookie is given, a new user will be created every time
```ts
let user = new User();
await user.initialise();
console.log(user.uid) // change every time called

let user = new User('some session cookie');
await user.initialise();
console.log(user.uid) // the same every time called
```
An user's session can be get with `user.session` to store for further usage
```ts
let user1 = new User();
await user1.initialise();

let session = user1.session

let user2 = new User(session);
await user2.initialise();

console.log(user1.uid === user2.uid) // true
```

### Thread
A thread needs to be initialised with either a name or an id (not both), and a user. If an id is given, the user must have a thread with that id. If a name is given, either an existing thread with that name will be picked or a new thread will be created with that name
```ts
let user = new User();
await user.initialise();

const thread1 = new Thread({ name: 'My thread' }, user)
await thread1.initialise()

const thread2 = new Thread({ name: 'My thread' }, user)
await thread2.initialise()

console.log(thread1.id === thread2.id) // true

const thread3 = new Thread({ id: thread1.id }, user)
await thread3.initialise()

console.log(thread3.name) // My thread
```
`User.getUserThreads` is used to get the id and name of all chat threads belonging to an user
```ts
let user = new User();
await user.initialise();
const thread1 = new Thread({ name: 'My thread 1' }, user)
await thread1.initialise()
const thread2 = new Thread({ name: 'My thread 2' }, user)
await thread2.initialise()
const thread3 = new Thread({ name: 'My thread 3' }, user)
await thread3.initialise()
```
```ts
[
  { id: '64cc0955cf7cd29d129e36d8', name: 'My thread 1' },
  { id: '64cc0956cf7cd29d129e36dc', name: 'My thread 2' },
  { id: '64cc095685253ccba13a1fff', name: 'My thread 3' }
]
```
To send messages in a thread, use `Thread.sendMessage`
```ts
console.log(await thread.sendMessage('hello world'))
```
`Thread.sendMessage` has an option for whether to save the response in the chat history. If this is set to `false`, the message won't be saved and the model won't remember ever responding. This option is `true` by default
```ts
console.log(await thread.sendMessage('hello world',false))
```
The chat history is saved in `Thread.messages`
```ts
console.log(await thread.sendMessage('5+9'))
console.log(await thread.sendMessage('largest state in US'))
console.log(thread.messages);
```
```ts
[
  {
    user: '5+9',
    user_time: 1691091899698,
    bot: 'The sum of 5 and 9 is 14.',
    bot_time: 1691091900495
  },
  {
    user: 'largest state in US',
    user_time: 1691091900499,
    bot: 'The largest state in the United States is Alaska.',
    bot_time: 1691091901883
  }
]
```
`Thread.refresh` can be called to make sure the message history is up to date
```ts
await thread.refresh()
console.log(thread.messages);
```
```ts
[
  {
    user: '5+9',
    user_time: 1691091899698,
    bot: 'The sum of 5 and 9 is 14.',
    bot_time: 1691091900495
  },
  {
    user: 'largest state in US',
    user_time: 1691091900499,
    bot: 'The largest state in the United States is Alaska.',
    bot_time: 1691091901883
  }
]
```
One important note is **`Thread.sendMessage` does not wait for messages to complete saving and `Thread.messages` is updated locally first**. This feature is meant to decrease waiting time, but could mean that an interuption such as calling `Thread.refresh` right after sending a message could result in that message not saving properly.

`Thread.delete` can be called to delete a thread
```ts
await thread.delete()
console.log(thread.deleted) // true
```

## Misc notes/features
- `Thread.saveBotMessage` can be used to set the last bot message to any string, though this is not recommended
- `User.token` is a read only value used internally for making requests. You most likely won't need to use this
- Any user can access any thread if given the thread id, the wrapper protects against this but it is possible

## Legal notice
I am not affiliated with OpenAI, this project can probably get me sued, use at your own risk