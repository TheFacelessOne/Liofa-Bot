const fs = require('fs');

module.exports = {
  name: 'help',
	description: 'Gives list of available commands and uses',
	execute(msg, args) {
		const Data = JSON.parse(fs.readFileSync('./Server Data/' + msg.guild.id + '.json'));
		// Lists all settings
		if (args[0] == 'toggle' || args[0] == + Data.Settings.prefix.toString() +'toggle') {
				msg.channel.send('`'+ Data.Settings.prefix.toString() +
        'toggle` turns on/off Liofa. When turned off, Liofa won\'t parse messages');
    }
    else if (args[0] == 'mod' || args[0] == + Data.Settings.prefix.toString() +'mod') {
				msg.channel.send('Commands for moderation:\n`'+ Data.Settings.prefix.toString() +
        'mod info <user>` -Gives number of infractions of user \n`'+ Data.Settings.prefix.toString() +
        'mod reset <user>` -Resets a user\'s infractions');
    }
    else if (args[0] == 'perms' || args[0] == + Data.Settings.prefix.toString() +'perms') {
				msg.channel.send('List or give a user permission \n`'+ Data.Settings.prefix.toString() +
        'perms list` -Gives a list of permissions and allowed users \n`'+ Data.Settings.prefix.toString() +
        'perms <permission> <user>` -Gives a user special permissions');
    }
    else if (args[0] == 'reset' || args[0] == + Data.Settings.prefix.toString() +'reset') {
				msg.channel.send('Rests all server files. Default prefix is \'&\' \n`'+ Data.Settings.prefix.toString() +'reset yes` -Confirms reset');
    }
    else if (args[0] == 'channels' || args[0] == + Data.Settings.prefix.toString() +'channels') {
				msg.channel.send('`'+ Data.Settings.prefix.toString() +
        'toggle` turns on/off Liofa. When turned off, Liofa will not parse messages');
    }
    else if (args[0] == 'settings' || args[0] == + Data.Settings.prefix.toString() +'settings') {
				msg.channel.send('Changes Settings for Liofa \n`'+ Data.Settings.prefix.toString() +
        'settings <option>` -Shows settings that can be configured \n`'+ Data.Settings.prefix.toString() +'settings list` -Gives the configuration of the server');
    }
    else if (args[0] == 'whitelist' || args[0] == + Data.Settings.prefix.toString() +'whitelist') {
				msg.channel.send('Manage words in Liofa\'s ignored words list \n`'+ Data.Settings.prefix.toString() +
        'whitelist list` -Lists all words in Liofa\'s ignored words list \n`'+ Data.Settings.prefix.toString() +
        'whitelist add` -Adds words to Whitelist\n `'+ Data.Settings.prefix.toString() +
        'whitelist remove` -Removes words from Whitelist');
    }
    else {
			msg.channel.send('**Liofa Commands:**`'+ Data.Settings.prefix.toString() +
      'toggle`-Toggles Liofa \n`'+ Data.Settings.prefix.toString() +
      'perms`-Toggles permissions per role \n`'+ Data.Settings.prefix.toString() +
      'reset`-Resets back to the default settings \n`'+ Data.Settings.prefix.toString() +
      'mod`-Moderator commands \n`'+ Data.Settings.prefix.toString() +
      'whitelist`-List of words to ignore \n`'+ Data.Settings.prefix.toString() +
      'settings`-Various settings for Liofa \n`'+ Data.Settings.prefix.toString() +
      'channels`-Whitelists channels \nFor more information on a command, use `'+ Data.Settings.prefix.toString() +'help <command>`');
		}
};
