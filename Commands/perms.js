const fs = require('fs');
const functions = require('../functions.js');
const Exp = [new RegExp('{'), new RegExp('],', 'g'), new RegExp('\\[', 'g'), new RegExp('"', 'g'), new RegExp(']', 'g'), new RegExp(':', 'g'), new RegExp(',', 'g'), new RegExp('}', 'g')];
const repl = ['', '\n', '', '', '', ' : ', ', ', '', ''];

module.exports = {
	name: 'perms',
	description: 'Changes command permissions',
	execute(msg, args) {
		const Data = JSON.parse(fs.readFileSync('./Server Data/' + msg.guild.id + '.json'));
		// Lists all permissions
		if (args[0] == 'list') {
			for (const [value] of Object.entries(Data.Permissions)) {
				for (let i = Data.Permissions[value].length; i > 0; i--) {
					Data.Permissions[value][i - 1] = functions.roleToString(Data.Permissions[value][i - 1], msg);
				}
			}
			let list = JSON.stringify(Data.Permissions);
			for (let i = 0; i < Exp.length; i++) {
				list = list.replace(Exp[i], repl[i]);
			}
			msg.channel.send(list);
			return;
		}
		// if the permission you're asking for doesn't exist
		else if (typeof Data.Permissions[args[0]] === 'undefined') {
			if (args.length == 0) {
				msg.channel.send('No permission given, use "&perms list" to see all permissions');
			}
			else {
				msg.channel.send('No such permission, use "&perms list" to see all permissions');
				return;
			}
		}
		// Used for toggling what roles can use what commands
		else {
			const perm = args.shift();
			args = functions.roleToID(args);
			if (!args.every(role => msg.guild.roles.cache.has(role))) {
				msg.channel.send('One or more of the given roles do not exist');
				return;
			}
			for (let i = 0; i < args.length; i++) {
				const permLength = Data.Permissions[perm].length;
				Data.Permissions[perm] = functions.arrayToggle(Data.Permissions[perm], args[i]);
				if (permLength > Data.Permissions[perm].length) {
					msg.channel.send(functions.roleToString(args[i], msg) + ' removed from ' + perm);
				}
				else {
					msg.channel.send(functions.roleToString(args[i], msg) + ' added to ' + perm);
				}
			}

		}
		fs.writeFileSync('./Server Data/' + msg.guild.id + '.json', JSON.stringify(Data, null, 2));
		console.log(msg.guild.id.toString() + ' JSON updated');
	},

};