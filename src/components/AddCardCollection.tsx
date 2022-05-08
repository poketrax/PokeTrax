import React from 'react';
import AddIcon from '@mui/icons-material/Add';
import NumberFormat from 'react-number-format';
import { TextField, Autocomplete, Button } from '@mui/material'
import { Card, Price } from '../model/Card'
import { getCollections, addCardToCollection, addCollection } from "../controls/CardDB"

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
    public collErr = false
    public countErr = false
    public errorText = ""
}

export class AddCardCollection extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = new State()
        if (this.old_sets.indexOf(props.card.expName) === -1) {
            this.variants = this.new_variants
            this.selectedVariant = "Normal"
            if (props.card.rarity === "Holo Rare") {
                this.selectedVariant = "Holofoil"
                this.variants.shift()
            } else if (props.card.rarity === "Common" ||
                props.card.rarity === "Uncommon" ||
                props.card.rarity === "Rare"
            ) {
                this.variants.pop()
            } else if (props.card.rarity === "Ultra Rare" ||
                props.card.rarity === "Secret Rare"
            ) {
                this.selectedVariant = "Holofoil"
                this.variants.shift()
                this.variants.shift()
            }
        } else {
            this.variants = this.old_variants
            this.selectedVariant = "Unlimited"
        }
        getCollections().then(
            (value) => {
                this.setState({ ...this.state,
                     collections: value.map((val) => val.name),
                     displayCollections: value.map((val) => val.name) })
            }
        )
    }

    private variants: Array<string> = []
    private selectedVariant: string = ""
    private selectedColl: string = ""

    private new_variants =
        [
            "Normal",
            "Reverse Holofoil",
            "Holofoil"
        ]

    private old_sets =
        [
            "Base Set",
            "Jungle",
            "Fossil",
            "Team Rocket",
            "Gym Heroes",
            "Gym Challenge",
            "Neo Genesis",
            "Neo Discovery",
            "Southern Islands",
            "Neo Revelation",
            "Neo Destiny"
        ]

    private old_variants =
        [
            "1st Edition",
            "Unlimited"
        ]

    private PriceFormat = React.forwardRef<NumberFormat<string>, FormatProps>(
        function NumberFormatCustom(props, ref) {
            const {onChange, ...other } = props;
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
            const {onChange, ...other } = props;
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

    private addCard(){
        this.setState({...this.state, errorText: "Collection must be set", collErr: false, countErr: false})
        let err = ""
        let collError = false
        let countError = false
        if(this.selectedColl === ""){
            err = "Collection must be set, "
            collError = true
        }
        if(isNaN(this.state.count)){
            err +="Count must be set"
            countError = true
        }
        if(this.state.count === 0){
            err +="Count must be greater than 0"
            countError = true
        }
        this.setState({...this.state, errorText: err, collErr: collError, countErr: countError})
        let add = JSON.parse(JSON.stringify(this.props.card)) //deep copy
        add.collection = this.selectedColl
        add.count = this.state.count
        add.variant = this.selectedVariant
        add.paid = this.state.price
        add.grade = ""
        if(this.state.collections.indexOf(this.selectedColl) === -1){
            addCollection(this.selectedColl)
        }
        addCardToCollection(add).then(
            () => {
                 this.props.close()
            }
        ).catch(
            () => {
                this.setState({...this.state, errorText: "Failed to add :("})
            }
        )
    }

    render() {
        return (
            <div className='w-96 p-8'>
                <Autocomplete
                    className='w-full'
                    options={this.state.displayCollections}
                    getOptionLabel={(option) => option}
                    defaultValue={this.selectedColl}
                    disableCloseOnSelect
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
                    className='w-full'
                    options={this.variants}
                    getOptionLabel={(option) => option}
                    defaultValue={this.selectedVariant}
                    disableCloseOnSelect
                    onChange={
                        (_, value) => {
                            console.log(value)
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
                    className='w-full'
                    label="Price Paid (optional)"
                    value={this.state.price}
                    onChange={(ev) => {
                        this.setState({...this.state, price :Number.parseFloat(ev.target.value)})
                    }
                    }
                    name="numberformat"
                    id="formatted-numberformat-input"
                    InputProps={{
                        inputComponent: this.PriceFormat as any,
                    }}
                    variant="outlined"
                />
                <div className='h-4'></div>
                <TextField
                    className='w-full'
                    label="Count"
                    error={this.state.countErr}
                    value={this.state.count}
                    onChange={(ev) => this.setState({...this.state, count : Number.parseFloat(ev.target.value)})}
                    name="numberformat"
                    id="formatted-numberformat-input"
                    InputProps={{
                        inputComponent: this.CountFormat as any,
                    }}
                    variant="outlined"
                />
                <div className='h-4'></div>
                <div className="w-full pt-2 pb-2 flex items-center justify-center">
                    <Button className="w-full" variant='contained' onClick={() => {this.addCard()}} startIcon={<AddIcon />}>Add</Button>
                </div>
                {
                    this.state.errorText !== "" && 
                    (
                        <div>{this.state.errorText}</div>
                    )
                }
            </div>
        )
    }
}