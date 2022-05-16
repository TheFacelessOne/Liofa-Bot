const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
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
		const toggleEmbed = {
			color: 0x0099ff,
			description: 'Liofa is turned **' + Response[GuildData.Settings.state] + '**',
		};
		if (GuildData.Settings.state == true){toggleEmbed.color = 0x23ee27;}
		if (GuildData.Settings.state == false){toggleEmbed.color = 0xff1818;}
		interaction.reply({ embeds : [toggleEmbed], ephemeral: false });
	},
};
