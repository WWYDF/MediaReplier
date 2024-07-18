# MediaReplier
*(currently only supports videos)*

## Installation Instructions
1. Download the source code as zip.
2. Extract and open folder.
3. Open terminal and run `npm install`.
4. Once done, rename `.env.example` to `.env`.
5. Open the `.env` and set the `TOKEN=` to your bot's [token](https://discord.com/developers/applications).
6. Then set `CLIENT_ID=` to your bot's Application ID.
7. Save that, then type `node index.js` into the terminal and press enter.
	1. It should say `Logged in as <Bot name>#<Bot tag>!`
8. In the Discord Developer Portal, go to your bot, then the **Bot** tab.
9. Enable all Intents.
10. Navigate to **OAuth2** tab.
11. Click on `bot` and `applications.commands`.
12. Give the bot the following permissions:
	1. Read Messages/View Channels
	2. Send Messages
	3. Send Messages in Threads
	4. Manage Messages
	5. Embed Links
	6. Attach Files
	7. Add Reactions
	8. *(Or just Administrator if you're lazy.)*
13. Copy the URL and go to it to invite the bot to your server.
14. You can use tools like pm2 to keep the nodejs script running.

## Usage Instructions

### Slash Commands
`<>` arguments are required, `[]` are optional, `()` is default.

| Command      | Arguments                      | Description                              |
| :----------- | :----------------------------- | :--------------------------------------- |
| /addresponse | `<message-id> <reaction-name>` | Add a video to the database.             |
| /delresponse | `<reaction-name>`              | Removes a video from the database.       |
| /list        | `[media type (video)]`         | Lists all registered videos in database. |
| /video       | `<reaction-name>`              | Returns selected video in chat.          |
| /ping        | N/A                            | Returns latency information.             |

### Quick Commands
These are prefixed with `!`. This can be changed in `index.js` here:
```javascript
if (message.content.startsWith('!'))
```

| Command            | Arguments         | Description                                                                             |
| :----------------- | :---------------- | :-------------------------------------------------------------------------------------- |
| `!<reaction-name>` | N/A               | Quickly returns selected video in chat.<br>*Can be used to reply to a message.*         |
| `!addr`            | `<reaction-name>` | **Reply to a message** containing a video<br>with this to quick add it to the database. |

If a message contains an invalid name, nothing will happen to prevent false-positives.