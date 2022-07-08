import React from 'react';
import TextField from '@mui/material/TextField';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import ToggleButton from '@mui/material/ToggleButton';
import { TablePagination } from '@mui/material';
import { SealedProduct, ProductList } from '../model/SealedProduct';
import { searchProducts } from '../controls/CardDB';
import { ProductCase } from '../components/ProductCase';

class State {
    public searchTerm: string = ""
    public sort: string = ""
    public page: number = 0
    public products = Array<SealedProduct>()
    public total = 0
}

export class ProductSearch extends React.Component<{}, State>{
    constructor() {
        super({})
        this.state = new State()
        this.searchSealed(0)
    }

    private searchSealed(page: number, searchTerm?: string, sort?: string) {
        searchProducts(page, searchTerm ?? this.state.searchTerm, sort ?? this.state.sort)
            .then(
                (results: ProductList) => {
                    console.log(results)
                    this.setState(
                        {
                            ...this.state,
                            page: page,
                            searchTerm: searchTerm ?? this.state.searchTerm,
                            sort: sort ?? this.state.sort,
                            products: results.products,
                            total: results.total
                        }
                    )
                }
            )
    }

    private searchbar() {
        return (
            <div className='sticky w-full h-20 bg-gray-200 flex justify-items-center items-center pl-2 pr-2 top-0'>
                {this.textSearch()}
                <div className='flex-grow'></div>
                {this.sortOptions()}
            </div>
        )
    }

    private textSearch() {
        return (
            <TextField className='min-w-fit w-72'
                id="card-test-search-bar"
                label="Search"
                variant="outlined"
                onChange={(e) => this.searchSealed(0, e.target.value)}
            />
        )
    }

    private sortOptions() {
        return (
            <ToggleButtonGroup
                className='h-14'
                value={this.state.sort}
                exclusive
                onChange={(_, value) => {
                    this.searchSealed(0, null, value)
                }}>
                <ToggleButton value="name" id="sort-name">
                    <div>Name</div>
                </ToggleButton>
                <ToggleButton value="priceASC" id="sort-price">
                    <div>$ ⬆︎</div>
                </ToggleButton>
                <ToggleButton value="priceDSC" id="sort-price">
                    <div>$ ⬇︎</div>
                </ToggleButton>
            </ToggleButtonGroup>
        )
    }

    private renderProducts() {
        let items = []
        for (let i = 0; i < this.state.products.length; i++) {
            let prod = this.state.products[i]
            items.push(<ProductCase id={`${i}`} product={prod} onDelete={() => {}}></ProductCase>)
        }
        return items
    }

    private handleChangePage = (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number,) => {
        this.searchSealed(newPage)
    };

    private pagination() {
        return (
            <TablePagination
                component="div"
                count={this.state.total}
                page={this.state.page}
                rowsPerPage={25}
                rowsPerPageOptions={[25]}
                onPageChange={this.handleChangePage}
            />
        )
    }

    render(): React.ReactNode {
        return (
            <div>
                {this.searchbar()}
                <div className='h-[calc(100vh-12rem)] overflow-auto'>
                    {this.pagination()}
                    <div className='flex'>
                        <div className='flex-grow'></div>
                        <div className='grid h-full grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 p-4'
                            id="card-grid">
                            {this.renderProducts()}
                        </div>
                        <div className='flex-grow'></div>
                    </div>
                    {this.pagination()}
                </div>

            </div>
        )
    }
} 