import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import { Card } from '../model/Card'
import { baseURL } from '../index';
import axios from "axios"
import { searchTermTopic } from "./Cards"

export default function CardSearchBar() {
    const [value, setValue] = React.useState<string | null>(null);
    const [options, setOptions] = React.useState<string[]>([]);

    return (
        <Autocomplete
            value={value}
            onInputChange={(event, newValue) => {
                if (newValue != null) {
                    setValue(newValue)
                }
                if (value != null) {
                    axios.get(`${baseURL}/cards/1/?name=${encodeURIComponent(newValue)}`).then(
                        (res) => {
                            let newOptions = res.data.map((card: Card) => { return card.cardId })
                            setOptions(newOptions)
                            searchTermTopic.next(newValue)
                        }
                    )
                }
            }}
            selectOnFocus
            clearOnBlur
            handleHomeEndKeys
            id="serach"
            options={options}
            getOptionLabel={(option) => {
                return option;
            }}
            renderOption={(props, option) => <li {...props}>{option}</li>}
            sx={{ width: 300 }}
            freeSolo
            renderInput={(params) => (
                <TextField {...params} label="Search" />
            )}
        />
    );
}