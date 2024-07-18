const fs = require('fs');
const yaml = require('js-yaml');

module.exports = {
    name: 'addresponse',
    description: 'Add a response with a message ID and reaction name',
    options: [
        {
            name: 'message-id',
            description: 'The ID of the message',
            type: 3, // STRING
            required: true,
        },
        {
            name: 'reaction-name',
            description: 'The name of the reaction',
            type: 3, // STRING
            required: true,
        },
    ],
    execute: async (interaction) => {
        const messageId = interaction.options.getString('message-id');
        const reactionName = interaction.options.getString('reaction-name');
        const channelId = interaction.channelId;  // Get the channel ID
        const userId = interaction.user.id;  // Get the user ID

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

        await interaction.reply(`Response added for message ID: ${messageId} with reaction: ${reactionName}`);
    },
};
