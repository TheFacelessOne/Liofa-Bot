const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
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

		const toggleEmbed = new EmbedBuilder()
			.setColor(0x0099ff)
			.setDescription('Liofa is turned **' + Response[GuildData.Settings.state] + '**');

		GuildData.Settings.state ? toggleEmbed.setColor(0x23ee27) : toggleEmbed.setColor(0xff1818);
		interaction.reply({ embeds : [toggleEmbed], ephemeral: false });
	},
};
