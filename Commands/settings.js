const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const { boldText, arrayToggle, arrayString, minsToMilli, liofaUpdate} = require('../functions.js');

module.exports = {
	data : new SlashCommandBuilder()
		.setName('settings')
		.setDescription('View or Edit Settings')
		.addSubcommand(subcommand =>
			subcommand.setName('list').setDescription('List all settings or get more info on a specific setting')
				.addStringOption(Setting => {
					const Data = JSON.parse(fs.readFileSync('./Read Only/Settings.json'));
					Setting.setName('setting').setDescription('A Setting to learn more about').setRequired(false);
					for (const [value] of Object.entries(Data.Settings)) {
						if (typeof Data.Settings[value] == 'object') {
							Setting.addChoices({ name: value, value: value });
						}
					}
					return Setting;
				}))
		.addSubcommand(subcommand =>
			subcommand.setName('edit').setDescription('Edit a setting')
				.addStringOption(Setting => Setting.setName('setting').setDescription('A Setting to edit').setRequired(true))
				.addStringOption(Value => Value.setName('value').setDescription('Value to input for the setting').setRequired(false))),

	usage: '[list <option> | [edit [prefix [new prefix] | languages [language code] | time [minutes] | warnings [warning count] | startwarnings [allowed messages]]',
	execute(interaction) {
		let inputs = [];
		inputs = [interaction.options.getSubcommand(), interaction.options.getString('setting'), interaction.options.getString('value')];
		if (inputs[0] === 'list') {
			return settingsList(inputs, interaction);
		}
		else if (inputs[0] === 'edit') {
			return settingsEdit(inputs, interaction);
		}
		else {
			return interaction.reply('Something broke 😬');
		}

		async function settingsList(args) {
			const {
				button_translate : Btn0,
				button_vote : Btn1,
				button_undo : Btn2,
				button_support : Btn3,
				approved_languages : languagesAllowed,
				warnings_given : warningsGiven,
				start_warnings : infractionsBeforeWarning,
				infraction_length: infractionTime,
				ignored_words : whitelistWords,
				state : state,
				disabled_channels_ids : ignoredChannelIDs,
				disabled_channel_keywords: ignoredChannelKeywords
			} = interaction.client.dbFunctions.getGuildData('SETTINGS', interaction.guild.id);
			const buttons = [Btn0, Btn1, Btn2, Btn3];
			const buttonNames = [];
			buttons.forEach((button, index) => {
			  button ? buttonNames.push(index === 0 ? 'translate' : index === 1 ? 'vote' : index === 2 ? 'undo' : 'support') : null;
			});
			const whitelist = JSON.parse(whitelistWords);
			const languages = JSON.parse(languagesAllowed);
			const channels = JSON.parse(ignoredChannelIDs);
			const channelIgnore = JSON.parse(ignoredChannelKeywords);
			if (inputs[1] !== null) {
				function generateList(args) {
					let settingArray = `__**${inputs[1]} contains:**__`;
					if (args.length !== 0) {
						let list = '';
						args.forEach(element => list += element + '\n');
						settingArray = settingArray.concat('\n' + list);
					} else {
						settingArray = settingArray.concat(' Nothing');
					}
					return interaction.reply(settingArray);
				}
				switch (inputs[1]) {
					case 'whitelist': generateList(whitelist); break;
					case 'languages': generateList(languages); break;
					case 'channels': generateList(channels); break;
					case 'channelIgnore': generateList(channelIgnore); break;
					case 'buttons': generateList(buttonNames); break;
					case 'modlog': generateList(modlog); break;
				}
			}
			else {
				let stateEmoji;
				state ? stateEmoji = '✅' : stateEmoji = '❌';
				const infractionsIgnoredAfter = Math.floor((infractionTime / 1000) / 60);

				const listEmbed = new EmbedBuilder()
					.setColor('#00ff08')
					.setTitle('Settings')
					.addFields(
						{ name : 'State', value : stateEmoji, inline : true },
						{ name : 'Whitelist contains', value : boldText(whitelist.length) + ' entries', inline : true },
						{ name : 'Languages contains', value : boldText(languages.length) + ' accepted languages', inline : true },
						{ name: '\u200B', value: '\u200B' },
						{ name : 'Infractions ignored after', value : boldText(infractionsIgnoredAfter) + ' minutes', inline : true },
						{ name : 'Messages before warning', value : boldText(infractionsBeforeWarning) + ' messages allowed', inline : true },
						{ name : 'Maximum warnings', value : boldText(warningsGiven) + ' warnings given', inline : true },
						{ name: '\u200B', value: '\u200B' },
						{ name : 'Whitelisted channels', value : boldText(channels.length) + ' channels', inline : true },
						{ name : 'Ignored channel keywords', value : boldText(channelIgnore.length) + ' entries', inline : true },
						{ name : 'Active buttons', value : boldText(buttonNames.length), inline : true },
					)
					.setFooter({ text : 'Settings listed are for ' + interaction.guild.id });
				return interaction.reply({ embeds : [listEmbed] });
			}
			return;
		}

		async function settingsEdit(args) {
			let updateSetting;
			const { approved_languages : languagesAllowed } = interaction.client.dbFunctions.getGuildData('SETTINGS', interaction.guild.id);
			let languages = JSON.parse(languagesAllowed);
			switch (inputs[1]) {
			case 'languages':
				let lang = arrayToggle(languages, inputs[2]);
				lang = arrayString(lang);
				updateSetting =  { approved_languages: lang };
				interaction.reply('Accepted Language codes now contains: \n' + languages);
				break;

			case 'time':
				if (isNaN(inputs[2])) {
					return interaction.reply('Please provide a number in minutes for the length of time to keep track of the last infraction');
				}
				else {
					updateSetting =  { infraction_length: minsToMilli(inputs[2]) };
					interaction.reply(inputs[2] + ' minutes will be allowed before a user\'s infractions are reset');
				}
				break;
			case 'warnings':
				if (isNaN(inputs[2])) {
					interaction.reply('Please provide a number of warnings to be given before a user\'s messages are deleted');
					return;
				}
				else {
					updateSetting = { warnings_given : inputs[2] };
					interaction.reply(inputs[2] + ' warnings will be given before a user\'s messages are deleted');
				}
				break;
			case 'startwarnings':
				if (isNaN(inputs[2])) {
					return interaction.reply('Please provide a number of messages to be allowed before a warning is given');
				}
				else {
					updateSetting = { start_warnings : inputs[2] };
					interaction.reply(inputs[2] + ' messages will be allowed before a warning is given');
				}
				break;
			default:
				return interaction.reply('No acceptable arguments were given. \n Acceptable arguments include "list, languages, time, warnings, startwarnings"');
			}
			interaction.client.dbFunctions.updateGuildData('SETTINGS', interaction.guild.id, updateSetting);
		}
	},
};
