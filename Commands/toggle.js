const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const Response = {};
Response[true] = 'on';
Response[false] = 'off';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('toggle')
		.setDescription('toggles Liofa'),
	async execute(interaction) {
		const GuildData = JSON.parse(fs.readFileSync('./Server Data/' + interaction.guild.id + '.json'));
		if (typeof GuildData.Settings.state == 'boolean') {
			GuildData.Settings.state = !GuildData.Settings.state;
		}
		else {
			GuildData.Settings.state = true;
		}
		const Update = JSON.stringify(GuildData, null, 2);
		fs.writeFileSync('./Server Data/' + interaction.guild.id + '.json', Update);
		interaction.reply({ content: 'Liofa is turned ' + Response[GuildData.Settings.state], ephemeral: false });
	},
};