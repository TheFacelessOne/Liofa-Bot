const functions = require('../functions.js');

module.exports = {
	name: 'InteractionCreate',
	execute(interaction) {
		// Checks required channel permissions
		if (!interaction.channel.permissionsFor(interaction.guild.members.me).has(['ViewChannel', 'SendMessages', 'ManageMessages'])) {
			return interaction.reply({ content : 'I don\'t have sufficient permissions required to run that command here\!😭\nPlease ensure I have these channel permissions:\n > **View Channel**\n > **Send Messages**\n > **Manage Messages**', ephemeral : true });}

		else if (interaction.isCommand()) {
			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) return;
			if (!functions.liofaPermsCheck(interaction, command)) return interaction.reply({ content : 'You have insufficient permissions 😬', ephemeral : true });

			try {
				command.execute(interaction);
			}
			catch (error) {
				console.error(error);
				interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			}
		}
		else if (interaction.isButton()) {
			const name = interaction.component.customId.split(' ');
			const button = name[1];
			const command = interaction.client.commands.get(name[0]);
			if (!command) return;
			if (!functions.liofaPermsCheck(interaction, command)) return interaction.reply({ content : 'You have insufficient permissions 😬', ephemeral : true });

			try {
				command.buttons[button](interaction, name);
			}
			catch (err) {
				console.log(err);
			}
		}
		else if (interaction.isSelectMenu()) {
			const name = interaction.values[0].split(' ');
			const menu = name[1];
			const command = interaction.client.commands.get(name[0]);
			if (!command) return;
			if (!functions.liofaPermsCheck(interaction, command)) return interaction.reply({ content : 'You have insufficient permissions 😬', ephemeral : true });

			try {
				command.menu[menu](interaction, name);
			}
			catch (err) {
				console.log(err);
			}
		}
	},
};
