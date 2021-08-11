const fs = require('fs');
const Response = {};
Response[true] = 'on';
Response[false] = 'off';

module.exports = {
	name: 'toggle',
	description: 'toggles Liofa',
	execute(msg) {
		const Data = JSON.parse(fs.readFileSync('./Server Data/' + msg.guild.id + '.json'));
		if (typeof Data.Settings.state == 'boolean') {
			Data.Settings.state = !Data.Settings.state;
		}
		else {
			Data.Settings.state = true;
		}
		const Update = JSON.stringify(Data, null, 2);
		fs.writeFileSync('./Server Data/' + msg.guild.id + '.json', Update);
		msg.channel.send('Liofa is turned ' + Response[Data.Settings.state]);
	},
};