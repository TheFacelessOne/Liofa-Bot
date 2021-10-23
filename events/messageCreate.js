const functions = require('../functions.js');
const fs = require('fs');

module.exports = {
	name: 'messageCreate',
	async execute(msg) {
		if (runLiofa(msg) === false) return;

		try {
			const MessageContent = functions.liofaFilter(msg);
			if (!MessageContent) return;
			const result = await functions.liofaCheck(MessageContent);


			const GuildData = functions.liofaRead(msg.guild.id);
			// Checks list of allowed languages
			if (!GuildData.Settings.languages.includes(result.code)) {

				// Warnings Check
				const warnCount = liofaMod(msg);
				const msgBeforeDeletion = parseInt(GuildData.Settings.warnings) + parseInt(GuildData.Settings.startwarnings);
				if (warnCount < msgBeforeDeletion && warnCount > GuildData.Settings.startwarnings) {

					const LiofaMessages = require('./Read Only/Responses');
					// Checks if output for given language is available
					if (typeof LiofaMessages[result.code] === 'string') {
						msg.reply('**' + LiofaMessages[result.code] + '** \n `[' + result.name + '] [' + result.percent + '%] code: [' + result.code + ']`');
					}
					else {
						msg.reply('**Please speak English.** \n `[' + result.name + '] [' + result.percent + '%]`');
						msg.channel.send(result.name + ' must be added to Languages. code: `[' + result.code + ']`');
					}
				}
				else if (warnCount == msgBeforeDeletion) {
					msg.reply('All further messages will be deleted unless you speak in English');
				}
				else if (warnCount > msgBeforeDeletion) {
					msg.delete();
				}
			}
		}
		// Returns error for when language cannot be detected
		catch (err) {
			console.log(msg.content);
			console.log('Probably failed to translate');
			return;
		}

		function runLiofa(txt) {
			// Checks if it's a Bot
			if (txt.author.bot === true) return false;
			const GuildData = functions.liofaRead(txt.guild.id);

			if (functions.liofaPrefixCheck(txt)) {
				const args = txt.content.slice(GuildData.Settings.prefix.length).trim().split(' ');
				const command = args.shift().toLowerCase();

				// Checks command exists
				const client = txt.client;
				if (!client.commands.has(command)) return true;

				try {
					// Checks you have permission to run the command
					if (functions.liofaPermsCheck(txt, command)) {
						client.commands.get(command).execute(txt, args);
					}
					else {
						txt.reply('you have insufficient permissions 😬');
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

		// Check Warning Status
		function liofaMod(txt) {
			const GuildData = functions.liofaRead(txt.guild.id);
			let UserRef = GuildData['Watchlist'][txt.author.id];

			if (typeof UserRef === 'undefined') {
				UserRef = { warnings : 1, time : Date.now() };
			}
			else if ((Date.now() - UserRef.time) < GuildData.Settings.time) {
				UserRef.warnings++;
				UserRef.time = Date.now();

			}
			else {
				UserRef = { warnings : 1, time : Date.now() };

			}
			GuildData['Watchlist'][txt.author.id] = UserRef;
			fs.writeFileSync('./Server Data/' + txt.guild.id + '.json', JSON.stringify(GuildData, null, 2));
			console.log(txt.guild.id + '.json updated');
			return UserRef.warnings;
		}
	},
};