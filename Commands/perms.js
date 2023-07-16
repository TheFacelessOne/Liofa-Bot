const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const fs = require('fs');
const { liofaRead, liofaPrefixCheck, capitalizeFirstLetter, arrayToggle, liofaUpdate } = require('../functions.js');
const Exp = [new RegExp('{'), new RegExp('],', 'g'), new RegExp('\\[', 'g'), new RegExp('"', 'g'), new RegExp(']', 'g'), new RegExp(':', 'g'), new RegExp(',', 'g'), new RegExp('}', 'g')];
const repl = ['', '\n', '', '', '', ' : ', ', ', '', ''];
const Data = JSON.parse(fs.readFileSync('./Read Only/Settings.json'));

async function displayPerms(interaction, permToDisplay) {
	const GuildData = liofaRead(interaction.guild.id);
	let list = '';
	if (permToDisplay === 'all') {
		for (const [value] of Object.entries(GuildData.Permissions)) {
			for (let i = GuildData.Permissions[value].length - 1; i >= 0; i--) {
				GuildData.Permissions[value][i] = interaction.guild.roles.resolve(GuildData.Permissions[value][i]).name;
			}
		}
		list = JSON.stringify(GuildData.Permissions);
		for (let i = 0; i < Exp.length; i++) {
			list = list.replace(Exp[i], repl[i]);
		}
	}
	else {
		for (let i = GuildData.Permissions[permToDisplay].length - 1; i >= 0; i--) {
			GuildData.Permissions[permToDisplay][i] = interaction.guild.roles.resolve(GuildData.Permissions[permToDisplay][i]).name;
		}
		list = JSON.stringify(GuildData.Permissions[permToDisplay]);
		for (let i = 0; i < Exp.length; i++) {
			list = list.replace(Exp[i], repl[i]);
		}
	}
	list = '__**' + capitalizeFirstLetter(permToDisplay) + ' Permissions**__ \n >>> ' + list;
	return list;
}

module.exports = {
	data : new SlashCommandBuilder()
		.setName('perms')
		.setDescription('View or edit command permissions')
		.addStringOption(option => {
			option.setName('command').setDescription('A command to edit the permissions for').setRequired(false);
			for (const [value] of Object.entries(Data.Permissions)) {
				option.addChoices({ name: value, value: value });
			}
			return option;
		})
		.addRoleOption(role => role.setName('role0').setDescription('A role to add/remove from the command permissions'))
		.addRoleOption(role => role.setName('role1').setDescription('A role to add/remove from the command permissions'))
		.addRoleOption(role => role.setName('role2').setDescription('A role to add/remove from the command permissions'))
		.addRoleOption(role => role.setName('role3').setDescription('A role to add/remove from the command permissions'))
		.addRoleOption(role => role.setName('role4').setDescription('A role to add/remove from the command permissions'))
		.addRoleOption(role => role.setName('role5').setDescription('A role to add/remove from the command permissions'))
		.addRoleOption(role => role.setName('role6').setDescription('A role to add/remove from the command permissions'))
		.addRoleOption(role => role.setName('role7').setDescription('A role to add/remove from the command permissions'))
		.addRoleOption(role => role.setName('role8').setDescription('A role to add/remove from the command permissions'))
		.addRoleOption(role => role.setName('role9').setDescription('A role to add/remove from the command permissions')),

	usage : '<[permission] [role]>',

	async execute(interaction) {
		const inputs = interaction.options;
		let GuildData = liofaRead(interaction.guild.id);
		let args, permission;
		if (liofaPrefixCheck(interaction)) {
			args = interaction.content.split(' ');
			args.shift();
			permission = args.shift();
		}
		else {
			permission = inputs.getString('command');
			args = [];
			for (let i = 0; inputs.getRole('role' + i.toString()) != undefined; i++) {
				args.push(inputs.getRole('role' + i.toString()).id);
			}
		}
		if (args[0] && permission) {
			await permToggle(permission, args);
			GuildData = liofaRead(interaction.guild.id);
		}
		else if (args[0] || permission) {
			interaction.channel.send('🤡 Please provide a permission AND a role if you would like to edit the permissions');
		}
		else {
			permission = 'all';
		}

		const info = await displayPerms(interaction, permission);

		const menu = new ActionRowBuilder()
			.addComponents(
				new StringSelectMenuBuilder()
					.setCustomId('perms menu')
					.setPlaceholder('View other permissions')
					.addOptions(permsMenuMaker()),
			);

		await interaction.reply({ content: info, components: [menu] });

		async function permToggle(perm, roles) {
			// if the permission you're asking for doesn't exist
			if (typeof GuildData.Permissions[perm] === 'undefined') {
				return interaction.reply('No such permission');
			}
			// Used for toggling what roles can use what commands
			else {
				roles = await Promise.all(roles.map(async (role) => interaction.guild.roles.resolve(role).id))

				if (!roles.every(role => interaction.guild.roles.cache.has(role))) return interaction.reply('One or more of the given roles do not exist');

				let response = '';
				const message = await interaction.channel.send('Editing Permissions...');
				for (let i = 0; i < roles.length; i++) {
					const permLength = GuildData.Permissions[perm].length;
					GuildData.Permissions[perm] = arrayToggle(GuildData.Permissions[perm], roles[i]);
					if (permLength > GuildData.Permissions[perm].length) {
						response = response + '\n❌ ' + interaction.guild.roles.resolve(roles[i]).name + ' removed from ' + perm;
					}
					else {
						response = response + '\n✅ ' + interaction.guild.roles.resolve(roles[i]).name + ' added to ' + perm;
					}
				}
				message.edit(response);
				liofaUpdate(interaction, GuildData);

			}
		}

		function permsMenuMaker() {
			const menuOptions = [{
				label: 'All',
				description: 'View all permissions',
				value: 'perms info all',
			}];
			for (const [value] of Object.entries(Data.Permissions)) {
				menuOptions.push({
					label: capitalizeFirstLetter(value),
					value: 'perms info ' + value,
				});
			}
			return menuOptions;
		}
	},

	menu : {
		'info' : async function info(interaction, name) {
			await interaction.reply({ content: 'Loading Permissions...' });
			const list = await displayPerms(interaction, name[2]);
			interaction.deleteReply();
			interaction.message.edit({ content: list });
		},
	},
};
