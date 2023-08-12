module.exports = {
	name: 'GuildCreate',
	execute(server) {
		server.client.dbFunctions.addGuild(server.id)
	},
};