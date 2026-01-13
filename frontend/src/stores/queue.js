import { writable } from 'svelte/store';

export const queueData = writable([]);
export const myPosition = writable(null);
export const estimatedWait = writable(0);

