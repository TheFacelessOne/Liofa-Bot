const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { liofaUpdate, liofaRead } = require('../functions.js');
const Response = {};
Response[true] = 'on';
Response[false] = 'off';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('toggle')
		.setDescription('toggles Liofa'),
	async execute(interaction) {
		let updateState;
		const { state: readState } = interaction.client.dbFunctions.getGuildData('SETTINGS', interaction.guild.id);
		let boolState = Boolean(readState);
		if (typeof boolState == 'boolean') {
			updateState = { state: !boolState };
		}
		else {
			updateState = { state: true };
		}
		interaction.client.dbFunctions.updateGuildData('SETTINGS', interaction.guild.id, updateState);
		const { state: newState } = interaction.client.dbFunctions.getGuildData('SETTINGS', interaction.guild.id);
		const toggleEmbed = new EmbedBuilder()
			.setColor(0x0099ff)
			.setDescription('Liofa is turned **' + Response[Boolean(newState)] + '**');

		newState ? toggleEmbed.setColor(0x23ee27) : toggleEmbed.setColor(0xff1818);
		interaction.reply({ embeds : [toggleEmbed], ephemeral: false });
	},
};
