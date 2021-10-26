const { SlashCommandBuilder } = require('@discordjs/builders');
const functions = require('../functions.js');

module.exports = {
	data : new SlashCommandBuilder()
		.setName('channels')
		.setDescription('Select Channels which channels Liofa is active in')
		.addChannelOption(channel => channel.setName('whitelist').setDescription('A channel to add to the whitelist').setRequired(false))
		.addStringOption(keyword => keyword.setName('keyword').setDescription('All channels with this keyword will be ignored').setRequired(false))
		.addBooleanOption(list => list.setName('list').setDescription('Whether to list whitelisted and ignored channels').setRequired(false)),

	usage: '[whitelist <channel(s)> | ignore <keywords to ignore> | list]',
	execute(message) {
		const GuildData = functions.liofaRead(message.guild.id);
		const inputs = message.options;
		const tooManyInputs = !functions.onlyOne([inputs.getChannel('whitelist'), inputs.getString('keyword'), inputs.getBoolean('list')]);
		if (functions.liofaPrefixCheck(message)) {
			const args = message.content.split(' ');
			args.shift();
			if (args[0] === 'list') return info(message);
			if (args[0] === 'whitelist') {
				args.shift();
				return whitelist(message, args);
			}
			if (args[0] === 'keyword') {
				args.shift();
				return keyword(message, args);
			}
		}
		else if (tooManyInputs) {
			return message.reply('Too many options given, please only choose one');
		}
		else if (!tooManyInputs) {
			if (inputs.getBoolean('list')) return info(message);
			if (inputs.getChannel('whitelist')) return whitelist(message, [inputs.getChannel('whitelist').id]);
			if (inputs.getString('keyword')) return keyword(message, [inputs.getStringOption('keyword')]);
		}
		else {
			return message.reply('Something went wrong 😬');
		}

		async function info(interaction) {
			let list = '';
			GuildData.Settings.channels.forEach(element => list = list + functions.channelToString(element, interaction) + ', ');
			list = list.slice(0, -2);
			interaction.reply('__**Whitelisted Channels:**__ \n >>>' + list);
			list = '[';
			GuildData.Settings.channelIgnore.forEach(element => list = list + element + '], [');
			list = list.slice(0, -3);
			interaction.channel.send('__**Channels with these words in their name will also be ignored**__ \n >>>' + list);
			return;
		}

		async function whitelist(interaction, channels) {
			if (channels.length == 0) {
				interaction.reply('No channels given, please provide at least one channel');
				return;
			}
			channels = functions.channelToID(channels, interaction);
			if (!channels.every(ch => interaction.guild.channels.cache.has(ch))) {
				interaction.reply('One or more channels do not exist');
				return;
			}
			else {
				channels.forEach(ch => GuildData.Settings.channels = functions.arrayToggle(GuildData.Settings.channels, ch));
				interaction.reply('Channel Whitelist updated');
			}
		}
		// Remove words or phrases from the whitelist
		async function keyword(interaction, ignore) {
			if (ignore.length == 0) {
				interaction.channel.send('No words to ignore given, please provide at least one word');
				return;
			}
			for (let i = 0; i < ignore.length; i++) {
				GuildData.Settings.channelIgnore = functions.arrayToggle(GuildData.Settings.channelIgnore, ignore[i]);
			}
			interaction.channel.send('Channel names to ignore updated');
		}
	},

};