const { SlashCommandBuilder } = require('@discordjs/builders');
const functions = require('../functions.js');
const Response = {};
Response[true] = 'on';
Response[false] = 'off';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('toggle')
		.setDescription('toggles Liofa'),
	async execute(interaction) {
		const GuildData = functions.liofaRead(interaction.guild.id);
		if (typeof GuildData.Settings.state == 'boolean') {
			GuildData.Settings.state = !GuildData.Settings.state;
		}
		else {
			GuildData.Settings.state = true;
		}
		functions.liofaUpdate(interaction, GuildData);
		interaction.reply({ content: 'Liofa is turned ' + Response[GuildData.Settings.state], ephemeral: false });
	},
};