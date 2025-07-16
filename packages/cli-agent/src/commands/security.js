const { Command } = require('commander');
const securityCommand = new Command('security').description('Security commands');
module.exports = securityCommand;
