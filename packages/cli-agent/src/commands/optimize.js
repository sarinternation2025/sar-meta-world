const { Command } = require('commander');
const optimizeCommand = new Command('optimize').description('Optimize commands');
module.exports = optimizeCommand;
