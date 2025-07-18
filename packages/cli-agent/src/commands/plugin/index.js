const { Command } = require('commander');
const pluginCommand = new Command('plugin').description('Plugin commands');
module.exports = pluginCommand;
