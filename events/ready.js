const functions = require('../functions.js');
const fs = require('fs');
const readSettings = JSON.parse(fs.readFileSync('./Read Only/Settings.json'));

// Start up process
module.exports = {
	name: 'Ready',
	once: true,
	execute(client) {
		client.guilds.cache.forEach(guild => versionCheck(guild));
		console.log('Líofa is Talking!');

		// Checks if Server Data files are in the correct format
		function versionCheck(server) {
			const GuildData = functions.liofaRead(server.id);
			if (GuildData == 'undefined') {
				functions.liofaJoin(server.id);
				return;
			}
			// Checks Server version against Default Settings version
			if (GuildData.Version != readSettings.Version) {

				// Fills in missing data
				for (const setting in readSettings.Settings) {
					if (typeof GuildData['Settings'][setting] === 'undefined') {
						GuildData['Settings'][setting] = readSettings.Settings[setting];
					}
				}
				for (const permission in readSettings.Permissions) {
					if (typeof GuildData['Permissions'][permission] === 'undefined') {
						GuildData['Permissions'][permission] = readSettings.Permissions[permission];
					}
				}
				GuildData['Version'] = readSettings.Version;
				// Updates Server Files
				fs.writeFileSync('./Server Data/' + server + '.json', JSON.stringify(GuildData, null, 2));
				console.log(server + ' updated to ' + readSettings.Version);
			}
		}
	},
};