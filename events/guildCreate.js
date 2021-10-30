const functions = require('../functions.js');

module.exports = {
	name: 'guildCreate',
	execute(server) {
		functions.liofaJoin(server);
	},
};