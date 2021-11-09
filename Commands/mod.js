const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');
const functions = require('../functions.js');
const Exp = [new RegExp('{'), new RegExp('"', 'g'), new RegExp(':', 'g'), new RegExp(',', 'g'), new RegExp('}', 'g')];
const repl = ['', '', ' : ', ', ', '', ''];

async function displayInfractions(interaction, target) {
	const GuildData = functions.liofaRead(interaction.guild.id);
	let timeSinceLastInfraction = functions.minutesSince(Date.now(), GuildData.Watchlist[target.id].time);
	let list = JSON.stringify(GuildData.Watchlist[target.id]);
	for (let x = 0; x < Exp.length; x++) list = list.replace(Exp[x], repl[x]);

	timeSinceLastInfraction = '\n__**Time:**__ \n>\t`' + timeSinceLastInfraction + '` minutes since last infraction';
	const warningCount = '\n__**Warnings:**__ \n>\t`' + GuildData.Watchlist[target.id].warnings + '` warnings';
	return '__**Name:**__ \n>\t' + target.username + timeSinceLastInfraction + warningCount;
}

async function modButtons(resetButton, target) {
	const display = new MessageActionRow()
		.addComponents(
			new MessageButton()
				.setCustomId('mod reset ' + [target.id]).setLabel('Reset infractions').setStyle('SUCCESS').setDisabled(resetButton),
			new MessageButton()
				.setCustomId('mod increase ' + [target.id]).setLabel('+1 Infraction').setStyle('DANGER'),
		);
	return display;
}

module.exports = {
	data : new SlashCommandBuilder()
		.setName('mod')
		.setDescription('View or remove infractions')
		.addUserOption(User => User
			.setName('user')
			.setDescription('User to find information on')
			.setRequired(true)),

	usage: '[user]',

	async execute(message) {
		const GuildData = functions.liofaRead(message.guild.id);
		let target;
		if (functions.liofaPrefixCheck(message)) {
			const args = message.content.split(' ');
			target = { id : functions.userToID(args[1], message), username : functions.userToString(functions.userToID(args[1], message), message) };
		}
		else {
			target = message.options.getUser('user');
		}

		return info(message);

		async function info(interaction) {
			let buttons = await modButtons(true, target);

			if(GuildData.Watchlist[target.id] != null) {
				if (GuildData.Watchlist[target.id].warnings != 0) buttons = await modButtons(false, target);

				return interaction.reply({ content: await displayInfractions(interaction, target), components : [buttons] });
			}
			else {
				return interaction.reply({ content : target.username + ' has 0 infractions', components : [buttons] });
			}
		}
	},
	buttons : {
		'reset' : async function reset(interaction, name) {
			const GuildData = functions.liofaRead(interaction.guild.id);
			const target = { id : functions.userToID(name[2], interaction), username : functions.userToString(functions.userToID(name[2], interaction), interaction) };
			GuildData.Watchlist[target.id].warnings = 0;
			const message = await interaction.message.fetch();
			message.delete();
			interaction.channel.send(target.username + '\'s infractions have been reset');
			functions.liofaUpdate(interaction, GuildData);
			return;
		},
		'undo' : async function undo(interaction, name) {
			const GuildData = functions.liofaRead(interaction.guild.id);
			const target = { id : functions.userToID(name[2], interaction), username : functions.userToString(functions.userToID(name[2], interaction), interaction) };
			if (GuildData.Watchlist[target.id].warnings <= 0) return interaction.reply({ content : '🛑 User already has less than 1 infraction', ephemeral : true });
			GuildData.Watchlist[target.id].warnings--;
			functions.liofaUpdate(interaction, GuildData);
			const message = await interaction.message.fetch();
			message.delete();
			return interaction.reply({ content : target.username + ' has one less infraction', ephemeral : true });
		},
		'increase' : async function increase(interaction, name) {
			const target = { id : functions.userToID(name[2], interaction), username : functions.userToString(functions.userToID(name[2], interaction), interaction) };
			functions.liofaMod(interaction, target.id);
			const message = await interaction.message.fetch();
			message.delete();
			interaction.reply({ content: await displayInfractions(interaction, target), components: [await modButtons(false, target)] });
		},
	},
};