const fs = require('fs');

module.exports = {
	name: 'reset',
	description: 'Reset all server settings to default',
	execute(msg, args) {
		const Data = JSON.parse(fs.readFileSync('./Server Data/' + msg.guild.id + '.json'));
		const FileAddress = 'Server Data/' + msg.guild.id + '.json';
		const tempSettings = JSON.parse(fs.readFileSync('Read Only/Settings.json'));

		// Checks given server has a file
		if (fs.existsSync(FileAddress)) {

			// Checks for confirmation on resetting the given server's files
			if (args[0] == 'yes') {
				fs.writeFileSync('Server Data/' + msg.guild.id + '.json', JSON.stringify(tempSettings, null, 2));
				console.log('Reset settings for ' + msg.guild.id.toString());
				msg.channel.send('Settings File has been reset to default settings for ' + msg.guild.id.toString());
				return;
			}

			// Asks for confirmation
			else {
				msg.channel.send('please confirm you wish to reset all server files with "' + Data.Settings.prefix + 'reset yes"');
				return;
			}
		}

		// Creates a file if the server doesn't have one
		else {
			fs.writeFileSync('Server Data/' + msg.guild.id + '.json', JSON.stringify(tempSettings, null, 2));
			console.log('Created settings file for ' + msg.guild.id.toString());
			msg.channel.send('Settings File has been created for ' + msg.guild.id.toString());
		}
	},
};