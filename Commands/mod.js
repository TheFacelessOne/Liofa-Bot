const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const functions = require('../functions.js');
const Exp = [new RegExp('{'), new RegExp('"', 'g'), new RegExp(':', 'g'), new RegExp(',', 'g'), new RegExp('}', 'g')];
const repl = ['', '', ' : ', ', ', '', ''];

module.exports = {
	data : new SlashCommandBuilder()
		.setName('mod')
		.setDescription('View or remove infractions')
		.addSubcommand(subcommand =>
			subcommand.setName('info').setDescription('Find info on a user')
				.addUserOption(User => User
					.setName('user')
					.setDescription('User to find information on')
					.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand.setName('reset').setDescription('Reset a user\'s infractions')
				.addUserOption(User => User
					.setName('user')
					.setDescription('Target User')
					.setRequired(true))),

	async execute(interaction) {
		let target;
		let subComm;
		if (functions.liofaPrefixCheck(interaction)) {
			const args = interaction.content.split(' ');
			target = { id : functions.userToID(args[2], interaction), username : functions.userToString(functions.userToID(args[2], interaction), interaction) };
			subComm = args[1];
		}
		else {
			target = interaction.options.getUser('user');
			subComm = interaction.options.getSubcommand();
		}


		const GuildData = JSON.parse(fs.readFileSync('./Server Data/' + interaction.guild.id + '.json'));


		if (subComm === 'info') {

			if(GuildData.Watchlist[target.id] != 'undefined') {

				let timeSinceLastInfraction = functions.minutesSince(Date.now(), GuildData.Watchlist[target.id].time);
				let list = JSON.stringify(GuildData.Watchlist[target.id]);
				for (let x = 0; x < Exp.length; x++) list = list.replace(Exp[x], repl[x]);

				timeSinceLastInfraction = '\n' + timeSinceLastInfraction + ' minutes since last infraction';
				interaction.reply('name : ' + target.username + timeSinceLastInfraction);
				return;
			}
			else {
				interaction.reply(target.username + ' has 0 infractions');
			}
		}
		else if (subComm === 'reset') {
			GuildData.Watchlist[target.id].warnings = 0;
			interaction.reply(target.username + '\'s infractions have been reset');
			fs.writeFileSync('./Server Data/' + interaction.guild.id + '.json', JSON.stringify(GuildData, null, 2));
			return;
		}
		else {
			interaction.reply('Something went wrong! 😬');
			return;

		}
	},
};