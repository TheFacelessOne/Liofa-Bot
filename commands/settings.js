const fs = require('fs');
const functions = require('../functions.js');

module.exports = {
	name: 'settings',
	description: 'Changes Settings for liofa',
	execute(msg, args) {
		const Data = JSON.parse(fs.readFileSync('./Server Data/' + msg.guild.id + '.json'));
		// Lists all settings
		if (args[0] == 'list') {
			args.shift();
			if (args.length == 0) {
				msg.channel.send('**Liofa is turned on: **' + Data.Settings.state +
				'\n**Whitelist contains: **' + Data.Settings.whitelist.length + ' entries' +
				'\n**Languages contains: **' + Data.Settings.languages.length + ' acceptable languages' +
				'\n**Time until past infractions are ignored: ** ' + Math.floor((Data.Settings.time / 1000) / 60) + ' minutes' +
				'\n**Maximum warnings given: **' + Data.Settings.warnings +
				'\n**Ignored channels contains: **' + Data.Settings.channels.length + ' channels' +
				'\n**Commands prefix: ** "' + Data.Settings.prefix + '"');
				let list = '';
				for (const entry in Data.Settings) {
					if (typeof Data.Settings[entry] == 'object') {
						list += entry + ', ';
					}
				}
				msg.channel.send('for more information on a setting, do "' + Data.Settings.prefix.toString() + 'settings list <option>" \n The options available to you are ' + list);
				return;
			}
			else if (typeof Data.Settings[args[0].toLowerCase()] === 'object') {
				args[0] = args[0].toLowerCase();
				msg.channel.send('**' + args[0] + ' contains:**');
				if (Data.Settings[args[0]].length != 0) {
					msg.channel.send(Data.Settings[args[0]]);
				}
				else {
					msg.channel.send('nothing');
				}
				return;
			}
			else {
				msg.channel.send(args[0] + ' is not an accepted input for "&settings list"');
				return;
			}
		}
		// Change commands prefix
		else if (args[0] == 'prefix') {
			args.shift();
			if (args.length == 1) {
				Data.Settings.prefix = args[0].toString();
				msg.channel.send('prefix updated to: "' + Data.Settings.prefix.toString() + '"');
			}
			else if (args.length == 0) {
				msg.channel.send('Please provide a prefix that will be used for future commands. Your current prefix is: "' + Data.Settings.prefix.toString() + '"');
				return;
			}
			else if (args.length >= 2) {
				msg.channel.send('You did something wrong there, no spaces can be used in prefixes');
				return;
			}
		}
		// Changes acceptable languages
		else if (args[0] == 'languages') {
			args.shift();
			if (args.length == 0) {
				msg.channel.send('Please provide a language that will be ignored by Liofa. Languages must be input using language codes, codes are given when someone speaks a foreign language');
				return;
			}
			for (let i = 0; i < args.length; i++) {
				Data.Settings.languages = functions.arrayToggle(Data.Settings.languages, args[i]);
			}
			msg.channel.send('Accepted Languages now contains: \n' + Data.Settings.languages);
		}
		// Changes time allowed since last infraction before infractions are reset
		else if (args[0] == 'time') {
			args.shift();
			if(isNaN(args[0])) {
				msg.channel.send('Please provide a number in minutes for the length of time to keep track of the last infraction');
				return;
			}
			else {
				Data.Settings.time = functions.minsToMilli(args[0]);
				msg.channel.send(args[0] + ' minutes will be allowed before a user\'s infractions are reset');
			}
		}
		// Changes warnings given before messages are deleted
		else if (args[0] == 'warnings') {
			args.shift();
			if (isNaN(args[0])) {
				msg.channel.send('Please provide a number of warnings to be given before a user\'s messages are deleted');
				return;
			}
			else {
				Data.Settings.warnings = args[0];
				msg.channel.send(args[0] + ' warnings will be given before a user\'s messages are deleted');
			}
		}
		else {
			msg.channel.send('No acceptable arguments were given. \n Acceptable arguments include "list, prefix, languages, time, warnings"');
		}
		fs.writeFileSync('./Server Data/' + msg.guild.id + '.json', JSON.stringify(Data, null, 2));
		console.log(msg.guild.id.toString() + ' JSON updated');
	} };