const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, ButtonBuilder, MessageEmbed } = require('discord.js');
const functions = require('../functions.js');
const bold = functions.boldText;


async function displayInfractions(interaction, target) {
	const GuildData = functions.liofaRead(interaction.guild.id);
	const timeSinceLastInfraction = functions.minutesSince(Date.now(), GuildData.Watchlist[target.id].time);
	const warningCount = GuildData.Watchlist[target.id].warnings;

	const infractionsEmbed = new MessageEmbed()
		.setColor('#a60000')
		.setTitle(bold(target.username))
		.addField('Minutes since last infraction', bold(timeSinceLastInfraction))
		.addField('Warnings given', bold(warningCount))
		.setThumbnail('https://cdn.discordapp.com/avatars/' + target.id + '/' + target.avatar + '.png')
		.setFooter('Settings listed are for ' + interaction.guild.id);
	return infractionsEmbed;
}

async function modButtons(resetButton, target) {
	const display = new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder()
				.setCustomId('mod reset ' + [target.id]).setLabel('Reset infractions').setStyle(ButtonStyle.Success).setDisabled(resetButton),
			new ButtonBuilder()
				.setCustomId('mod increase ' + [target.id]).setLabel('+1 Infraction').setStyle(ButtonStyle.Danger),
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
			target = await message.guild.members.fetch(functions.userToID(args[1], message));
			target = target.user;
			if (typeof target === 'undefined') return;
		}
		else {
			target = message.options.getUser('user');
		}

		return info(message);

		async function info(interaction) {
			let buttons = await modButtons(true, target);

			if(GuildData.Watchlist[target.id] != null) {
				if (GuildData.Watchlist[target.id].warnings != 0) buttons = await modButtons(false, target);

				return interaction.reply({ embeds: [await displayInfractions(interaction, target)], components : [buttons] });
			}
			else {
				return interaction.reply({ content : target.username + ' has 0 infractions', components : [buttons] });
			}
		}
	},
	buttons : {
		'reset' : async function reset(interaction, name) {
			const GuildData = functions.liofaRead(interaction.guild.id);
			let target = await interaction.guild.members.fetch(functions.userToID(name[2], interaction));
			target = target.user;
			if (typeof target === 'undefined') return;
			GuildData.Watchlist[target.id].warnings = 0;
			const message = await interaction.message.fetch();
			message.delete();
			interaction.channel.send(target.username + '\'s infractions have been reset');
			functions.liofaUpdate(interaction, GuildData);
			return;
		},
		'undo' : async function undo(interaction, name) {
			const GuildData = functions.liofaRead(interaction.guild.id);
			let target = await interaction.guild.members.fetch(functions.userToID(name[2], interaction));
			target = target.user;
			if (typeof target === 'undefined') return;
			if (GuildData.Watchlist[target.id].warnings <= 0) return interaction.reply({ content : '🛑 User already has less than 1 infraction', ephemeral : true });
			GuildData.Watchlist[target.id].warnings--;
			functions.liofaUpdate(interaction, GuildData);
			const message = await interaction.message.fetch();
			message.delete();
			return interaction.reply({ content : target.username + ' has one less infraction', ephemeral : true });
		},
		'increase' : async function increase(interaction, name) {
			let target = await interaction.guild.members.fetch(functions.userToID(name[2], interaction));
			target = target.user;
			if (typeof target === 'undefined') return;
			functions.liofaMod(interaction, target.id);
			const message = await interaction.message.fetch();
			message.delete();
			interaction.reply({ embeds: [await displayInfractions(interaction, target)], components: [await modButtons(false, target)] });
		},
	},
};