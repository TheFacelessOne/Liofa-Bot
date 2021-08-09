const fs = require('fs');
const functions = require('../functions.js');
const Exp = [new RegExp('{'), new RegExp('"', 'g'), new RegExp(':', 'g'), new RegExp(',', 'g'), new RegExp('}', 'g')];
const repl = ['', '', ' : ', ', ', '', ''];

module.exports = {
	name: 'mod',
	description: 'moderator commands',
	execute(msg, args) {
		// Reads file for given server
		const Data = JSON.parse(fs.readFileSync('./Server Data/' + msg.guild.id + '.json'));

		// Converts all given users to their IDs
		for (let i = 1; i < args.length; i++) {
			args[i] = functions.userToID(args[i], msg);
		}

		// Gives info on listed users
		if (args[0] == 'info' || args[0] == 'i') {
			args.shift();

			// Checks listed users exist on the watchlist
			if (args.every(user => typeof Data.Watchlist[user] != 'undefined')) {
				msg.channel.send('**Here is the requested information**');
				const Watchlist = Data.Watchlist;

				// Makes information easier to read
				for (let i = 0; i < args.length; i++) {
					msg.channel.send('name : ' + functions.userToString(args[i], msg));
					Watchlist[args[i]].time = functions.minutesSince(Date.now(), Data.Watchlist[args[i]].time);
					let list = JSON.stringify(Watchlist[args[i]]);
					for (let x = 0; x < Exp.length; x++) {
						list = list.replace(Exp[x], repl[x]);
					}
					list = list + ' minutes since last infraction';
					msg.channel.send(list);
				}
				return;
			}
			else {
				msg.channel.send('One or more of the given users have 0 infractions or do not exist');
				return;
			}
		}

		// Resets user's infractions
		else if (args[0] == 'reset' || args[0] == 'r') {
			args.shift();
			for (let i = 0; i < args.length; i++) {
				Data.Watchlist[args[i]].warnings = 0;
				msg.channel.send(functions.userToString(args[i], msg) + '\'s infractions have been reset');
			}
			fs.writeFileSync('./Server Data/' + msg.guild.id + '.json', JSON.stringify(Data, null, 2));
			return;
		}
		else {
			msg.channel.send('Please specify a function, "&mod info <user>" for information on a user and "&mod reset <user>" to reset a user\'s infractions');
		}
	},
};