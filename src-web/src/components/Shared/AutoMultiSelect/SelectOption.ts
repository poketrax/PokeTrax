import type { SvelteComponent } from "svelte";

export class SelectOption {
    public value: string;
    public sortProp?: any; 
    public component?: typeof SvelteComponent
    public metaData?: any
}