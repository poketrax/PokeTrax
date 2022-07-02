import React from 'react';
import AddIcon from '@mui/icons-material/Add';
import NumberFormat from 'react-number-format';
import Switch from '@mui/material/Switch';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { TextField, Autocomplete, Button, Tooltip } from '@mui/material'
import { Card, Price } from '../model/Card'
import { getCollections, addCardToCollection, addCollection, parseGrade } from "../controls/CardDB"

interface Props {
    card: Card
    close: () => void
}

interface FormatProps {
    onChange: (event: { target: { name: string; value: string } }) => void;
    name: string;
}

class State {
    public prices = new Array<Price>()
    public collections = new Array<string>()
    public displayCollections = new Array<string>()
    public price = 0
    public count = 1
    public grade = ""
    public collErr = false
    public countErr = false
    public gradeErr = false
    public errorText = ""
    public wishlist = false
}

export class AddCardCollection extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = new State()
        this.variants = JSON.parse(props.card.variants ?? '[]')
        this.selectedVariant = this.variants ? this.variants[0] : ""
    }
    
    componentDidMount(): void {
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

    private variants: Array<string> = []
    private selectedVariant: string = ""
    private selectedColl: string = ""

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

    private addCard() {
        let err = ""
        let collError = false
        let countError = false
        let gradeError = false

        if (this.selectedColl === "") {
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
        let grade = parseGrade(this.state.grade)
        if (this.state.grade !== "" && grade == null) {
            err += "Invalid grade format! ex: PSA-10, CGC-9.5, BGS-10-P, CGC-10-P, PSA-10-OC, ACE-9, AGS-8"
            gradeError = true
        }
        if (collError || countError || gradeError) {
            this.setState({ ...this.state, errorText: err, collErr: collError, countErr: countError, gradeErr: gradeError })
        } else {
            let add = JSON.parse(JSON.stringify(this.props.card)) //deep copy
            add.collection = this.selectedColl
            add.count = this.state.wishlist ? 0 : this.state.count
            add.variant = this.selectedVariant
            add.paid = this.state.price
            add.grade = this.state.grade.trim().toUpperCase()
            if (this.state.collections.indexOf(this.selectedColl) === -1) {
                addCollection(this.selectedColl)
            }
            addCardToCollection(add).then(
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
            <div className='w-96 p-8'>
                <Autocomplete
                    id="collection-input"
                    className='w-full'
                    options={this.state.displayCollections}
                    getOptionLabel={(option) => option}
                    defaultValue={this.selectedColl}
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
                        (ev, value) => {
                            if (value) {
                                this.selectedColl = value
                            }
                        }
                    }
                />
                <div className='h-4'></div>
                <Autocomplete
                    id="variant-select"
                    className='w-full'
                    options={this.variants}
                    getOptionLabel={(option) => option}
                    defaultValue={this.selectedVariant}
                    onChange={
                        (_, value) => {
                            this.selectedVariant = value ?? this.selectedVariant
                        }
                    }
                    renderInput={(params) => (
                        <TextField
                            className='focus:bg-slate-400'
                            {...params}
                            label="Variant"
                            placeholder="Variant"
                        />
                    )}
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
                <Tooltip title="Grade Format: PSA-10, CGC-8.5, BGS-10-P, CGC10-P, PSA-8-OC">
                    <TextField
                        id="grade-input"
                        className='w-full'
                        label="Grade (optional)"
                        error={this.state.gradeErr}
                        value={this.state.grade}
                        onChange={(ev) => {
                            this.setState({ ...this.state, grade: ev.target.value })
                        }}
                        variant="outlined"
                    />
                </Tooltip>

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
                    <Button id="confirm-add-button" className="w-full" variant='contained' onClick={() => { this.addCard() }} startIcon={<AddIcon />}>Add</Button>
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