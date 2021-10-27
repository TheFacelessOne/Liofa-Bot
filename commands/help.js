const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const Data = JSON.parse(fs.readFileSync('./Read Only/Settings.json'));
const functions = require('../functions.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Gives info on commands')
		.addStringOption(option => {
			for (const [value] of Object.entries(Data.Permissions)) {
				option.setName('command').setDescription('A command to edit the permissions for').setRequired(false)
					.addChoice(value, value);
			}
			return option;
		}),

	usage: '<command name>',

	async execute(interaction) {
		const GuildData = functions.liofaRead(interaction.guild.id);
		const prefix = GuildData.Settings.prefix;
		const inputs = interaction.options;
		let comm;
		if (functions.liofaPrefixCheck(interaction)) {
			const args = interaction.content.split(' ');
			comm = args[1];
		}
		else {
			comm = inputs.getString('command');
		}


		if (typeof comm != 'string') {
			let info = 'Here\'s a list of all my commands:\n';
			for (const [value] of Object.entries(Data.Permissions)) {
				info = info.concat(value + '\n');
			}
			info = info.concat(`\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`);
			return interaction.reply(info);
		}
		else if (!Data.Permissions[comm]) {
			return interaction.reply('that\'s not a valid command!');
		}
		else {
			const command = interaction.client.commands.get(comm);
			let info = `__**Name:**__ \n>\t**${command.data.name}**`;

			if (command.data.description) info = info.concat(`\n__**Description:**__ \n>\t*${command.data.description}*`);
			if (command.usage) info = info.concat(`\n__**Usage:**__ \n>\t\`${prefix}${command.data.name} ${command.usage}\``);

			interaction.reply(info);
		}
	},
};