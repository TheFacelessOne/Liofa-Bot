const fs = require('fs');
const Response = {};
Response[true] = 'on';
Response[false] = 'off';

module.exports = {
	name: 'toggle',
	description: 'toggles Liofa',
	execute(msg) {
		const Data = JSON.parse(fs.readFileSync('./Server Data/' + msg.guild.id + '.json'));
		if (typeof Data.Settings.State == 'boolean') {
			Data.Settings.State = !Data.Settings.State;
		}
		else {
			Data.Settings.State = true;
		}
		const Update = JSON.stringify(Data, null, 2);
		fs.writeFileSync('./Server Data/' + msg.guild.id + '.json', Update);
		msg.channel.send('Liofa is turned ' + Response[Data.Settings.State]);
	},
};