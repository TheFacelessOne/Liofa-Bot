const fs = require('fs');

module.exports = {
	name: 'help',
	description: 'List all commands or info about a specific command.',
	usage: '[command name]',
	execute(msg, args) {
		const Data = JSON.parse(fs.readFileSync('./Server Data/' + msg.guild.id + '.json'));
		const info = [];
		const prefix = Data.Settings.prefix;
		const { commands } = msg.client;
		if (args.length == 0) {
			info.push('Here\'s a list of all my commands:');
			info.push(commands.map(command => command.name).join(', \n'));
			info.push(`\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`);
			return msg.channel.send(info);
		}
		const name = args[0].toLowerCase();
		const command = commands.get(name);
		if (!commands.get(args[0])) {
			return msg.reply('that\'s not a valid command!');
		}
		info.push(`**Name:** ${command.name}`);

		if (command.description) info.push(`**Description:** ${command.description}`);
		if (command.usage) info.push(`**Usage:** \`${prefix}${command.name} ${command.usage}\``);

		msg.channel.send(info, { split: true });
	},
};
