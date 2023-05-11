const functions = require('../functions.js');
const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
	name: 'MessageCreate',
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
					const buttons = new MessageActionRow()
						.addComponents(
							new MessageButton().setURL('https://translate.google.com').setLabel('🌍 Translator').setStyle('LINK'),
							new MessageButton().setCustomId('result.name').setLabel(result.name + ' [' + result.percent + '%]').setStyle('PRIMARY').setDisabled(true),
							new MessageButton().setCustomId('mod undo ' + msg.author.id).setLabel('Undo').setStyle('DANGER'),
							new MessageButton().setCustomId('invite links').setLabel('Get Liofa!').setStyle('SUCCESS'),
						);

					const LiofaMessages = require('../Read Only/Responses');
					// Checks if output for given language is available
					if (typeof LiofaMessages[result.code] === 'string') {
						msg.reply({ content : '<@' + msg.author.id + '> **' + LiofaMessages[result.code] + '**', components : [buttons] });
					}
					else {
						msg.reply('<@' + msg.author.id + '> **Please speak English.** \n `[' + result.name + '] [' + result.percent + '%]`');
						msg.reply({ content : '**Please speak English.**', components : [buttons] });
						msg.channel.send(result.name + ' must be added to Languages. code: `[' + result.code + ']`');
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