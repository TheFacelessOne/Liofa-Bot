// Required modules
require('dotenv').config();
const fs = require('fs');
const { Client, Collection, Events, GatewayIntentBits, IntentsBitField } = require('discord.js');

// What permissions the bot needs
// Used for what events the bot can listen for too
const myIntents = new IntentsBitField();
myIntents.add(
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.MessageContent,
	GatewayIntentBits.GuildMembers,
);

// The client we intend to login on
const client = new Client({ intents: myIntents });

// Registers Commands
client.commands = new Collection();
const commandFiles = fs.readdirSync('./Commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./Commands/${file}`);
	// set a new item in the Collection
	// with the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}

// Chooses which events to act on
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
	const event = require(`./events/${file}`);

	// event.once events only get called once
	// event.on events get called every time they happen
	if (event.once) {
		client.once(Events[event.name], (...args) => event.execute(...args));
	}
	else {
		client.on(Events[event.name], (...args) => event.execute(...args));
	}
}

client.login(process.env.DEVTOKEN).then(console.log('Liofa\'s ears perk up'));