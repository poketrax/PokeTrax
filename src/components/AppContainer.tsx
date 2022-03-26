import { render } from '@testing-library/react';
import React from 'react';

export class AppContainer extends React.Component {
    constructor(props: object) {
        super(props)
        this.state = { page: "cards" }
    }
    render() {
        return (
            <div className=''>
                
            </div>
        )
    }
}

export default AppContainer