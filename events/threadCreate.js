module.exports = {
	name: 'ThreadCreate',
	execute(thread) {
		thread.join();
	},
};