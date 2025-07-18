const { Command } = require('commander');
const process = require('process');

function isAdmin() {
  return process.env.SARU_ADMIN === 'true';
}

function checkAdminAccess() {
  if (!isAdmin()) {
    console.error('Error: DB commands are restricted to admin users only.');
    process.exit(1);
  }
}

const dbCommand = new Command('db').description('Database commands');

module.exports = {
  isAdmin,
  checkAdminAccess,
  dbCommand
};
