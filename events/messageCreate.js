const {
	liofaExcludedRolesOrChannels,
	watchlistIncrement,
	boldText
} = require('../functions.js');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const cld = require('cld');

module.exports = {
	name: 'MessageCreate',
	async execute(msg) {
		const {
			approved_languages : languagesAllowed,
			warnings_given : warningsGiven,
			start_warnings : infractionsBeforeWarning,
			button_translate : Btn0,
			button_vote : Btn1,
			button_undo : Btn2,
			button_support : Btn3,
			modlog_channel_id : modLogChannel,
			ignored_words : ignoreTheseWords
		} = msg.client.dbFunctions.getGuildData('SETTINGS', msg.guild.id);

		Promise.all([isLiofaListening(msg), filterAndDetectLanguage(msg, JSON.parse(ignoreTheseWords))]).then( (result) => {

			const detectedLanguage = result[1];
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
						log.send({ embeds: [modLog(msg, infractionCount)]});}
					msg.delete();
				}
			}
		}).catch( (error) => { console.error(error) });


	

		function isLiofaListening(txt) {
			// Checks if it's a Bot
			if (txt.author.bot === true) return Promise.reject();
			if (liofaExcludedRolesOrChannels(txt)) return Promise.reject();
			if (txt.client.dbFunctions.getGuildData('SETTINGS', txt.guild.id, 'state')) return Promise.resolve();
		}
	},
};

function createButtons(showButton, msg) {
	const buttons = new ActionRowBuilder()
	if (showButton.includes(true)) {
		if (showButton[0]) {
			buttons.addComponents( new ButtonBuilder().setURL('https://translate.google.com').setLabel('🌍 Translator').setStyle(ButtonStyle.Link));
		}
		if (showButton[1]) {
			buttons.addComponents( new ButtonBuilder().setURL('https://top.gg/bot/866186816645890078/vote').setLabel('⬆ Vote').setStyle(ButtonStyle.Link));
		}
		if (showButton[2]) {
			buttons.addComponents( new ButtonBuilder().setCustomId('mod undo ' + msg.author.id).setLabel('⏪ Undo').setStyle(ButtonStyle.Danger));
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

// Check for Language
async function filterAndDetectLanguage(msg, filterOut) {
	
	// Removes Emojis
	// eslint-disable-next-line no-useless-escape
	let MessageContent = msg.content.replace(new RegExp('\<a?\:[^ \>]+\>', 'g'), ' ');
	
	// Removes an array of words from a string
	if (filterOut.length > 0) {
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