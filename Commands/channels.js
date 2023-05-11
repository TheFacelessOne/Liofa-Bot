const { SlashCommandBuilder } = require('@discordjs/builders');
const functions = require('../functions.js');

module.exports = {
	data : new SlashCommandBuilder()
		.setName('channels')
		.setDescription('Select Channels which channels Liofa is active in')
		.addChannelOption(channel => channel.setName('whitelist').setDescription('A channel to add to the whitelist').setRequired(false))
		.addStringOption(keyword => keyword.setName('keyword').setDescription('All channels with this keyword will be ignored').setRequired(false)),

	usage: '[whitelist <channel> | ignore <keywords to ignore> | list]',
	execute(message) {
		let GuildData = functions.liofaRead(message.guild.id);
		const inputs = message.options;
		const inputCount = functions.onlyOne([inputs.getChannel('whitelist'), inputs.getString('keyword')]);
		if (functions.liofaPrefixCheck(message)) {
			const args = message.content.split(' ');
			args.shift();
			if (args[0] === 'whitelist') {
				args.shift();
				whitelist(message, args);
				return info(message);
			}
			if (args[0] === 'keyword') {
				args.shift();
				keyword(message, args);
				return info(message);
			}
		}
		else if (inputCount > 1) {
			return message.reply('Too many options given, please only choose one');
		}
		else if (inputCount == 1) {
			if (inputs.getChannel('whitelist')) {
				whitelist(message, [inputs.getChannel('whitelist').id]);
				return info(message);
			}
			if (inputs.getString('keyword')) {
				keyword(message, [inputs.getString('keyword')]);
				return info(message);
			}
		}
		else {
			return info(message);
		}

		async function info(interaction) {
			GuildData = functions.liofaRead(message.guild.id);
			let list = '';
			GuildData.Settings.channels.forEach(element => list = list + functions.channelToString(element, interaction) + '\n> ');
			list = list.slice(0, -2);
			let channelList = '__**Whitelisted Channels:**__ \n> ' + list;
			list = '[';
			GuildData.Settings.channelIgnore.forEach(element => list = list + element + '], [');
			channelList = channelList + '\n__**Channels with these words in their name will also be ignored**__ \n> ' + list;
			channelList = channelList.slice(0, -3);
			interaction.reply(channelList);
			return;
		}

		async function whitelist(interaction, channels) {
			if (channels.length == 0) {
				interaction.channel.send('🤡 No channels given, please provide at least one channel');
				return;
			}
			channels = functions.channelToID(channels, interaction);
			const bannedChannelTypes = ['GUILD_VOICE', 'GUILD_STAGE_VOICE'];
			if (!channels.every(ch => {
				const LookUpChannel = interaction.guild.channels.cache.find(channel => channel.id === ch);
				return interaction.guild.channels.cache.has(ch) && !bannedChannelTypes.includes(LookUpChannel.type);
			})
			) {
				interaction.channel.send('🤡 One or more channels do not exist or are not accepted channel types');
				return;
			}
			else {
				channels.forEach(ch => GuildData.Settings.channels = functions.arrayToggle(GuildData.Settings.channels, ch));
				interaction.channel.send('Channel Whitelist updated');
				functions.liofaUpdate(interaction, GuildData);
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
			functions.liofaUpdate(interaction, GuildData);
		}
	},

};
