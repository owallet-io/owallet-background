import { TRON_ID } from '@owallet/common';
import { BIP44HDPath } from 'src/keyring';
import { LedgerAppType } from 'src/ledger';
import { getBaseDerivationPath } from '@owallet/bitcoin';
import { getNetworkTypeByChainId } from '@owallet/common';
export function splitPath(path: string): BIP44HDPath {
  const bip44HDPathOrder = ['coinType', 'account', 'change', 'addressIndex'];
  const result = {} as BIP44HDPath;
  const components = path.split('/');
  if (path.startsWith('44')) {
    components.shift();
  }
  components.forEach((element, index) => {
    result[bip44HDPathOrder[index]] = element.replace("'", '');
  });

  return result;
}
export const getHDPath = ({
  bip44HDPath,
  chainId,
  coinType
}: {
  bip44HDPath: BIP44HDPath;
  chainId: string | number;
  coinType: number;
}): string => {
  const networkType = getNetworkTypeByChainId(chainId);
  if (networkType === 'bitcoin') {
    return getBaseDerivationPath({
      selectedCrypto: chainId as string
    }) as string;
  }
  const path = `m/44'/${coinType}'/${
    bip44HDPath.account
  }'/${bip44HDPath.change}/${bip44HDPath.addressIndex}`;
  return path;
};
export function stringifyPath(paths: number[]): string {
  let stringPaths = '';
  if (paths.length < 5) {
    return "44'/118'/0'/0/0";
  }
  paths.map((path, index) => {
    if (index < 3) {
      stringPaths += `${path}'/`;
    } else {
      if (index < 4) {
        stringPaths += `${path}/`;
      } else {
        stringPaths += `${path}`;
      }
    }
  });
  return stringPaths;
}

export function getNetworkTypeByBip44HDPath(path: BIP44HDPath): LedgerAppType {
  switch (path.coinType) {
    case 118:
      return 'cosmos';
    case 60:
      return 'eth';
    case 195:
      return 'trx';
    default:
      return 'cosmos';
  }
}

export function formatNeworkTypeToLedgerAppName(
  network: string,
  chainId?: string | number
): LedgerAppType {
  switch (network) {
    case 'cosmos':
      return 'cosmos';
    case 'evm':
      if (chainId && chainId === TRON_ID) {
        return 'trx';
      }
      return 'eth';
    default:
      return 'cosmos';
  }
}
