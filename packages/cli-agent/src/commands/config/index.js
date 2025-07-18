const { Command } = require('commander');
const configCommand = new Command('config').description('Config commands');
module.exports = configCommand;
