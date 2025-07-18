const { Command } = require('commander');
const gitCommand = new Command('git').description('Git commands');
module.exports = gitCommand;
