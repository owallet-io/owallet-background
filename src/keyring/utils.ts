import { EmbedChainInfos } from '@owallet/common';

export const checkNetworkTypeByChainId = chainId => {
  const network = EmbedChainInfos.find(nw => nw.chainId === chainId);
  return network?.networkType ?? '';
};

export const getCoinTypeByChainId = chainId => {
  const network = EmbedChainInfos.find(nw => nw.chainId === chainId);
  return network?.bip44?.coinType ?? 60;
};
