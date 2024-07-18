const fs = require('fs');
const yaml = require('js-yaml');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'list',
    description: 'List all registered responses with pagination',
    options: [
        {
            name: 'media-type',
            description: 'The type of media to list',
            type: 3, // STRING
            required: false,
            choices: [
                {
                    name: 'video',
                    value: 'video',
                },
                // Add other media types here if needed
            ],
        },
    ],
    execute: async (interaction) => {
        const mediaType = interaction.options.getString('media-type') || 'video';

        // Load existing data from responses.yml
        let data;
        try {
            const fileContents = fs.readFileSync('responses.yml', 'utf8');
            data = yaml.load(fileContents) || {};
        } catch (e) {
            return interaction.reply('No data found.');
        }

        if (!data[mediaType]) {
            return interaction.reply(`No responses found for media type: ${mediaType}`);
        }

        const entries = Object.entries(data[mediaType]);
        const pageSize = 5;
        const totalPages = Math.ceil(entries.length / pageSize);

        const createEmbed = (page) => {
            const embed = new EmbedBuilder()
                .setTitle(`${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} Responses`)
                .setDescription(
                    entries.slice(page * pageSize, (page + 1) * pageSize)
                        .map(([key, value], index) => `${page * pageSize + index + 1}. ${key} (by <@${value['user-id']}>)`)
                        .join('\n')
                )
                .setFooter({ text: `Page ${page + 1} of ${totalPages}` });
            return embed;
        };

        const createButtons = (page) => {
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('prev')
                        .setLabel('Previous')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === 0),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('Next')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === totalPages - 1)
                );
            return row;
        };

        await interaction.reply({
            embeds: [createEmbed(0)],
            components: [createButtons(0)],
        });

        const filter = i => i.customId === 'prev' || i.customId === 'next';
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

        let currentPage = 0;
        collector.on('collect', async i => {
            if (i.customId === 'prev') {
                currentPage = Math.max(currentPage - 1, 0);
            } else if (i.customId === 'next') {
                currentPage = Math.min(currentPage + 1, totalPages - 1);
            }
            await i.update({
                embeds: [createEmbed(currentPage)],
                components: [createButtons(currentPage)],
            });
        });
    },
};
