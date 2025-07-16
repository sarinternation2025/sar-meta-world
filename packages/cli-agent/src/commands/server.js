const { Command } = require('commander');
const serverCommand = new Command('server').description('Server commands');
module.exports = serverCommand;
