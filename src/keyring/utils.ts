import { EmbedChainInfos } from '@owallet/common';
import { NetworkType } from '@owallet/types';

export const getNetworkTypeByChainId = (
  chainId: string | number
): NetworkType => {
  const network = EmbedChainInfos.find(nw => nw.chainId == chainId);
  return network?.networkType ?? 'cosmos';
};

export const getCoinTypeByChainId = chainId => {
  const network = EmbedChainInfos.find(nw => nw.chainId == chainId);
  return network?.bip44?.coinType ?? network?.coinType ?? 60;
};

export const convertEthSignature = (signature: {
  s: string;
  r: string;
  recoveryParam?: number;
}) => {
  return Buffer.concat([
    Buffer.from(signature.r.replace('0x', ''), 'hex'),
    Buffer.from(signature.s.replace('0x', ''), 'hex'),
    // The metamask doesn't seem to consider the chain id in this case... (maybe bug on metamask?)
    signature.recoveryParam
      ? Buffer.from('1c', 'hex')
      : Buffer.from('1b', 'hex')
  ]);
};
