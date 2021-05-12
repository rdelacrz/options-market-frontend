/**
 * Contains general-purpose React hooks that can be utilized by components.
 */

import { useEffect, useLayoutEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { OptionsEntry } from '@models';

// Referenced like this to avoid circular dependencies
import { getTokenPrices } from '../reduxConfig/actions';

export const useWindowSize = () => {
    const [size, setSize] = useState([0, 0]);
    if (typeof window !== 'undefined') {
        useLayoutEffect(() => {
            function updateSize() {
                setSize([window.innerWidth, window.innerHeight]);
            }
            window.addEventListener('resize', updateSize);
            updateSize();
            return () => window.removeEventListener('resize', updateSize);
        }, []);
    }
    return {width: size[0], height: size[1]};
}

/**
 * Hook responsible for retrieving prices for the current tokens within the list of current funds.
 * 
 * @returns List of tokens for which prices are being retrieved.
 */
export const useTokenPriceRetriever = (fundList: OptionsEntry[]) => {
    // Get token list, removing duplicates in the process
    let tokenList = fundList.map(f => f.type === 'put' ? f.paymentToken : f.collateralToken) || [];
    tokenList = tokenList.filter((token, index) => tokenList.findIndex(t => t.symbol === token.symbol) === index);
    
    const dispatch = useDispatch();

    // Gets token prices
    useEffect(() => {
        if (tokenList.length > 0) {
            dispatch(getTokenPrices(tokenList));
        }
    }, [tokenList]);

    return tokenList;
}