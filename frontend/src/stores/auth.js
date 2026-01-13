import { writable } from 'svelte/store';

export const user = writable(null);
export const token = writable(null);

export function logout() {
  user.set(null);
  token.set(null);
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
}

