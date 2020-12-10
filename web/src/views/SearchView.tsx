import React from 'react';
import ViewWrapper from '../components/ViewWrapper';
import Slider from '../components/toolbox/form/Slider';

const SearchView = () => {

    return (<ViewWrapper>
        <div>

            <div style={{
                width: `400px`,
                border: `1px solid black`,
                padding: `10px`
            }}>
                <Slider />
            </div>

        </div>
    </ViewWrapper>)
}

export default SearchView