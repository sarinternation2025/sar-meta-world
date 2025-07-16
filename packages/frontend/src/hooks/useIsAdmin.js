export function useIsAdmin() {
  return localStorage.getItem('SARU_AUTH') === 'true' && localStorage.getItem('SARU_ADMIN') === 'true';
} 