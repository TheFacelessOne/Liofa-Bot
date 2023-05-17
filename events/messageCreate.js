const {
	liofaDetectLanguage,
	liofaRead,
	liofaPrefixCheck,
	liofaPermsCheck,
	liofaExcludedRolesOrChannels,
	liofaMod,
	boldText
} = require('../functions.js');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
	name: 'MessageCreate',
	async execute(msg) {
		if (runLiofa(msg) === false) return;

		const result = await liofaDetectLanguage(MessageContent);
		if (!result) return;


		const GuildData = liofaRead(msg.guild.id);
		// Checks list of allowed languages
		if (!GuildData.Settings.languages.includes(result.code) && parseInt(result.percent) >= 90) {

			// Warnings Check
			const warnCount = liofaMod(msg, msg.author.id);
			const msgBeforeDeletion = parseInt(GuildData.Settings.warnings) + parseInt(GuildData.Settings.startwarnings);
			if (warnCount < msgBeforeDeletion && warnCount > GuildData.Settings.startwarnings) {
				const buttons = new ActionRowBuilder();
				let printButtons = false;
				if (GuildData.Settings.buttons.includes(true)) {
					printButtons = true;
					if (GuildData.Settings.buttons[0]) {
						buttons.addComponents(new ButtonBuilder().setURL('https://translate.google.com').setLabel('🌍 Translator').setStyle(ButtonStyle.Link));
					}
					if (GuildData.Settings.buttons[1]) {
						buttons.addComponents(new ButtonBuilder().setCustomId('result.name').setLabel(result.name + ' [' + result.percent + '%]').setStyle(ButtonStyle.Primary).setDisabled(true));
					}
					if (GuildData.Settings.buttons[2]) {
						buttons.addComponents(new ButtonBuilder().setCustomId('mod undo ' + msg.author.id).setLabel('Undo').setStyle(ButtonStyle.Danger));
					}
					if (GuildData.Settings.buttons[3]) {
						buttons.addComponents(new ButtonBuilder().setCustomId('invite links').setLabel('Get Liofa!').setStyle(ButtonStyle.Success));
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
					const channelId = GuildData.Settings.modlog;
					//Check if modlog is set and channel exists
					if (channelId != null && msg.client.channels.cache.has(channelId)){
						function modLog(interaction, warnings) {
							const modlogEmbed = new EmbedBuilder()
								.setColor(0xa60000)
								.setAuthor({ name: interaction.author.username, iconURL: 'https://cdn.discordapp.com/avatars/' + interaction.author.id + '/' + interaction.author.avatar + '.png'})
								.setTitle('Message Deleted')
								.addFields(
									{ name : 'Message:', value : interaction.content},
									{ name : 'Warnings given:', value : boldText(warnings)});
							return modlogEmbed;
								}
    				const channel = msg.client.channels.cache.get(channelId);
						channel.send({ embeds: [await modLog(msg, warnCount)]});}
				msg.delete();
			}
		}
	

		function runLiofa(txt) {
			// Checks if it's a Bot
			if (txt.author.bot === true) return false;
			const GuildData = liofaRead(txt.guild.id);

			if (liofaPrefixCheck(txt)) {
				const args = txt.content.slice(GuildData.Settings.prefix.length).trim().split(' ');

				// Checks command exists
				const command = txt.client.commands.get(args.shift().toLowerCase());
				if (!command) return true;

				// Checks required channel permissions
				if(!txt.channel.permissionsFor(txt.guild.me).has(['VIEW_CHANNEL', 'SEND_MESSAGES', 'MANAGE_MESSAGES'])){
					txt.author.send('I don\'t have sufficient permissions required to run the command in that channel\!😭\nPlease ensure I have these channel permissions:\n > **View Channel**\n > **Send Messages**\n > **Manage Messages**');
					return false;
				}

				try {
					// Checks you have permission to run the command
					if (liofaPermsCheck(txt, command)) {
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
			else if (liofaExcludedRolesOrChannels(txt)) {
				return false;
			}
			return GuildData.Settings.state;
		}
	},
};
