const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
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
	everyone: true,

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
			return helpList(inputs, interaction);
		}
		else if (!Data.Permissions[comm]) {
			return interaction.reply('that\'s not a valid command!');
		}

		else {
			return helpComm(inputs, interaction);
		}
//Embed for commands
		async function helpComm(args) {
			const command = interaction.client.commands.get(comm);
			const helpComm = new MessageEmbed()
				.setColor('#ffffff')
				.addField('__**Name:**__', '> ' + command.data.name)
			if (command.data.description) {
				helpComm.addField('__**Description:**__', '> *' + command.data.description + '*');}
			if (command.usage) {
				helpComm.addField('__**Usage:**__', '> `' + prefix + command.data.name + command.usage + '`');}
			return interaction.reply({ embeds : [helpComm] });
		}
//Main Embed
		async function helpList(args) {
			var info = '';
			for (const [value] of Object.entries(Data.Permissions)) {
				info = info.concat(value + '\n');
			}
			info = info.concat(`\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`);

			const helpEmbed = new MessageEmbed()
				.setColor('#ffffff')
				.setTitle('Here\'s a list of all my commands:\n ')
				.setDescription(info)
				try {helpEmbed.setFooter('Help requested by ' + interaction.user.username);}
				catch {helpEmbed.setFooter('Help requested by ' + interaction.author.username);}
			return interaction.reply({ embeds : [helpEmbed] });
		}
	},
};
