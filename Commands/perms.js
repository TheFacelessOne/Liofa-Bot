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
			for (let i = args.length - 1; i > 0; i--) {
				if (isNaN(args[i])) {
					args[i] = functions.roleToID(args[i], msg);
				}
				if (!msg.guild.roles.cache.has(args[i])) {
					msg.channel.send('One or more of the given roles do not exist');
					return;
				}
				else if (Data.Permissions[args[0]].includes(args[i])) {
					const index = Data.Permissions[args[0]].indexOf(args[i]);
					Data.Permissions[args[0]].splice(index, 1);
					msg.channel.send(functions.roleToString(args[i], msg) + ' removed from ' + args[0]);
				}
				else {
					Data.Permissions[args[0]].push(args[i]);
					msg.channel.send(functions.roleToString(args[i], msg) + ' added to ' + args[0]);
				}
			}

		}
		fs.writeFileSync('./Server Data/' + msg.guild.id + '.json', JSON.stringify(Data, null, 2));
		console.log(msg.guild.id.toString() + ' JSON updated');
	},

};