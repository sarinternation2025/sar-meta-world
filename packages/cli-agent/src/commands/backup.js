const { Command } = require('commander');
const backupCommand = new Command('backup').description('Backup commands');
module.exports = backupCommand;
