// Defines required stuff
require('dotenv').config();
const fs = require('fs');

// Discord stuff
const { Client, Collection, Events, GatewayIntentBits, IntentsBitField } = require('discord.js');

const myIntents = new IntentsBitField();

myIntents.add(
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.MessageContent,
	GatewayIntentBits.GuildMembers,
);
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

// Defines callbacks
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(Events[event.name], (...args) => event.execute(...args));
	}
	else {
		client.on(Events[event.name], (...args) => event.execute(...args));
	}
}

client.login(process.env.BOTTOKEN).then(console.log('liofa is listening'));
