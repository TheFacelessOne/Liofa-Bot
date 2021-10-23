const fs = require('fs');
const functions = require('../functions.js');

module.exports = {
	name: 'channels',
	description: 'Used for specifying channels for Liofa to ignore',
	usage: '[whitelist <channel(s)> | ignore <keywords to ignore> | list]',
	execute(msg, args) {
		const Data = JSON.parse(fs.readFileSync('./Server Data/' + msg.guild.id + '.json'));
		// If you're asking for the list of all whitelisted channels
		if (args[0] == 'list') {
			let list = '';
			Data.Settings.channels.forEach(element => list = list + functions.channelToString(element, msg) + ', ');
			list = list.slice(0, -2);
			msg.channel.send('**Whitelisted Channels:** \n' + list);
			list = '[';
			Data.Settings.channelIgnore.forEach(element => list = list + element + '], [');
			list = list.slice(0, -3);
			msg.channel.send('**Channels with these words in their name will also be ignored** \n' + list);
			return;
		}
		// if you're toggling a channel from the whitelist
		else if (args[0] == 'whitelist') {
			args.shift();
			if (args.length == 0) {
				msg.channel.send('No channels given, please provide at least one channel');
				return;
			}
			args = functions.channelToID(args, msg);
			if (!args.every(ch => msg.guild.channels.cache.has(ch))) {
				msg.channel.send('One or more channels do not exist');
				return;
			}
			else {
				args.forEach(ch => Data.Settings.channels = functions.arrayToggle(Data.Settings.channels, ch));
				msg.channel.send('Channel Whitelist updated');
			}
		}
		// Remove words or phrases from the whitelist
		else if (args[0] == 'ignore') {
			args.shift();
			if (args.length == 0) {
				msg.channel.send('No words to ignore given, please provide at least one word');
				return;
			}
			for (let i = 0; i < args.length; i++) {
				Data.Settings.channelIgnore = functions.arrayToggle(Data.Settings.channelIgnore, args[i]);
			}
			msg.channel.send('Channel names to ignore updated');
		}
		else {
			msg.channel.send('no accepted arguments given. \nAccepted arguments include "list, whitelist, ignore"');
			return;
		}
		fs.writeFileSync('./Server Data/' + msg.guild.id + '.json', JSON.stringify(Data, null, 2));
		console.log(msg.guild.id.toString() + ' JSON updated');
	},

};