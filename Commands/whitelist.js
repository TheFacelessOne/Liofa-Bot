const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { arrayToggle, arrayString } = require('../functions.js');

module.exports = {
	data : new SlashCommandBuilder()
		.setName('whitelist')
		.setDescription('Edit which words Liofa will ignore')
		.addStringOption(keyword => keyword.setName('keyword').setDescription('Word(s) to add to the whitelist').setRequired(false)),

	usage: '<words to add to the whitelist>',
	async execute(interaction) {
		const { ignored_words : whitelistWords } = interaction.client.dbFunctions.getGuildData('SETTINGS', interaction.guild.id);
		const whitelist = JSON.parse(whitelistWords);
		let words = [];
		if (interaction.options.getString('keyword')) {
			words = interaction.options.getString('keyword').split(' ');
		}
		if (typeof words[0] === 'string') {
			await whitelistToggle(interaction, words, whitelist);
		}
		else {
			let list = '[';
			if (whitelist.length == 0){
				list = 'Empty';
			}
			else {
				whitelist.forEach(element => list = list + element + '], [');
				list = list.slice(0, -3);
			}
			const whiteEmbed = new EmbedBuilder()
				.setColor('#e1c4ff')
				.setTitle('**Whitelisted Words:**')
				.setDescription(list)
				.setFooter({text:'Use /whitelist <words to add/remove> to edit the whitelist'});
			return interaction.reply({ embeds : [whiteEmbed] });
		}
		// if you're adding a word or phrase
		async function whitelistToggle(interaction, words, whitelist) {
			const commandReply = await interaction.channel.send('Editing Whitelist...');
			let updatedList = whitelist;
			let response = '';
			for (let i = 0; i < words.length; i++) {
				const listLength = updatedList.length;
				updatedList = arrayToggle(updatedList, words[i]);
				if (listLength > updatedList.length) {
					response = response + '\n❌ `[' + words[i] + ']` removed from whitelist';
				}
				else {
					response = response + '\n✅ `[' + words[i] + ']` added to whitelist';
				}
			}

			let list = '[';
			if (updatedList.length == 0){
				list = 'Empty';
			}
			else {
				updatedList.forEach(element => list = list + element + '], [');
				list = list.slice(0, -3);
			}
			const togglelistEmbed = new EmbedBuilder()
				.setColor('#e1c4ff')
				.setTitle('**Whitelisted Words:**')
				.setDescription(list + '\n' + response)
				.setFooter({text: 'Use /whitelist <words to add/remove> to edit the whitelist'});
			interaction.reply({ embeds : [togglelistEmbed] });
			commandReply.delete();

			updatedList = arrayString(updatedList);
			const newWhitelist = { ignored_words: updatedList };
			interaction.client.dbFunctions.updateGuildData('SETTINGS', interaction.guild.id, newWhitelist);
		}
	},
};
