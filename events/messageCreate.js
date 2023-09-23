const {
	watchlistIncrement,
	boldText
} = require('../functions.js');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const cld = require('cld');

module.exports = {
	name: 'MessageCreate',
	async execute(msg) {

		if (msg.author.id == msg.client.user.id) return; // Stops liofa reacting with itself

		const {
			approved_languages : languagesAllowed,
			warnings_given : warningsGiven,
			start_warnings : infractionsBeforeWarning,
			button_translate : Btn0,
			button_vote : Btn1,
			button_undo : Btn2,
			button_support : Btn3,
			modlog_channel_id : modLogChannel,
			ignored_words : ignoreTheseWords,
			state : state,
			disabled_channels_ids : ignoredChannelIDs,
			disabled_channel_keywords: ignoredChannelKeywords
		} = msg.client.dbFunctions.getGuildData('SETTINGS', msg.guild.id);

		let { excluded : excludedRolesList} = msg.client.dbFunctions.getGuildData('PERMISSIONS', msg.guild.id, 'excluded');
		excludedRolesList = JSON.parse(excludedRolesList);

		// Asynchronously performs checks to see if liofa should run on a sent message, if any returns false then it will cancel them all
		Promise.all([
			state ? Promise.resolve() : Promise.reject('Liofa is turned off'),
			!msg.author.bot ? Promise.resolve() : Promise.reject('Bots don\'t snitch on each other'),
			!JSON.parse(ignoredChannelIDs).includes(msg.channel.id) ? Promise.resolve() : Promise.reject('Channel ID is excluded'),
			!JSON.parse(ignoredChannelIDs).includes(msg.channel.parentId) ? Promise.resolve() : Promise.reject('Channel category is excluded'),
			!JSON.parse(ignoredChannelKeywords).some(ignore => msg.channel.name.includes(ignore)) ? Promise.resolve() : Promise.reject('Channel name contains ignored keyword'),
			!msg.member.roles.cache.some(authorRoles => excludedRolesList.includes(authorRoles.id)) ? Promise.resolve() : Promise.reject('Author has the "excluded" permission'),
			filterAndDetectLanguage() // Keep as the last element of the array or you'll break result handling
		]).then( (result) => {

			const detectedLanguage = result[result.length - 1];
			const showButton = [Btn0, Btn1, Btn2, Btn3];
			const languageIsAllowed = JSON.parse(languagesAllowed).includes(detectedLanguage.code);
			const resultIsAccurate = parseInt(detectedLanguage.percent) >= 90; // must be 90% sure

			if (!languageIsAllowed && resultIsAccurate) {

				// Warnings Check
				const infractionCount = watchlistIncrement(msg, msg.author.id);
				const infractionsBeforeDeletion = warningsGiven + infractionsBeforeWarning;
				const startDeleting = infractionCount > infractionsBeforeDeletion;
				const startWarnings = infractionCount > infractionsBeforeWarning;

				const buttons = createButtons(showButton, msg);

				if (!startDeleting && startWarnings) {
					sendWarning(msg, buttons, detectedLanguage);
				}
				else if (infractionCount == startDeleting) {
					const lastWarning = { content : '<@' + msg.author.id + '> All further messages will be deleted unless you speak in English'};
					if (buttons) lastWarning.components = [buttons];
					msg.reply(lastWarning);
				}
				else if (startDeleting) {
					//Check if modlog is set and channel exists
					if (modLogChannel && msg.client.channels.cache.has(modLogChannel)){
						const log = msg.client.channels.cache.get(modLogChannel);
						log.send({embeds: [modLog(msg, infractionCount)]});
					}
					msg.delete();
				}
			}
		}).catch( (error) => { console.info(error) });


		// Check for Language
		async function filterAndDetectLanguage() {
			filterOut = JSON.parse(ignoreTheseWords);
			// Removes Emojis
			// eslint-disable-next-line no-useless-escape
			let MessageContent = msg.content.replace(new RegExp('\<a?\:[^ \>]+\>', 'g'), ' ');

			// Removes an array of words from a string
			if (await filterOut.length > 0) {
				const regex = new RegExp(filterOut.join('|'), 'gi');
				MessageContent.replace(regex, ' ');
			}
			if (!/\S/.test(MessageContent) || MessageContent.length < 6) {
				return Promise.reject('Message too short');
			}

			try {
				const result = await cld.detect(MessageContent)
				return Promise.resolve(result.languages[0]);
			}
			catch {
				return Promise.reject('Language detection failed on: \n\t' + MessageContent);
			}
		}
	},
};

function createButtons(showButton, msg) {
	let buttons = new ActionRowBuilder()
	if (showButton.includes(1)) {
		if (showButton[0]) {
			buttons.addComponents( new ButtonBuilder().setURL('https://translate.google.com').setLabel('🌍 Translator').setStyle(ButtonStyle.Link));
		}
		if (showButton[1]) {
			buttons.addComponents( new ButtonBuilder().setURL('https://top.gg/bot/866186816645890078/vote').setLabel('🔝 Vote').setStyle(ButtonStyle.Link));
		}
		if (showButton[2]) {
			buttons.addComponents( new ButtonBuilder().setCustomId('mod undo ' + msg.author.id).setLabel('↩️ Undo').setStyle(ButtonStyle.Danger));
		}
		if (showButton[3]) {
			buttons.addComponents( new ButtonBuilder().setCustomId('invite links').setLabel('🆘 Support').setStyle(ButtonStyle.Primary));
		}
		return buttons;
	}

	return false;

}

function sendWarning(msg, buttons, detectedLanguage) {
	const LiofaMessages = require('../Read Only/Responses');
	const response = {};
	// Checks if output for given language is available
	if (typeof LiofaMessages[detectedLanguage.code] === 'string') {
		response.content = '<@' + msg.author.id + '> **' + LiofaMessages[detectedLanguage.code] + '**';
		if (buttons) { response.components = [buttons] }
	}
	else {
		response.content = '**Please speak English.**';
		if (buttons) { response.components = [buttons] }
		msg.channel.send(detectedLanguage.name + ' must be added to Languages. Please report this bug on my support server A link can be found in my bio. code: `[' + detectedLanguage.code + ']`');
	}
	return msg.reply(response);
}

function modLog(interaction, infractions) {
	const modlogEmbed = new EmbedBuilder()
		.setColor(0xa60000)
		.setAuthor({ name: interaction.author.username, iconURL: 'https://cdn.discordapp.com/avatars/' + interaction.author.id + '/' + interaction.author.avatar + '.png'})
		.setTitle('Message Deleted')
		.addFields(
			{ name : 'Message:', value : interaction.content},
			{ name : 'Warnings given:', value : boldText(infractions)});
	return modlogEmbed;
}
