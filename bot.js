// Defines required stuff
require('dotenv').config();
const Discord = require('discord.js');
const fs = require('fs');

// Discord stuff
const client = new Discord.Client();
client.login(process.env.BOTTOKEN);

// Registers Commands
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	// set a new item in the Collection
	// with the key as the command name and the value as the exported module
	client.commands.set(command.name, command);
}

// Variables
const readSettings = JSON.parse(fs.readFileSync('./Read Only/Settings.json'));
const functions = require('./functions.js');
const LiofaMessages = require('./Read Only/Responses');
const LiofaData = {};
fs.readdirSync('./Server Data/').forEach(file => {
	const name = file.slice(0, -5);
	LiofaData[name] = JSON.parse(fs.readFileSync('./Server Data/' + file));
});

// Defines callbacks
client.on('guildCreate', liofaJoin);
client.on('message', messageRec);

// Start-up process
client.once('ready', () => {
	client.guilds.cache.forEach(guild => versionCheck(guild));
	console.log('Líofa is Talking!');
});

// Checks if Server Data files are in the correct format
function versionCheck(server) {
	if (typeof LiofaData[server.id] == 'undefined') {
		liofaJoin(server);
		return;
	}
	server = server.id;
	// Checks Server version against Default Settings version
	if (LiofaData[server].Version != readSettings.Version) {

		// Fills in missing data
		for (const setting in readSettings.Settings) {
			if (typeof LiofaData[server]['Settings'][setting] === 'undefined') {
				LiofaData[server]['Settings'][setting] = readSettings.Settings[setting];
				LiofaData[server].Version = readSettings.Version;
			}
		}
		for (const permission in readSettings.Permissions) {
			if (typeof LiofaData[server]['Permissions'][permission] === 'undefined') {
				LiofaData[server]['Permissions'][permission] = readSettings.Permissions[permission];
				LiofaData[server].Version = readSettings.Version;
			}
		}
		// Updates Server Files
		fs.writeFileSync('./Server Data/' + server + '.json', JSON.stringify(LiofaData[server], null, 2));
		console.log(server + ' updated to ' + readSettings.Version);
	}
}

// Run on joining a new server
function liofaJoin(Server) {

	// Creates file for server data
	const FileAddress = './Server Data/' + Server.id + '.json';
	// Checks if file already exists
	if (fs.existsSync(FileAddress)) {
		return;
	}
	// Creates file and adds it to LiofaData
	fs.writeFileSync(FileAddress, JSON.stringify(readSettings, null, 2));
	LiofaData[Server.id] = JSON.parse(fs.readFileSync(FileAddress));
	console.log('Joined new server ' + Server.id.toString());
}

// Run on every message
async function messageRec(msg) {

	// Checks if Liofa should run on this message
	if (runLiofa(msg) === false) {
		return;
	}

	try {
		// Removes whitelisted words from the message
		const MessageContent = functions.removeFromString(LiofaData[msg.guild.id].Settings.whitelist, msg.content);

		// Asks what the language is
		const result = await functions.liofaCheck(MessageContent);


		// Responds if it is not listed as an acceptable language
		if (!LiofaData[msg.guild.id].Settings.languages.includes(result.code)) {

			// Warnings Check
			const warnCount = liofaMod(msg.guild.id, msg.author.id);
			if (warnCount < LiofaData[msg.guild.id].Settings.warnings) {

				// Checks if output for given language is available
				if (typeof LiofaMessages[result.code] === 'string') {
					msg.reply('**' + LiofaMessages[result.code] + '** \n `[' + result.name + '] [' + result.percent + '%] code: [' + result.code + ']`');
				}
				else {
					msg.reply('**Please speak English.** \n `[' + result.name + '] [' + result.percent + '%]`');
					msg.channel.send(result.name + ' must be added to Languages. code: `[' + result.code + ']`');
				}
			}
			else if (warnCount == LiofaData[msg.guild.id].Settings.warnings) {
				msg.reply('All further messages will be deleted unless you speak in English');
			}
			else if (warnCount > LiofaData[msg.guild.id].Settings.warnings) {
				msg.delete();
			}
		}
	}
	// Returns error for when language cannot be detected
	catch (err) {
		return;
	}
}

// Checks if Liofa should run
function runLiofa(msg) {
	// Checks if it's a Bot
	if (msg.author.bot === true) {
		return false;
	}
	// Checks if it's a command
	else if (msg.content.includes(LiofaData[msg.guild.id].Settings.prefix) && msg.content.search(LiofaData[msg.guild.id].Settings.prefix) == 0) {
		const args = msg.content.slice(LiofaData[msg.guild.id].Settings.prefix.length).trim().split(' ');
		const command = args.shift().toLowerCase();

		// Checks command exists
		if (!client.commands.has(command)) {
			return true;
		}

		try {
			// Checks you have permission to run the command
			if (!msg.member.hasPermission('ADMINISTRATOR') && !msg.member.roles.cache.some(role => LiofaData[msg.guild.id]['Permissions'][command].includes(role.id))) {
				msg.reply(' has insufficient permissions');
				return false;
			}
			// Executes the command and updates LiofaData
			client.commands.get(command).execute(msg, args);
			LiofaData[msg.guild.id] = JSON.parse(fs.readFileSync('./Server Data/' + msg.guild.id + '.json'));
			return false;
		}
		catch (error) {
			console.error(error);
			msg.reply('something went wrong');
		}
	}
	// Checks if they have a role from the excluded roles list
	else if (msg.member.roles.cache.some(ExcludedRole => LiofaData[msg.guild.id].Permissions.excluded.includes(ExcludedRole.id))) {
		return false;
	}
	else if (LiofaData[msg.guild.id].Settings.channels.includes(msg.channel.id)) {
		return false;
	}
	else if (LiofaData[msg.guild.id].Settings.channelIgnore.some(ignore => msg.channel.name.includes(ignore))) {
		return false;
	}
	// Returns whether Liofa is turned on for this server or not
	return LiofaData[msg.guild.id].Settings.state;
}

// Check Warning Status
function liofaMod(ServerID, UserID) {
	let UserRef = LiofaData[ServerID]['Watchlist'][UserID];

	if (typeof UserRef === 'undefined') {
		UserRef = { warnings : 1, time : Date.now() };
	}

	else if ((Date.now() - UserRef.time) < LiofaData[ServerID].Settings.time) {
		UserRef.warnings++;
		UserRef.time = Date.now();

	}
	else {
		UserRef = { warnings : 1, time : Date.now() };

	}
	LiofaData[ServerID]['Watchlist'][UserID] = UserRef;
	fs.writeFileSync('./Server Data/' + ServerID + '.json', JSON.stringify(LiofaData[ServerID], null, 2));
	console.log(ServerID + '.json updated');
	return UserRef.warnings;
}