import { EmbedChainInfos } from '@owallet/common';
import { NetworkType } from '@owallet/types';

export const checkNetworkTypeByChainId = (
  chainId: string | number
): NetworkType => {
  const network = EmbedChainInfos.find((nw) => nw.chainId == chainId);
  return network?.networkType ?? 'cosmos';
};

export const getCoinTypeByChainId = (chainId) => {
  const network = EmbedChainInfos.find((nw) => nw.chainId == chainId);
  return network?.bip44?.coinType ?? 60;
};
