module.exports = {
	name: 'threadCreate',
	execute(thread) {
		thread.join();
	},
};