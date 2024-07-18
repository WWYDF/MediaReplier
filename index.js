const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const yaml = require('js-yaml');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.commands = new Collection();

// Load command files
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    // Set the bot's presence (status message)
    client.user.setPresence({
        activities: [{ name: 'over the boys.', type: 'WATCHING' }], // You can change the type to PLAYING, LISTENING, etc.
        status: 'online', // You can also set it to 'idle', 'dnd' (Do Not Disturb), or 'invisible'
    });
});

client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName);

        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    } else if (interaction.isAutocomplete()) {
        const command = client.commands.get(interaction.commandName);

        if (!command) return;

        try {
            await command.autocomplete(interaction);
        } catch (error) {
            console.error(error);
        }
    }
});

client.on('messageCreate', async message => {
    if (message.author.bot) return; // Ignore bot messages

    if (message.content.startsWith('!')) {
        const args = message.content.slice(1).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        if (commandName === 'addr') {
            if (!message.reference) {
                return message.reply('You must use this command in response to a message containing a video.');
            }

            const reactionName = args.join(' ');
            if (!reactionName) {
                return message.reply('You must provide a name for the video.');
            }

            try {
                const referencedMessage = await message.channel.messages.fetch(message.reference.messageId);
                if (!referencedMessage || referencedMessage.attachments.size === 0) {
                    return message.reply('The replied message does not contain any video attachments.');
                }

                const videoAttachment = referencedMessage.attachments.find(attachment => attachment.contentType && attachment.contentType.startsWith('video/'));
                if (!videoAttachment) {
                    return message.reply('The replied message does not contain any video attachments.');
                }

                const messageId = referencedMessage.id;
                const channelId = referencedMessage.channel.id;
                const userId = message.author.id;

                // Load existing data from responses.yml
                let data;
                try {
                    const fileContents = fs.readFileSync('responses.yml', 'utf8');
                    data = yaml.load(fileContents) || {};
                } catch (e) {
                    data = { video: {} };
                }

                // Ensure the 'video' property exists
                if (!data.video) {
                    data.video = {};
                }

                // Add the new entry
                data.video[reactionName] = {
                    'channel-id': channelId,
                    'message-id': messageId,
                    'user-id': userId,
                };

                // Save the data back to responses.yml
                const yamlStr = yaml.dump(data);
                fs.writeFileSync('responses.yml', yamlStr, 'utf8');

                await message.reply(`Response added for message ID: ${messageId} with reaction: ${reactionName}`);
            } catch (error) {
                console.error('Error adding video response:', error);
                await message.reply('There was an error while adding the video response.');
            }
        } else {
            const command = client.commands.get('video');
            if (commandName && command) {
                try {
                    await command.fetchAndSendVideo(commandName, message);
                    await message.delete();
                } catch (error) {
                    console.error('Error fetching and sending video:', error);
                    // Do nothing if there is no response matching the given reaction name
                }
            }
        }
    }
});

client.login(process.env.TOKEN);
