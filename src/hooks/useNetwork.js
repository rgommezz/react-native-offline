import React, {useContext, useMemo} from 'react';
import NetworkContext from './../components/NetworkContext';

export default function useNetwork() {
    const context = useContext(NetworkContext); 
    
    if (!context) {
        throw new Error(
            'useNetwork should be used within NetworkProvider. ' +
            'Make sure you are rendering a NetworkProvider at the top of your component hierarchy',
        );
    }
    
    return useMemo(() => ({ isConnected: context.isConnected }), [context]);
}