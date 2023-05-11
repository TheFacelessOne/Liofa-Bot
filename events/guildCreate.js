const functions = require('../functions.js');

module.exports = {
	name: 'GuildCreate',
	execute(server) {
		functions.liofaJoin(server.id);
	},
};