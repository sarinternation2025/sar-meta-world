function isAdmin() {
  return process.env.SARU_ADMIN === 'true';
}

function checkAdminAccess() {
  if (!isAdmin()) {
    console.error('Error: Docker commands are restricted to admin users only.');
    process.exit(1);
  }
}

module.exports = {
  isAdmin,
  checkAdminAccess
};
