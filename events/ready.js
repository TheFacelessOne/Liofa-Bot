const { liofaJoin, liofaRead } = require('../functions.js');
const fs = require('fs');
const readSettings = JSON.parse(fs.readFileSync('./Read Only/Settings.json'));

// Checks if Server Data files are up to date
function versionCheck(server) {

	// Checks if files exist and creates them if they don't
	const GuildData = liofaRead(server.id);
	if (GuildData == 'undefined') {
		liofaJoin(server.id);
		return;
	}

	// Checks Server version against Default Settings version
	if (GuildData.Version != readSettings.Version) {

		fillMissingFields(GuildData['Settings'], readSettings.Settings);
		fillMissingFields(GuildData['Permissions'], readSettings.Permissions);
		GuildData['Version'] = readSettings.Version;

		// Updates Server Files
		fs.writeFileSync('./Server Data/' + server + '.json', JSON.stringify(GuildData, null, 2));
		console.log(server + ' updated to ' + readSettings.Version);
	}
}

function fillMissingFields(checkingThisData, againstThisData) {
	// Fills in missing data
	for (const item in againstThisData) {
		if (typeof checkingThisData[item] === 'undefined') {
			checkingThisData[item] = againstThisData[item];
		}
	}
}

// Start up process
module.exports = {
	name: 'ClientReady',
	once: true,
	async execute(client) {

		// .map allows for async updates on each file
		await Promise.all(client.guilds.cache.map( async (guild) => {
			versionCheck(guild);
		}))
		
		console.log('Server Files are up to date');
			
	},
};