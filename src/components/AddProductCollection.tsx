import React from 'react';
import AddIcon from '@mui/icons-material/Add';
import NumberFormat from 'react-number-format';
import Switch from '@mui/material/Switch';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { TextField, Autocomplete, Button } from '@mui/material'
import { getCollections, addSealedToCollection, addCollection } from "../controls/CardDB"
import { SealedProduct } from '../model/SealedProduct';

interface Props {
    product: SealedProduct
    close: () => void
}

interface FormatProps {
    onChange: (event: { target: { name: string; value: string } }) => void;
    name: string;
}

class State {
    public collections = new Array<string>()
    public displayCollections = new Array<string>()
    public selectedColl = ""
    public errorText = ""
    public price = 0
    public count = 1
    public collErr = false
    public countErr = false
    public wishlist = false
}

export class AddProductCollection extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = new State()
        getCollections().then(
            (value) => {
                this.setState({
                    ...this.state,
                    collections: value.map((val) => val.name),
                    displayCollections: value.map((val) => val.name)
                })
            }
        )
    }

    private PriceFormat = React.forwardRef<NumberFormat<string>, FormatProps>(
        function NumberFormatCustom(props, ref) {
            const { onChange, ...other } = props;
            return (
                <NumberFormat
                    {...other}
                    getInputRef={ref}
                    onValueChange={(values) => {
                        onChange({
                            target: {
                                name: props.name,
                                value: values.value,
                            },
                        });
                    }}
                    thousandSeparator
                    allowNegative={false}
                    isNumericString
                    decimalScale={2}
                    prefix="$"
                />
            );
        },
    );

    private CountFormat = React.forwardRef<NumberFormat<string>, FormatProps>(
        function NumberFormatCustom(props, ref) {
            const { onChange, ...other } = props;
            return (
                <NumberFormat
                    {...other}
                    getInputRef={ref}
                    onValueChange={(values) => {
                        onChange({
                            target: {
                                name: props.name,
                                value: values.value,
                            },
                        });
                    }}
                    isNumericString
                    decimalScale={0}
                    allowNegative={false}
                    thousandSeparator
                />
            );
        },
    );

    private addProduct() {
        let err = ""
        let collError = false
        let countError = false
        let gradeError = false

        if (this.state.selectedColl === "") {
            err = "Collection must be set "
            collError = true
        }
        if (isNaN(this.state.count)) {
            err += "Count must be set "
            countError = true
        }
        if (this.state.count === 0) {
            err += "Count must be greater than 0"
            countError = true
        }
        if (collError || countError || gradeError) {
            this.setState({ ...this.state, errorText: err, collErr: collError, countErr: countError })
        } else {
            let add: SealedProduct = JSON.parse(JSON.stringify(this.props.product)) //deep copy
            add.collection = this.state.selectedColl
            add.count = this.state.wishlist ? 0 : this.state.count
            add.paid = this.state.price
            if (this.state.collections.indexOf(this.state.selectedColl) === -1) {
                addCollection(this.state.selectedColl)
            }
            addSealedToCollection(add).then(
                () => {
                    this.props.close()
                }
            ).catch(
                () => {
                    this.setState({ ...this.state, errorText: "Failed to add :(" })
                }
            )
        }
    }

    render() {
        return (
            <div className='p-8'>
                <Autocomplete
                    id="collection-input"
                    className='w-full'
                    options={this.state.displayCollections}
                    getOptionLabel={(option) => option}
                    defaultValue={this.state.selectedColl}
                    freeSolo
                    renderInput={(params) => (
                        <TextField
                            error={this.state.collErr}
                            className='focus:bg-slate-400'
                            {...params}
                            label="Collection"
                            placeholder="Collection"
                        />
                    )}
                    onInputChange={
                        (_, value) => {
                            if (value) {
                                this.setState({ ...this.state, selectedColl: value })
                            }
                        }
                    }
                />
                <div className='h-4'></div>
                <TextField
                    id="price-input"
                    className='w-full'
                    label="Price Paid (optional)"
                    value={this.state.price}
                    onChange={(ev) => {
                        this.setState({ ...this.state, price: Number.parseFloat(ev.target.value) })
                    }
                    }
                    name="numberformat"
                    InputProps={{
                        inputComponent: this.PriceFormat as any,
                    }}
                    variant="outlined"
                />
                <div className='h-4'></div>
                <FormGroup>
                    <FormControlLabel control={<Switch onChange={(ev) => { this.setState({ ...this.state, wishlist: ev.target.checked }) }} />} label="Wishlist" />
                </FormGroup>
                <div className='h-4'></div>
                <TextField
                    id="count-input"
                    className='w-full'
                    label="Count"
                    error={this.state.countErr}
                    value={this.state.count}
                    disabled={this.state.wishlist}
                    onChange={(ev) => this.setState({ ...this.state, count: Number.parseFloat(ev.target.value) })}
                    name="numberformat"
                    InputProps={{
                        inputComponent: this.CountFormat as any,
                    }}
                    variant="outlined"
                />
                <div className='h-4'></div>
                <div className="w-full pt-2 pb-2 flex items-center justify-center">
                    <Button id="confirm-add-button" className="w-full" variant='contained' onClick={() => { this.addProduct() }} startIcon={<AddIcon />}>Add</Button>
                </div>
                {
                    this.state.errorText !== "" &&
                    (
                        <div id="add-card-error">{this.state.errorText}</div>
                    )
                }
            </div>
        )
    }
}