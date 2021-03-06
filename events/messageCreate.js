const functions = require('../functions.js');
const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
	name: 'messageCreate',
	async execute(msg) {
		if (runLiofa(msg) === false) return;

		try {
			const MessageContent = functions.liofaFilter(msg);
			if (!MessageContent || MessageContent.length < 4) return;
			const result = await functions.liofaCheck(MessageContent);
			if (!result) return;


			const GuildData = functions.liofaRead(msg.guild.id);
			// Checks list of allowed languages
			if (!GuildData.Settings.languages.includes(result.code) && parseInt(result.percent) >= 90) {

				// Warnings Check
				const warnCount = functions.liofaMod(msg, msg.author.id);
				const msgBeforeDeletion = parseInt(GuildData.Settings.warnings) + parseInt(GuildData.Settings.startwarnings);
				if (warnCount < msgBeforeDeletion && warnCount > GuildData.Settings.startwarnings) {
					const buttons = new MessageActionRow();
					let printButtons = false;
					if (GuildData.Settings.buttons.includes(true)) {
						printButtons = true;
						if (GuildData.Settings.buttons[0]) {
							buttons.addComponents(new MessageButton().setURL('https://translate.google.com').setLabel('🌍 Translator').setStyle('LINK'));
						}
						if (GuildData.Settings.buttons[1]) {
							buttons.addComponents(new MessageButton().setCustomId('result.name').setLabel(result.name + ' [' + result.percent + '%]').setStyle('PRIMARY').setDisabled(true));
						}
						if (GuildData.Settings.buttons[2]) {
							buttons.addComponents(new MessageButton().setCustomId('mod undo ' + msg.author.id).setLabel('Undo').setStyle('DANGER'));
						}
						if (GuildData.Settings.buttons[3]) {
							buttons.addComponents(new MessageButton().setCustomId('invite links').setLabel('Get Liofa!').setStyle('SUCCESS'));
						}
					}

					const LiofaMessages = require('../Read Only/Responses');
					// Checks if output for given language is available
					if (typeof LiofaMessages[result.code] === 'string') {
						if (printButtons) {
							msg.reply({ content : '<@' + msg.author.id + '> **' + LiofaMessages[result.code] + '**', components : [buttons] });
						}
						else {
							msg.reply({ content : '<@' + msg.author.id + '> **' + LiofaMessages[result.code] + '**' });
						}
					}
					else {
						if (printButtons) {
							msg.reply({ content : '**Please speak English.**', components : [buttons] });
						}
						else {
							msg.reply({ content : '**Please speak English.**' });
						}
						msg.channel.send(result.name + ' must be added to Languages. Please report this bug on my support server A link can be found in my bio. code: `[' + result.code + ']`');
					}
				}
				else if (warnCount == msgBeforeDeletion) {
					msg.reply('<@' + msg.author.id + '> All further messages will be deleted unless you speak in English');
				}
				else if (warnCount > msgBeforeDeletion) {
					msg.delete();
				}
			}
		}
		// Returns error for when language cannot be detected
		catch (err) {
			console.log(msg.content);
			console.log(err);
			return;
		}

		function runLiofa(txt) {
			// Checks if it's a Bot
			if (txt.author.bot === true) return false;
			const GuildData = functions.liofaRead(txt.guild.id);

			if (functions.liofaPrefixCheck(txt)) {
				const args = txt.content.slice(GuildData.Settings.prefix.length).trim().split(' ');

				// Checks command exists
				const command = txt.client.commands.get(args.shift().toLowerCase());
				if (!command) return true;

				try {
					// Checks you have permission to run the command
					if (functions.liofaPermsCheck(txt, command)) {
						command.execute(txt);
					}
					else {
						txt.reply({ content : 'You have insufficient permissions 😬', ephemeral : true });
					}
					return false;
				}
				catch (error) {
					console.error(error);
					txt.reply('Something went wrong! 😲');
				}
			}
			else if (functions.liofaExcludedRolesOrChannels(txt)) {
				return false;
			}
			return GuildData.Settings.state;
		}
	},
};