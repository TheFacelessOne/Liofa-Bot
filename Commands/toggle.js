module.exports = {
	name: 'toggle',
	description: 'toggles Liofa',
	execute(msg, State) {
		console.log('toggling');
		if (State === true) {
			return false;
		}
		else {
			return true;
		}
	},
};