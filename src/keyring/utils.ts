import { EmbedChainInfos } from '@owallet/common';

export const getNetworkTypeByChainId = (chainId) => {
  const network = EmbedChainInfos.find((nw) => nw.chainId === chainId);
  return network?.networkType ?? '';
};

export const getCoinTypeByChainId = (chainId) => {
  const network = EmbedChainInfos.find((nw) => nw.chainId === chainId);
  return network?.coinType ?? network?.bip44?.coinType ?? '';
};
