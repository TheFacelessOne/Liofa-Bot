const fs = require('fs');

module.exports = {
	name: 'reset',
	description: 'Reset all settings',
	execute(msg, args) {
		const FileAddress = 'Server Data/' + msg.guild.id + '.json';
		const tempSettings = JSON.parse(fs.readFileSync('Read Only/Settings.json'));
		if (fs.existsSync(FileAddress)) {
			if (args[0] == 'yes') {
				fs.writeFileSync('Server Data/' + msg.guild.id + '.json', JSON.stringify(tempSettings, null, 2));
				console.log('Reset settings for ' + msg.guild.id.toString());
				msg.channel.send('Settings File has been reset to default settings for ' + msg.guild.id.toString());
				return;
			}
			else {
				msg.channel.send('please confirm with "--reset yes"');
				return;
			}
		}
		else {
			fs.writeFileSync('Server Data/' + msg.guild.id + '.json', JSON.stringify(tempSettings, null, 2));
			console.log('Created settings file for ' + msg.guild.id.toString());
			msg.channel.send('Settings File has been created for ' + msg.guild.id.toString());
		}
	},
};