const { liofaJoin } = require('../functions.js');

module.exports = {
	name: 'GuildCreate',
	execute(server) {
		liofaJoin(server.id);
	},
};