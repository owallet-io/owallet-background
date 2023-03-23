export function generateAccount(): {
  privateKey: string;
  publicKey: string;
  address: {
    base58: string;
    hex: string;
  };
};
export function generateRandom(options: any): {
  mnemonic: string;
  privateKey: string;
  publicKey: string;
  address: string;
};
export function generateAccountWithMnemonic(
  mnemonic: string,
  path: any,
  wordlist?: string
): {
  mnemonic: any;
  privateKey: string;
  publicKey: string;
  address: string;
};
