module.exports = {
	roleToString,
	roleToID,
	userToString,
	userToID,
	channelToString,
	channelToID,
	removeFromString,
	removeEmojis,
	liofaCheck,
	minutesSince,
	minsToMilli,
	arrayToggle,
	liofaRead,
	liofaFilter,
	liofaJoin,
	liofaPrefixCheck,
	liofaPermsCheck,
	liofaExcludedRolesOrChannels,
	onlyOne,
	liofaUpdate };
const cld = require('cld');
const fs = require('fs');

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
	if (typeof identifier == 'object') {
		for (let i = 0; i < identifier.length; i++) {
			identifier[i] = roleToID(identifier[i], msg);
		}
		return identifier;
	}
	else if (!isNaN(identifier)) {
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
		return undefined;
	}
}

// Converts Channels IDs to their Name
function channelToString(identifier, msg) {
	if (!isNaN(identifier) && msg.guild.channels.cache.has(identifier)) {
		const LookUpChannel = msg.guild.channels.cache.find(channel => channel.id === identifier);
		let output = LookUpChannel.name;
		if (LookUpChannel.type === 'GUILD_CATEGORY') output = '📁 ' + output;
		if (LookUpChannel.type === 'GUILD_TEXT') output = '✍ ' + output;
		return output;
	}
	else if (typeof identifier == 'string') {
		return identifier;
	}
	else {
		return 'Unknown Channel';
	}
}

// Converts Channel mentions to their ID
function channelToID(identifier, msg) {
	// eslint-disable-next-line no-useless-escape
	const exp1 = new RegExp(/^\<\#\d{10,}\>$/);
	if (typeof identifier == 'object') {
		for (let i = 0; i < identifier.length; i++) {
			identifier[i] = channelToID(identifier[i], msg);
		}
		return identifier;
	}
	if (!isNaN(identifier)) {
		return identifier;
	}
	else if (identifier.match(exp1)) {
		while(isNaN(identifier.charAt(0))) {
			identifier = identifier.substring(1);
		}
		identifier = identifier.substring(0, identifier.length - 1);
		return identifier;
	}
	else {
		msg.channel.send('Something went wrong converting the channel name. Maybe try using the channel ID instead');
		return undefined;
	}

}

// Removes an array of words from a string
function removeFromString(arr, str) {
	if (arr.length > 0) {
		const regex = new RegExp(arr.join('|'), 'gi');
		return str.replace(regex, ' ');
	}
	else {
		return str;
	}
}

function removeEmojis(msg) {
	// eslint-disable-next-line no-useless-escape
	const regex = new RegExp('\<a?\:[^ \>]+\>', 'g');
	return msg.replace(regex, ' ');
}

// Given two times, gives you the difference between them in minutes
function minutesSince(bigTime, littleTime) {
	const diff = bigTime - littleTime;
	return Math.floor((diff / 1000) / 60);
}

// Converts milliseconds into minutes
function minsToMilli(minutes) {
	return minutes * 60000;
}

// Adds to array if the input doesn't exist, removes from array if it does
function arrayToggle(list, input) {
	if (list.includes(input)) {
		const index = list.indexOf(input);
		list.splice(index, 1);
	}
	else {
		list.push(input);
	}
	return list;
}

function liofaRead(server) {
	if (!fs.existsSync('./Server Data/' + server + '.json')) {
		liofaJoin(server);
	}
	return JSON.parse(fs.readFileSync('./Server Data/' + server + '.json'));
}

function liofaFilter(msg) {
	let MessageContent = removeEmojis(msg.content);
	MessageContent = removeFromString(liofaRead(msg.guild.id).Settings.whitelist, MessageContent);
	if (!/\S/.test(MessageContent)) {
		return false;
	}
	else {
		return MessageContent;
	}
}

function liofaJoin(newServer) {
	const newServerFile = './Server Data/' + newServer + '.json';
	if (fs.existsSync(newServerFile)) return;
	fs.copyFileSync('./Read Only/Settings.json', newServerFile);
	console.log('Joined new server ' + newServer.toString());
}

function liofaPrefixCheck(msg) {
	if (msg.type === 'APPLICATION_COMMAND') return false;
	const GuildData = liofaRead(msg.guild.id);
	return msg.cleanContent.includes(GuildData.Settings.prefix) && msg.cleanContent.search(GuildData.Settings.prefix) == 0;
}

function liofaPermsCheck(msg, command) {
	const GuildData = liofaRead(msg.guild.id);
	const isAdmin = msg.member.permissions.has('ADMINISTRATOR');
	const hasPerms = msg.member.roles.cache.some(role => GuildData['Permissions'][command.data.name].includes(role.id));
	return isAdmin || hasPerms;
}

function liofaExcludedRolesOrChannels(msg) {
	const GuildData = liofaRead(msg.guild.id);
	const roleIsExcluded = msg.member.roles.cache.some(ExcludedRole => GuildData.Permissions.excluded.includes(ExcludedRole.id));
	const channelIsExcluded = GuildData.Settings.channels.includes(msg.channel.id);
	const channelNameIsIgnored = GuildData.Settings.channelIgnore.some(ignore => msg.channel.name.includes(ignore));
	const channelParentIsExcluded = GuildData.Settings.channels.includes(msg.channel.parentId);
	return roleIsExcluded || channelIsExcluded || channelNameIsIgnored || channelParentIsExcluded;
}

function onlyOne(arr) {
	let count = 0;
	for (let i = 0; i < arr.length && count < 2; i++) {
		if (arr[i]) {
			count++;
		}
	}
	return count;
}

function liofaUpdate(interaction, GuildData) {
	fs.writeFileSync('./Server Data/' + interaction.guild.id + '.json', JSON.stringify(GuildData, null, 2));
	console.log(interaction.guild.id.toString() + ' JSON updated');
}