import { writable } from 'svelte/store';

export const page = writable("main");
export const versionData = writable([])
export const activeData = writable([])