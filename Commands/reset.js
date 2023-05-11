const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');
const fs = require('fs');

module.exports = {
	data : new SlashCommandBuilder()
		.setName('reset')
		.setDescription('Reset Server Settings to default'),

	async execute(interaction) {
		const buttons = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('reset confirm').setLabel('Confirm').setStyle('SUCCESS'),
				new MessageButton()
					.setCustomId('reset cancel').setLabel('Cancel').setStyle('DANGER'),
			);
		await interaction.reply({ content: 'Are you sure you want to reset your settings?', components: [buttons] });
		return;
	},
	buttons : {
		'confirm' : async function confirm(interaction) {
			const tempSettings = JSON.parse(fs.readFileSync('Read Only/Settings.json'));
			fs.writeFileSync('Server Data/' + interaction.guild.id + '.json', JSON.stringify(tempSettings, null, 2));
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
