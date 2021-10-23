const fs = require('fs');

module.exports = {
	name: 'help',
	description: 'List all commands or info about a specific command.',
	usage: '[command name]',
	execute(msg, args) {
		const Data = JSON.parse(fs.readFileSync('./Server Data/' + msg.guild.id + '.json'));
		let info = '';
		const prefix = Data.Settings.prefix;
		const { commands } = msg.client;
		if (args.length == 0) {
			info = info.concat('Here\'s a list of all my commands:\n');
			info = info.concat(commands.map(command => command.name).join(', \n'));
			info = info.concat(`\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`);
			return msg.channel.send(info);
		}
		const name = args[0].toLowerCase();
		const command = commands.get(name);
		if (!commands.get(args[0])) {
			return msg.reply('that\'s not a valid command!');
		}
		info = info.concat('**Name:** ', command.name);

		if (command.description) info = info.concat(`**Description:** ${command.description}`);
		if (command.usage) info = info.concat = (`**Usage:** \`${prefix}${command.name} ${command.usage}\``);

		msg.channel.send(info);
	},
};
