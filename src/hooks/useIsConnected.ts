import { useContext } from 'react';
import NetworkContext from '../components/NetworkContext';

export default function useIsConnected(): boolean {
  const context = useContext(NetworkContext);

  if (!context) {
    throw new Error(
      'useIsConnected should be used within NetworkProvider. ' +
        'Make sure you are rendering a NetworkProvider at the top of your component hierarchy',
    );
  }

  return context.isConnected;
}
