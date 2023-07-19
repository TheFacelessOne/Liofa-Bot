const Database = require("better-sqlite3");
const db = new Database("./liofa.sqlite");

// Start up process
module.exports = {
	name: 'ClientReady',
	once: true,
	async execute(client) {

		console.log("Liofa is trying to remember how databases work");
		prepDatabases();
		client.dbFunctions = prepDatabaseFunctions();
		let guildCount = 0;

		// .map allows for async updates on each file
		await Promise.all(client.guilds.cache.map( async (guild) => {
			if (!client.dbFunctions.getGuildData('SETTINGS', guild.id)) {
				client.dbFunctions.addGuild(guild.id);
			}
			guildCount++;
			db.prepare(`UPDATE SETTINGS SET last_connected = (datetime('now','localtime')) WHERE ${guild.id}`).run();
		}))
		console.log(`Liofa is friends with ${guildCount} servers`);
		console.groupEnd();
	},
};

function prepDatabases() {
	/*
		English is enabled because it's the most likely use case
		Scots is enabled because it is often picked up by accident by the bot
		Irish is enabled because I'm Irish ;P
	*/
	const defaultAllowedLanguages = JSON.stringify(['en', 'sco', 'ie']);
	db.prepare(`
		CREATE TABLE IF NOT EXISTS SETTINGS (
			guild_id INTEGER PRIMARY KEY,
			last_connected DATE DEFAULT (datetime('now','localtime')),
			state BOOLEAN DEFAULT TRUE,
			disabled_channels_ids TEXT DEFAULT '[]',
			disabled_channel_keywords TEXT DEFAULT '[]',
			approved_languages TEXT DEFAULT '${defaultAllowedLanguages}',
			ignored_words TEXT DEFAULT '[]',
			infraction_length INTEGER DEFAULT 1800000,
			start_warnings INTEGER DEFAULT 0,
			warnings_given INTEGER DEFAULT 3,
			button_translate BOOLEAN DEFAULT TRUE,
			button_undo BOOLEAN DEFAULT TRUE,
			button_support BOOLEAN DEFAULT TRUE,
			button_vote BOOLEAN DEFAULT TRUE,
			tier INTEGER DEFAULT 0,
			modlog_channel_id INTEGER DEFAULT 0
		);
	`).run();
	db.prepare(`
		CREATE TABLE IF NOT EXISTS PERMISSIONS (
			guild_id TEXT PRIMARY KEY,
			toggle TEXT DEFAULT '[]',
			perms TEXT DEFAULT '[]',
			reset TEXT DEFAULT '[]',
			mod TEXT DEFAULT '[]',
			excluded TEXT DEFAULT '[]',
			whitelist TEXT DEFAULT '[]',
			settings TEXT DEFAULT '[]',
			channels TEXT DEFAULT '[]',
			help TEXT DEFAULT '[]',
			invite TEXT DEFAULT '[]',
			buttons TEXT DEFAULT '[]',
			modlog TEXT DEFAULT '[]',
			FOREIGN KEY (guild_id) REFERENCES SETTINGS(guild_id)
		);
	`).run();
	db.prepare(`
		CREATE TABLE IF NOT EXISTS WATCHLIST (
			guild_id INTEGER NOT NULL,
			user_id INTEGER NOT NULL,
			infractions INTEGER DEFAULT 0,
			time DATE DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (guild_id, user_id),
			FOREIGN KEY (guild_id) REFERENCES SETTINGS(guild_id)
		);
	`).run();
		db.pragma("synchronous = 1");
		db.pragma("journal_mode = wal");

		process.on('SIGINT', () => {
			db.close(); 
			console.log('Liofa\'s going back to sleep');
			process.exit(0);
			}
		);
}

function prepDatabaseFunctions() {
	
		return {

			addGuild : function(guildID) {
				db.prepare(`INSERT OR REPLACE INTO SETTINGS (guild_id) VALUES (?)`).run(guildID);
				db.prepare(`INSERT OR REPLACE INTO PERMISSIONS (guild_id) VALUES (?)`).run(guildID);
				console.log(`Guild Added ${guildID}`);
			},
		
			getGuildData : function(tableName, guildID, dataQuery = '*') {
				const blockedTables = ['WATCHLIST'];
				try{
					if (blockedTables.includes(tableName)) throw new Error('Use a different function for reading this table');
					return db.prepare(`SELECT ${dataQuery} FROM ${tableName} WHERE guild_id = ${guildID}`).get();
				}
				catch(err) {console.error(err)}
			},
		
			updateGuildData : function(tableName, guildID, dataObject) {
				const blockedTables = ['WATCHLIST'];
				try {
					if (blockedTables.includes(tableName)) throw new Error('Use a different function for updating this table');
					let newData = '';
					Object.keys(dataObject).forEach( key => {
						newData += `${key} = ${dataObject[key]}, `
					})
					newData = newData.slice(0, -2);
					db.prepare(`UPDATE ${tableName} SET ${newData} WHERE ${guildID}`).run();
				}
				catch(err) {console.error(err)}
			},

			updateWatchlist : function (guildID, userID, infractions) {db.prepare(`INSERT OR REPLACE INTO WATCHLIST (guild_id, user_id, infractions, time) VALUES (${guildID}, ${userID}, ${infractions}, datetime('now', 'localtime'))`).run() },
		
			getWatchlist : function (guildID, userID) {return db.prepare(`SELECT * FROM WATCHLIST WHERE guild_id = ${guildID} AND user_id = ${userID}`).get() },
		
		}
}