module.exports = {
	minutesSince,
	minsToMilli,
	arrayToggle,
	liofaPermsCheck,
	onlyOne,
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

function liofaPermsCheck(msg, command) {
	const isAdmin = msg.member.permissions.has([PermissionsBitField.Flags.Administrator]);
	const hasPerms = msg.member.roles.cache.some(role => GuildData['Permissions'][command.data.name].includes(role.id));
	const everyoneCanUse = command.everyone;
	const isBotDev = ((msg.member.id == process.env.BOTADMIN) && (msg.guild.id != process.env.TESTINGSERVER));
	return isAdmin || hasPerms || everyoneCanUse || isBotDev;
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
