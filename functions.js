module.exports = {
	minutesSince,
	minsToMilli,
	arrayToggle,
	liofaRead,
	liofaJoin,
	liofaPrefixCheck,
	liofaPermsCheck,
	liofaExcludedRolesOrChannels,
	onlyOne,
	liofaUpdate,
	capitalizeFirstLetter,
	watchlistIncrement,
	boldText };
const fs = require('fs');
const { PermissionsBitField } = require('discord.js');

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

function liofaJoin(newServer) {
	const newServerFile = './Server Data/' + newServer + '.json';
	if (fs.existsSync(newServerFile)) return;
	fs.copyFileSync('./Read Only/Settings.json', newServerFile);
	console.log('Joined new server ' + newServer.toString());
}

function liofaPrefixCheck(msg) {
	if (msg.type === 2) return false;
	const GuildData = liofaRead(msg.guild.id);
	return msg.cleanContent.includes(GuildData.Settings.prefix) && msg.cleanContent.search(GuildData.Settings.prefix) == 0;
}

function liofaPermsCheck(msg, command) {
	liofaJoin(msg.guild.id);
	const GuildData = liofaRead(msg.guild.id);
	const isAdmin = msg.member.permissions.has([PermissionsBitField.Flags.Administrator]);
	const hasPerms = msg.member.roles.cache.some(role => GuildData['Permissions'][command.data.name].includes(role.id));
	const everyoneCanUse = command.everyone;
	const isBotDev = ((msg.member.id == process.env.BOTADMIN) && (msg.guild.id != process.env.TESTINGSERVER));
	return isAdmin || hasPerms || everyoneCanUse || isBotDev;
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

function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

// Check and increase Warnings
function watchlistIncrement(interaction, target) {
	target = interaction.guild.members.resolve(target).user.id;
	const db = interaction.client.dbFunctions;
	const dbRequest = db.getWatchlist(interaction.guild.id, target);
	let { infractions, time } = dbRequest || {infractions : 0, time : -1};

	const infractionTimeout = db.getGuildData('SETTINGS', interaction.guild.id, 'infraction_length');
	const infractionsHaveTimedOut = (Date.now() - Date.parse(time)) > infractionTimeout;

	if (infractionsHaveTimedOut) { infractions = 0 }
	
	infractions++;
	db.updateWatchlist(interaction.guild.id, target, infractions);
	return infractions;
}

function boldText(string) {
	return '**' + string + '**';
}
