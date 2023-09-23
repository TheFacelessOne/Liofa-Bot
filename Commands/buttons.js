const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('buttons')
		.setDescription('edit which buttons liofa displays')
		.addBooleanOption(trans => trans.setName('translator').setDescription('Link to Google Translate'))
		.addBooleanOption(vote => vote.setName('vote').setDescription('Vote for Liofa'))
		.addBooleanOption(undo => undo.setName('undo').setDescription('Undo infraction'))
		.addBooleanOption(get => get.setName('get').setDescription('Link to Liofa')),

	async execute(interaction) {
		let newButtons = await [interaction.options.getBoolean('translator'), interaction.options.getBoolean('vote'), interaction.options.getBoolean('undo'), interaction.options.getBoolean('get')];
		let transEmoji, voteEmoji, undoEmoji, getEmoji;
		const {
			button_translate : Btn0,
			button_vote : Btn1,
			button_undo : Btn2,
			button_support : Btn3,
		} = interaction.client.dbFunctions.getGuildData('SETTINGS', interaction.guild.id);
		const oldButtons = [Btn0, Btn1, Btn2, Btn3];
		for (let i = 0; i < oldButtons.length; i++) {
			if (typeof newButtons[i] !== 'boolean') {
				newButtons[i] = oldButtons[i];
			}
		}
		let updateButtons = {
			button_translate : newButtons[0],
			button_vote : newButtons[1],
			button_undo : newButtons[2],
			button_support : newButtons[3]
		};
		interaction.client.dbFunctions.updateGuildData('SETTINGS', interaction.guild.id, updateButtons);
		newButtons[0] ? transEmoji = '✅' : transEmoji = '❌';
		newButtons[1] ? voteEmoji = '✅' : voteEmoji = '❌';
		newButtons[2] ? undoEmoji = '✅' : undoEmoji = '❌';
		newButtons[3] ? getEmoji = '✅' : getEmoji = '❌';
		const buttonEmbed = new EmbedBuilder()
			.setColor('#00ff08')
			.setDescription(transEmoji + ' Translator\n' + voteEmoji + ' Vote\n' + undoEmoji + ' Undo\n' + getEmoji + ' Invite & Support ')
		interaction.reply({ embeds : [buttonEmbed] });
	},
};
