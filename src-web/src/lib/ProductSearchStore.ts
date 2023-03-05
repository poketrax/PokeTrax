import { writable } from "svelte/store";
import { ProductList } from "./SealedProduct";
import { baseURL } from "./Utils";

//Search term entered
export const searchTermStore = writable("");
export let searchTerm = "";
searchTermStore.subscribe((val) => (searchTerm = val));
//Sort button pressed
export const sortStore = writable("");
export let sort = "";
sortStore.subscribe((val) => (sort = val));
//Page selected
export const pageStore = writable(0);
export let page = 0;
pageStore.subscribe((val) => (page = val));
//Types Selected
export const typesSelected = writable(new Array<string>());
export let types = [];
typesSelected.subscribe((val) => (types = val));
//Product Results
export const productSearchResults = writable(new ProductList());

export const productTypesStore = writable(new Array<string>())

export function executeProductSearch() {
  let url = new URL(`${baseURL}/pokemon/products/${page}`);
  if (searchTerm !== "") {
    url.searchParams.set(`name`, searchTerm);
  }
  if (types.length !== 0) {
    url.searchParams.set(`types`, JSON.stringify(types))
  }
  if (sort !== "") {
    url.searchParams.set("sort", sort);
  }
  fetch(url.toString())
    .then((res) => res.json())
    .catch((e) => console.log(e))
    .then(
      (data) => {
        productSearchResults.set(data);
      },
      (err) => {
        console.log(err);
      }
    )
}

export function initProductTypes(){
  let url = `${baseURL}/pokemon/product/types`
  fetch(url)
    .then((res) => res.json())
    .catch((e) => console.log(e))
    .then((json) => productTypesStore.set(json))
    .catch((e) => console.log(e))
}
