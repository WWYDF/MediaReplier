const axios = require('axios');
const fs = require('fs');
const yaml = require('js-yaml');

async function fetchAndSendVideo(reactionName, context) {
    // Load existing data from responses.yml
    let data;
    try {
        const fileContents = fs.readFileSync('responses.yml', 'utf8');
        data = yaml.load(fileContents) || {};
    } catch (e) {
        console.error('Error reading YAML file: ', e);
        await context.reply('Error reading the data file.');
        return;
    }

    // Check if the reaction name exists in the data
    const response = data.video[reactionName];
    if (!response) {
        console.error(`No response found for the given reaction name. (${reactionName})`);
        await context.reply(`Could not find specified video '${reactionName}'`);
        return;
    }

    const { 'channel-id': channelId, 'message-id': messageId } = response;

    // Fetch the message from Discord API
    try {
        const url = `https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`;
        const config = {
            headers: {
                Authorization: `Bot ${process.env.TOKEN}`,
            },
        };
        const result = await axios.get(url, config);
        const messageData = result.data;

        // Check for attachments and send the URL
        if (messageData.attachments.length > 0) {
            const attachmentUrl = messageData.attachments[0].url;
            if (context.reference) {
                const originalMessage = await context.channel.messages.fetch(context.reference.messageId);
                await originalMessage.reply(`${attachmentUrl}`);
            } else {
                await context.channel.send(`${attachmentUrl}`);
            }
        } else {
            throw new Error('No attachments found in the specified message.');
        }
    } catch (error) {
        console.error('Error fetching message: ', error);
        await context.reply('Error fetching the message.');
    }
}

module.exports = {
    name: 'video',
    description: 'Get the video URL associated with a reaction name',
    options: [
        {
            name: 'reaction-name',
            description: 'The name of the reaction',
            type: 3, // STRING
            required: true,
            autocomplete: true,
        },
    ],
    execute: async (interaction) => {
        const reactionName = interaction.options.getString('reaction-name');
        fetchAndSendVideo(reactionName, interaction);
    },
    fetchAndSendVideo,
    autocomplete: async (interaction) => {
        // Load existing data from responses.yml
        let data;
        try {
            const fileContents = fs.readFileSync('responses.yml', 'utf8');
            data = yaml.load(fileContents) || {};
        } catch (e) {
            console.error('Error reading YAML file: ', e);
            return interaction.respond([]);
        }

        const focusedValue = interaction.options.getFocused();
        const choices = Object.keys(data.video);
        const filtered = choices.filter(choice => choice.toLowerCase().includes(focusedValue.toLowerCase()));

        await interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice }))
        );
    },
};
