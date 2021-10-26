const functions = require('../functions.js');

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
			if (!GuildData.Settings.languages.includes(result.code) && parseInt(result.percent) >= 90) {

				// Warnings Check
				const warnCount = liofaMod(msg);
				const msgBeforeDeletion = parseInt(GuildData.Settings.warnings) + parseInt(GuildData.Settings.startwarnings);
				if (warnCount < msgBeforeDeletion && warnCount > GuildData.Settings.startwarnings) {

					const LiofaMessages = require('../Read Only/Responses');
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
						txt.reply('You have insufficient permissions 😬');
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
			functions.liofaUpdate(txt, GuildData);
			return UserRef.warnings;
		}
	},
};