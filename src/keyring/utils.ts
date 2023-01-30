import { LIST_CHAIN_ID_BY_NETWORK } from './constants';

export const checkNetworkTypeByChainId = chainId => {
  return LIST_CHAIN_ID_BY_NETWORK[chainId] ?? '';
};
