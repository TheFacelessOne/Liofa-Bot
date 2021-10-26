const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const functions = require('../functions.js');
const Exp = [new RegExp('{'), new RegExp('],', 'g'), new RegExp('\\[', 'g'), new RegExp('"', 'g'), new RegExp(']', 'g'), new RegExp(':', 'g'), new RegExp(',', 'g'), new RegExp('}', 'g')];
const repl = ['', '\n', '', '', '', ' : ', ', ', '', ''];

module.exports = {
	data : new SlashCommandBuilder()
		.setName('perms')
		.setDescription('View or edit command permissions')
		.addSubcommand(subcommand => subcommand.setName('toggle').setDescription('Lists all command permissions')
			.addStringOption(option => {
				const Data = JSON.parse(fs.readFileSync('./Read Only/Settings.json'));
				for (const [value] of Object.entries(Data.Permissions)) {
					option.setName('command').setDescription('A command to edit the permissions for').setRequired(true)
						.addChoice(value, value);
				}
				return option;
			})
			.addRoleOption(role => role.setName('role0').setDescription('A role to add/remove from the command permissions').setRequired(true))
			.addRoleOption(role => role.setName('role1').setDescription('A role to add/remove from the command permissions'))
			.addRoleOption(role => role.setName('role2').setDescription('A role to add/remove from the command permissions'))
			.addRoleOption(role => role.setName('role3').setDescription('A role to add/remove from the command permissions'))
			.addRoleOption(role => role.setName('role4').setDescription('A role to add/remove from the command permissions'))
			.addRoleOption(role => role.setName('role5').setDescription('A role to add/remove from the command permissions'))
			.addRoleOption(role => role.setName('role6').setDescription('A role to add/remove from the command permissions'))
			.addRoleOption(role => role.setName('role7').setDescription('A role to add/remove from the command permissions'))
			.addRoleOption(role => role.setName('role8').setDescription('A role to add/remove from the command permissions'))
			.addRoleOption(role => role.setName('role9').setDescription('A role to add/remove from the command permissions')))
		.addSubcommand(subcommand => subcommand.setName('list').setDescription('Lists all command permissions')),

	async execute(interaction) {
		const inputs = interaction.options;
		const GuildData = functions.liofaRead(interaction.guild.id);
		if (functions.liofaPrefixCheck(interaction)) {
			const args = interaction.content.split(' ');
			args.shift();
			if (args[0] === 'list') {
				return list();
			}
			else if (args[0] === 'toggle') {
				args.shift();
				const perm = args.shift();
				const roles = args;
				return permToggle(perm, roles, false);
			}
			else {
				return interaction.reply('Please follow "/perms" with "toggle" or "list"');
			}
		}
		else if (inputs.getSubcommand() === 'list') {
			return list();
		}
		else {
			const perm = inputs.getString('command');
			const roles = [];
			for (let i = 0; inputs.getRole('role' + i.toString()) != undefined; i++) {
				roles.push(inputs.getRole('role' + i.toString()).id);
			}
			return permToggle(perm, roles, true);
		}

		async function list() {
			for (const [value] of Object.entries(GuildData.Permissions)) {
				for (let i = GuildData.Permissions[value].length - 1; i >= 0; i--) {
					GuildData.Permissions[value][i] = functions.roleToString(GuildData.Permissions[value][i], interaction);
				}
			}
			let response = JSON.stringify(GuildData.Permissions);
			for (let i = 0; i < Exp.length; i++) {
				response = response.replace(Exp[i], repl[i]);
			}
			return interaction.reply(response);
		}

		async function permToggle(perm, roles, slash) {
			// if the permission you're asking for doesn't exist
			if (typeof GuildData.Permissions[perm] === 'undefined') {
				if (typeof perm != 'string') {
					interaction.reply('No permission given, use /perms list" to see all permissions');
				}
				else {
					interaction.reply('No such permission, use /perms list" to see all permissions');
				}
				return;
			}
			// Used for toggling what roles can use what commands
			else {
				if (roles.length === 0)	return interaction.reply('No roles given, please provide at least one role');

				roles = functions.roleToID(roles, interaction);

				if (!roles.every(role => interaction.guild.roles.cache.has(role))) return interaction.reply('One or more of the given roles do not exist');

				let response = '';
				const message = await interaction.reply('Editing Permissions...');
				for (let i = 0; i < roles.length; i++) {
					const permLength = GuildData.Permissions[perm].length;
					GuildData.Permissions[perm] = functions.arrayToggle(GuildData.Permissions[perm], roles[i]);
					if (permLength > GuildData.Permissions[perm].length) {
						response = response + '\n' + functions.roleToString(roles[i], interaction) + ' removed from ' + perm;
					}
					else {
						response = response + '\n' + functions.roleToString(roles[i], interaction) + ' added to ' + perm;
					}
					if (slash) {
						interaction.editReply(response);
					}
					else {
						message.edit(response);
					}
				}
				functions.liofaUpdate(interaction, GuildData);

			}
		}
	},

};