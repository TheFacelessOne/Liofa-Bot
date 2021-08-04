module.exports = { roleToString, roleToID, userToString, userToID };

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

function userToID(identifier, msg) {
	// eslint-disable-next-line no-useless-escape
	const exp = new RegExp(/^\<\@\d{15,}\>$/);
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
		msg.channel.send('Something went wrong converting the username. Maybe try using the user ID instead');
		console.log('User mention to ID conversion failure');
		console.log('guild name : ' + msg.guild.id + ' guild id : ' + msg.guild.name + ' message : ' + msg.content);
		return undefined;
	}
}