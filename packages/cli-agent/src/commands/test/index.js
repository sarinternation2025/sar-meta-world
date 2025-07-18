const { Command } = require('commander');
const testCommand = new Command('test').description('Test commands');
module.exports = testCommand;
