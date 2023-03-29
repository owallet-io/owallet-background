import { BIP44HDPath } from 'src/keyring';
import { LedgerAppType } from 'src/ledger';

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

export function getNetworkTypeByPathOrCoinType(
  path: string | number
): LedgerAppType {
  const type = {
    118: 'cosmos',
    60: 'eth',
    195: 'trx'
  };
  if (typeof path === 'number') {
    return type[path];
  } else {
    const components = path.split('/');
    if (path.startsWith('44')) {
      components.shift();
    }
    if (components.length > 0) {
      return type[components[0].replace("'", '')];
    }
  }
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
