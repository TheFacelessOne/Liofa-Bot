module.exports = { roleToString, roleToID };

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