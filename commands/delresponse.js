const fs = require('fs');
const yaml = require('js-yaml');

module.exports = {
    name: 'delresponse',
    description: 'Delete a response by reaction name',
    options: [
        {
            name: 'reaction-name',
            description: 'The name of the reaction to delete',
            type: 3, // STRING
            required: true,
        },
    ],
    execute: async (interaction) => {
        const reactionName = interaction.options.getString('reaction-name');

        // Load existing data from responses.yml
        let data;
        try {
            const fileContents = fs.readFileSync('responses.yml', 'utf8');
            data = yaml.load(fileContents) || {};
        } catch (e) {
            return interaction.reply('No data found.');
        }

        if (!data.video || !data.video[reactionName]) {
            return interaction.reply(`No response found with the name: ${reactionName}`);
        }

        // Delete the entry
        delete data.video[reactionName];

        // Save the data back to responses.yml
        const yamlStr = yaml.dump(data);
        fs.writeFileSync('responses.yml', yamlStr, 'utf8');

        await interaction.reply(`Response with the name: ${reactionName} has been deleted.`);
    },
};
