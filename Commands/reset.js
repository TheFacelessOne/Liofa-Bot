const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');

module.exports = {
	data : new SlashCommandBuilder()
		.setName('reset')
		.setDescription('Reset Server Settings to default'),

	async execute(interaction) {
		const buttons = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('reset confirm').setLabel('Confirm').setStyle(ButtonStyle.Success),
				new ButtonBuilder()
					.setCustomId('reset cancel').setLabel('Cancel').setStyle(ButtonStyle.Danger),
			);
		await interaction.reply({ content: 'Are you sure you want to reset your settings?', components: [buttons] });
		return;
	},
	buttons : {
		'confirm' : async function confirm(interaction) {
			interaction.client.dbFunctions.addGuild(interaction.guild.id);
			console.log('Created settings file for ' + interaction.guild.id.toString());
			const message = await interaction.message.fetch();
			message.delete();
			return interaction.channel.send('✅ Settings have been reset');
		},
		'cancel' : async function cancel(interaction) {
			const message = await interaction.message.fetch();
			message.delete();
			return interaction.channel.send('❌ Reset Cancelled');
		},
	},
};
