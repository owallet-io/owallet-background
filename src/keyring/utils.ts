import { EmbedChainInfos } from '@owallet/common';

export const checkNetworkTypeByChainId = (chainId) => {
  const network = EmbedChainInfos.find((nw) => nw.chainId === chainId);
  return network?.networkType ?? '';
};
