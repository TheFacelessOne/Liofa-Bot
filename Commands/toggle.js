const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const Response = {};
Response[true] = 'on';
Response[false] = 'off';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('toggle')
		.setDescription('toggles Liofa'),
	async execute(msg) {
		const Data = JSON.parse(fs.readFileSync('./Server Data/' + msg.guild.id + '.json'));
		if (typeof Data.Settings.state == 'boolean') {
			Data.Settings.state = !Data.Settings.state;
		}
		else {
			Data.Settings.state = true;
		}
		const Update = JSON.stringify(Data, null, 2);
		fs.writeFileSync('./Server Data/' + msg.guild.id + '.json', Update);
		msg.reply({ content: 'Liofa is turned ' + Response[Data.Settings.state], ephemeral: false });
	},
};