module.exports = {
    name: 'ping',
    description: 'Returns the latency between the client and the bot, as well as the bot and Discord',
    execute: async (interaction) => {
        const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
        const botLatency = sent.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = Math.round(interaction.client.ws.ping);

        await interaction.editReply(`Bot latency: ${botLatency}ms\nDiscord latency: ${apiLatency}ms`);
    },
};
