function isAdmin() {
  return process.env.SARU_ADMIN === 'true';
}
if (!isAdmin()) {
  console.error('Error: Monitor commands are restricted to admin users only.');
  process.exit(1);
} 