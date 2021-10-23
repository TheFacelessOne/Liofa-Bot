const fs = require('fs');

module.exports = {
	name: 'whitelist',
	description: 'Adds words to Liofa\'s ignored words list',
	usage: '[list | add <word> | remove <word> ]',
	execute(msg, args) {
		const Data = JSON.parse(fs.readFileSync('./Server Data/' + msg.guild.id + '.json'));
		// If you're asking for the list of all whitelisted words and phrases
		if (args[0] == 'list') {
			let list = '[';
			Data.Settings.whitelist.forEach(element => list = list + element + '], [');
			list = list.slice(0, -3);
			msg.channel.send('**Whitelisted Words:**\n' + list);
			return;
		}
		// if you're adding a word or phrase
		else if (args[0] == 'add' || args[0] == 'a') {
			args.shift();
			if (args.length == 0) {
				msg.channel.send('No words given, please provide one or more words to add to the whitelist');
				return;
			}
			else if (args.some(element => Data.Settings.whitelist.includes(element))) {
				msg.channel.send('One or more words already exist in the whitelist, use "' + Data.Settings.prefix + 'whitelist list" to list all whitelisted words');
				return;
			}
			else {
				args.forEach(element => Data.Settings.whitelist.push(element));
				msg.channel.send('Whitelist updated');
			}
		}
		// Remove words or phrases from the whitelist
		else if (args[0] == 'remove' || args[0] == 'r') {
			args.shift();
			if (args.every(element => Data.Settings.whitelist.includes(element))) {
				for (let i = 0; i < args.length; i++) {
					const index = Data.Settings.whitelist.indexOf(args[i]);
					Data.Settings.whitelist.splice(index, 1);
				}
				msg.channel.send('Whitelist updated');
			}
			else {
				msg.channel.send('One or more words do not exist in the whitelist, use "' + Data.Settings.prefix + 'whitelist list" to list all whitelisted words');
				return;
			}
		}
		else {
			msg.channel.send('No accepted arguments given, \nAccepted arguments include "list, add, remove"');
		}
		fs.writeFileSync('./Server Data/' + msg.guild.id + '.json', JSON.stringify(Data, null, 2));
		console.log(msg.guild.id.toString() + ' JSON updated');
	},

};