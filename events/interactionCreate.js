const functions = require('../functions.js');


module.exports = {
	name: 'interactionCreate',
	execute(interaction) {
		if (interaction.isCommand()) {
			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) return;
			if(!functions.liofaPermsCheck(interaction, command)) return interaction.reply('You have insufficient permissions 😬');

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
			if(!functions.liofaPermsCheck(interaction, command)) return interaction.reply('You have insufficient permissions 😬');

			try {
				command.buttons[button](interaction, name);
			}
			catch (err) {
				console.log(err);
			}
		}
	},
};