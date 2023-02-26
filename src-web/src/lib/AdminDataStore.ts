import { Card, CardSearchResults, Price } from './Card';
import type { Expansion, Series } from './CardMeta';
import { writable } from 'svelte/store';
import { baseURL } from './Utils';

/////////////
/*Meta data*/
/////////////

//Set options
export const setStore = writable(new Array<Expansion>());
//Series options
export const seriesStore = writable(new Array<Series>());
//Rarity options
export const rarityStore = writable(new Array<string>());

export const variantOptions = [
	'Holofoil',
	'Reverse Holofoil',
	'Normal',
	'1st Edition',
	'Unlimited'
];

////////////////////////////////
/*Global card search variables*/
////////////////////////////////

//List of sets(expantions) selected
export const selectedSetsStore = writable(new Array<string>());
export let selectedSets = [];
selectedSetsStore.subscribe((val) => (selectedSets = val));
//List of Card Rarities selected
export const selectedRaritiesStore = writable(new Array<string>());
export let selectedRarities = [];
selectedRaritiesStore.subscribe((val) => (selectedRarities = val));
//Search term entered
export const searchTermStore = writable('');
export let searchTerm = '';
searchTermStore.subscribe((val) => (searchTerm = val));
//Sort button pressed
export const sortStore = writable('');
export let sort = '';
sortStore.subscribe((val) => (sort = val));
//Card Results
export const cardResultStore = writable(new CardSearchResults());
//Selected display option [case, table]
export const cardSearchDisplay = writable('grid');
//Current page
export let page = 0;
export const pageStore = writable(0);
pageStore.subscribe((val) => (page = val));

/**
 * Init admin store
 */
export function initAdminStore() {
	expansions().then((val) => setStore.set(val));
	series().then((val) => seriesStore.set(val));
}

export function executeCardSearch() {
	let url = new URL(`${baseURL}/admin/pokemon/cards/${page}`);
	if (selectedSets.length !== 0) {
		url.searchParams.set(`expansions`, encodeURI(JSON.stringify(selectedSets)));
	}
	if (searchTerm && searchTerm !== '') {
		let term = searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1);
		url.searchParams.set(`name`, term);
	}
	if (selectedRarities && selectedRarities.length !== 0) {
		url.searchParams.set(`rarities`, encodeURI(JSON.stringify(selectedRarities)));
	}
	if (sort && sort !== '') {
		url.searchParams.set('sort', sort);
	}
	fetch(url.toString())
		.then((res) => res.json())
		.then(
			(data) => {
				cardResultStore.set(data);
			},
			(err) => {
				console.log(err);
			}
		);
}

/**
 * Get set expantions
 * @returns
 */
function expansions(): Promise<Expansion[]> {
	return new Promise<Expansion[]>((resolve, reject) => {
		fetch(`${baseURL}/admin/pokemon/expansions`)
			.then((res) => res.json())
			.then((data) => resolve(data))
			.catch((err) => reject(err));
	});
}

/**
 * Get Series
 * @returns
 */
function series(): Promise<Series[]> {
	return new Promise<Series[]>((resolve, reject) => {
		fetch(`${baseURL}/admin/pokemon/series`)
			.then((res) => res.json())
			.then((data) => resolve(data))
			.catch((err) => reject(err));
	});
}

/**
 * Get List of Pokemon Rarities
 * @returns List of rarities
 */
function rarities(): Promise<string[]> {
	return new Promise<string[]>((resolve, reject) => {
		fetch(`${baseURL}/admin/pokemon/card/rarities`)
			.then((res) => res.json())
			.then((data) => resolve(data))
			.catch((err) => reject(err));
	});
}

export function updateDbPath(path: string): Promise<boolean> {
	return new Promise<boolean>((resolve, reject) => {
		fetch(`${baseURL}/meta/admindb`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ data_path: path })
		})
			.then((_) => {
				initAdminStore();
				resolve(true);
			})
			.catch((_) => reject(false));
	});
}

export function upsertSeries(series: Series) {
	return new Promise<boolean>((resolve, reject) => {
		fetch(`${baseURL}/admin/pokemon/series`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(series)
		})
			.then((res) => resolve(true))
			.catch((_) => reject());
	});
}

export function deleteSeries(series: Series) {
	return new Promise<boolean>((resolve, reject) => {
		fetch(`${baseURL}/admin/pokemon/series`, {
			method: 'Delete',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(series)
		})
			.then((res) => resolve(true))
			.catch((_) => reject());
	});
}

export function upsertExpantion(exp: Expansion) {
	return new Promise<boolean>((resolve, reject) => {
		fetch(`${baseURL}/admin/pokemon/expantion`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(exp)
		})
			.then((res) => resolve(true))
			.catch((_) => reject());
	});
}

export function deleteExpantion(exp: Expansion) {
	return new Promise<boolean>((resolve, reject) => {
		fetch(`${baseURL}/admin/pokemon/expantion`, {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(exp)
		})
			.then((res) => resolve(true))
			.catch((_) => reject());
	});
}

export function getCard(cardId: string) {
	return new Promise<Card>((resolve, reject) => {
		let url = new URL(`${baseURL}/admin/pokemon/cards/0`);
		url.searchParams.set(`name`, cardId);
		fetch(url.toString())
			.then((res) => res.json())
			.then(
				(data) => {
					resolve(data.cards[0]);
				},
				(err) => {
					reject(err);
				}
			);
	});
}

export function upsertCard(card: Card) {
	return new Promise<boolean>((resolve, reject) => {
		fetch(`${baseURL}/admin/pokemon/card`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(card)
		})
			.then((res) => resolve(true))
			.catch((_) => reject());
	});
}

export function deleteCard(card: Card) {
	return new Promise<boolean>((resolve, reject) => {
		fetch(`${baseURL}/admin/pokemon/card`, {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(card)
		})
			.then((res) => resolve(true))
			.catch((_) => reject());
	});
}
