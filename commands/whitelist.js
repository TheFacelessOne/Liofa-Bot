const { SlashCommandBuilder } = require('@discordjs/builders');
const functions = require('../functions.js');

module.exports = {
	data : new SlashCommandBuilder()
		.setName('whitelist')
		.setDescription('Edit which words Liofa will ignore')
		.addStringOption(keyword => keyword.setName('keyword').setDescription('Word(s) to add to the whitelist').setRequired(false)),

	usage: '<words to add to the whitelist>',
	async execute(message) {
		const GuildData = functions.liofaRead(message.guild.id);
		let words = [];
		if (functions.liofaPrefixCheck(message)) {
			const args = message.content.split(' ');
			args.shift();
			words = args;
		}
		else if (message.options.getString('keyword')) {
			words = message.options.getString('keyword').split(' ');
		}
		if (typeof words[0] === 'string') {
			await whitelistToggle(message, words);
		}
		let list = '[';
		functions.liofaRead(message.guild.id).Settings.whitelist.forEach(element => list = list + element + '], [');
		list = list.slice(0, -3);
		message.reply('**Whitelisted Words:**\n' + list);
		return;

		// if you're adding a word or phrase
		async function whitelistToggle(interaction, toggleList) {
			const commandReply = await interaction.channel.send('Editing Whitelist...');
			let response = '';
			for (let i = 0; i < toggleList.length; i++) {
				const listLength = GuildData.Settings.whitelist.length;
				GuildData.Settings.whitelist = functions.arrayToggle(GuildData.Settings.whitelist, toggleList[i]);
				if (listLength > GuildData.Settings.whitelist.length) {
					response = response + '\n❌ `[' + words[i] + ']` removed from whitelist';
				}
				else {
					response = response + '\n✅ `[' + words[i] + ']` added to whitelist';
				}
			}
			commandReply.edit(response);
			functions.liofaUpdate(interaction, GuildData);

		}
	},

};