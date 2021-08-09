module.exports = { roleToString, roleToID, userToString, userToID, removeFromString, liofaCheck, minutesSince };
const cld = require('cld');

// Check for Language
async function liofaCheck(msg) {
	const result = await cld.detect(msg);
	return result.languages[0];
}

// Converts role IDs into their name
function roleToString(identifier, msg) {
	if (!isNaN(identifier) && msg.guild.roles.cache.has(identifier)) {
		const LookUp = msg.guild.roles.cache.find(role => role.id === identifier);
		return LookUp.name;
	}
	else if (typeof identifier == 'string') {
		return identifier;
	}
	else {
		return 'Unknown role';
	}

}

// Converts role mentions into their ID (will not convert the role name alone, only @mentions)
function roleToID(identifier, msg) {
	// eslint-disable-next-line no-useless-escape
	const exp = new RegExp(/^\<\@\&\d{15,}\>$/);
	if (!isNaN(identifier)) {
		return identifier;
	}
	else if (identifier.match(exp)) {
		while(isNaN(identifier.charAt(0))) {
			identifier = identifier.substring(1);
		}
		identifier = identifier.substring(0, identifier.length - 1);
		return identifier;
	}
	else {
		msg.channel.send('Something went wrong converting the role name. Maybe try using the role ID instead');
		return undefined;
	}
}

// Converts user IDs into their name
function userToString(identifier, msg) {
	if (!isNaN(identifier) && msg.guild.members.cache.has(identifier)) {
		const LookUpMember = msg.guild.members.cache.find(member => member.id === identifier);
		return LookUpMember.displayName;
	}
	else if (typeof identifier == 'string') {
		return identifier;
	}
	else {
		return 'Unknown User';
	}
}

// Converts user mentions into their ID (will not convert the user name alone, only @mentions)
function userToID(identifier, msg) {
	// eslint-disable-next-line no-useless-escape
	const exp1 = new RegExp(/^\<\@\d{15,}\>$/);
	// eslint-disable-next-line no-useless-escape
	const exp2 = new RegExp(/^\<\@\!\d{15,}\>$/);
	if (!isNaN(identifier)) {
		return identifier;
	}
	else if (identifier.match(exp1) || identifier.match(exp2)) {
		while(isNaN(identifier.charAt(0))) {
			identifier = identifier.substring(1);
		}
		identifier = identifier.substring(0, identifier.length - 1);
		return identifier;
	}
	else {
		msg.channel.send('Something went wrong converting the username. Maybe try using the user ID instead');
		console.log('User mention to ID conversion failure');
		console.log('guild name : ' + msg.guild.id + ' guild id : ' + msg.guild.name + ' message : ' + msg.content);
		return undefined;
	}
}

// Removes an array of words from a string
function removeFromString(arr, str) {
	const regex = new RegExp('\\b' + arr.join('|') + '\\b', 'gi');
	return str.replace(regex, '');
}

// Given two times, gives you the difference between them in minutes
function minutesSince(bigTime, littleTime) {
	const diff = bigTime - littleTime;
	return Math.floor((diff / 1000) / 60);
}