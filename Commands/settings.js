const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const functions = require('../functions.js');
const bold = functions.boldText;

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
		const GuildData = functions.liofaRead(interaction.guild.id);
		let inputs = [];

		if (functions.liofaPrefixCheck(interaction)) {
			inputs = interaction.content.split(' ');
			inputs.shift();
		}
		else {
			inputs = [interaction.options.getSubcommand(), interaction.options.getString('setting'), interaction.options.getString('value')];
		}
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
			if (typeof args[1] === 'object' || typeof args[1] === 'undefined') {
				let stateEmoji;
				GuildData.Settings.state ? stateEmoji = '✅' : stateEmoji = '❌';
				const infractionsIgnoredAfter = Math.floor((GuildData.Settings.time / 1000) / 60);

				const listEmbed = new EmbedBuilder()
					.setColor('#00ff08')
					.setTitle('Settings')
					.addFields(
						{ name : 'State', value : stateEmoji, inline : true },
						{ name : 'Whitelist contains', value : bold(GuildData.Settings.whitelist.length) + ' entries', inline : true },
						{ name : 'Languages contains', value : bold(GuildData.Settings.languages.length) + ' accepted languages', inline : true },
						{ name: '\u200B', value: '\u200B' },
						{ name : 'Infractions ignored after', value : bold(infractionsIgnoredAfter) + ' minutes', inline : true },
						{ name : 'Messages before warning', value : bold(GuildData.Settings.startwarnings) + ' messages allowed', inline : true },
						{ name : 'Maximum warnings', value : bold(GuildData.Settings.warnings) + ' warnings given', inline : true },
						{ name: '\u200B', value: '\u200B' },
						{ name : 'Whitelisted channels', value : bold(GuildData.Settings.channels.length) + ' channels', inline : true },
						{ name : 'Ignored channel keywords', value : bold(GuildData.Settings.channelIgnore.length) + ' entries', inline : true },
						{ name : 'Prefix', value : bold(GuildData.Settings.prefix), inline : true },
					)
					.setFooter({ text : 'Settings listed are for ' + interaction.guild.id });
				return interaction.reply({ embeds : [listEmbed] });
			}
			else if (typeof GuildData.Settings[args[1]] === 'object') {
				let settingArray = '__**' + args[1] + ' contains:**__';
				if (GuildData.Settings[args[1]].length != 0) {
					let list = '';
					GuildData.Settings[args[1]].forEach(element => list = list + element + '\n');
					settingArray = settingArray.concat('\n' + list);
					return interaction.reply(settingArray);
				}
				else {
					settingArray = settingArray.concat(' Nothing');
					return interaction.reply(settingArray);
				}
			}
			return;
		}

		async function settingsEdit(args) {
			switch (args[1]) {
			case 'prefix':
				GuildData.Settings.prefix = args[2].toString();
				interaction.reply('prefix updated to: "' + GuildData.Settings.prefix.toString() + '"');
				break;

			case 'languages':
				GuildData.Settings.languages = functions.arrayToggle(GuildData.Settings.languages, args[2]);
				interaction.reply('Accepted Language codes now contains: \n' + GuildData.Settings.languages);
				break;

			case 'time':
				if (isNaN(args[2])) {
					return interaction.reply('Please provide a number in minutes for the length of time to keep track of the last infraction');
				}
				else {
					GuildData.Settings.time = functions.minsToMilli(args[2]);
					interaction.reply(args[2] + ' minutes will be allowed before a user\'s infractions are reset');
				}
				break;
			case 'warnings':
				if (isNaN(args[2])) {
					interaction.reply('Please provide a number of warnings to be given before a user\'s messages are deleted');
					return;
				}
				else {
					GuildData.Settings.warnings = args[2];
					interaction.reply(args[2] + ' warnings will be given before a user\'s messages are deleted');
				}
				break;
			case 'startwarnings':
				if (isNaN(args[2])) {
					return interaction.reply('Please provide a number of messages to be allowed before a warning is given');
				}
				else {
					GuildData.Settings.startwarnings = args[2];
					interaction.reply(args[2] + ' messages will be allowed before a warning is given');
				}
				break;
			default:
				return interaction.reply('No acceptable arguments were given. \n Acceptable arguments include "list, prefix, languages, time, warnings, startwarnings"');
			}
			functions.liofaUpdate(interaction, GuildData);
		}
	},
};
