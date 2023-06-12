// Mock Crypto module
jest.mock('../crypto', () => ({
  Crypto: jest.fn(),
  KeyStore: jest.fn()
}));

// Mock @owallet/crypto module
jest.mock('@owallet/crypto', () => ({
  Mnemonic: jest.fn(),
  PrivKeySecp256k1: jest.fn(),
  PubKeySecp256k1: jest.fn(),
  RNG: jest.fn()
}));

// Mock eccrypto-js module
jest.mock('eccrypto-js', () => ({
  // Mock functions here
}));

// Mock ethereumjs-util module
jest.mock('ethereumjs-util', () => ({
  privateToAddress: jest.fn(),
  ecsign: jest.fn(),
  keccak: jest.fn(),
  privateToPublic: jest.fn(),
  toBuffer: jest.fn(),
  publicToAddress: jest.fn()
}));

// Mock ethereumjs-abi module
jest.mock('ethereumjs-abi', () => ({
  rawEncode: jest.fn(),
  soliditySHA3: jest.fn()
}));

// Mock @owallet/common module
jest.mock('@owallet/common', () => ({
  KVStore: jest.fn(),
  getNetworkTypeByChainId: jest.fn(),
  getCoinTypeByChainI: jest.fn()
}));
jest.mock('../../ledger', () => ({
  LedgerAppType: jest.fn(),
  LedgerService: jest.fn()
}));

// Mock @owallet/router module
jest.mock('@owallet/router', () => ({
  Env: jest.fn(),
  OWalletError: jest.fn()
}));

// Mock buffer module
jest.mock('buffer', () => ({
  Buffer: jest.fn()
}));

// Mock @owallet/types module
jest.mock('@owallet/types', () => ({
  ChainInfo: jest.fn()
}));

// Mock @owallet/cosmos module
jest.mock('@owallet/cosmos', () => ({
  ChainIdHelper: jest.fn()
}));

// Mock proxy-recrypt-js module
jest.mock('proxy-recrypt-js', () => ({
  // Mock functions here
}));

// Mock @ethereumjs/common module
jest.mock('@ethereumjs/common', () => ({
  default: jest.fn()
}));

// Mock ethereumjs-tx module
jest.mock('ethereumjs-tx', () => ({
  TransactionOptions: jest.fn(),
  Transaction: jest.fn()
}));
// Mock tx module
jest.mock('../../tx', () => ({
  request: jest.fn()
}));
jest.mock('../../utils/helper.ts', () => ({
  formatNeworkTypeToLedgerAppName: jest.fn(),
  getNetworkTypeByBip44HDPath: jest.fn(),
  splitPath: jest.fn()
}));
// Mock @ethersproject/transactions module
jest.mock('@ethersproject/transactions', () => ({
  serialize: jest.fn()
  // Mock functions here
}));
// Mock tronweb module
jest.mock('tronweb', () => ({
  // Mock functions here
}));

import { KeyRing, KeyRingStatus } from '../keyring';
import { LedgerService } from '../../ledger';
import { ScryptParams, CommonCrypto } from '../types';
const rngMock = jest.fn(async (array) => array);
const scryptMock = jest.fn(
  async (text: string, params: ScryptParams) => new Uint8Array(params.dklen)
);
const cryptoMock: CommonCrypto = {
  scrypt: scryptMock
};
const mockKvStore = {
  get: jest.fn().mockResolvedValue(undefined),
  set: jest.fn().mockResolvedValue(undefined),
  prefix: jest.fn().mockReturnValue('keyring')
};
const mockEmbedChain: any = null;

describe('keyring', () => {
  const keyRing = new KeyRing(
    mockEmbedChain,
    mockKvStore,
    new LedgerService(null, null, null),
    rngMock,
    cryptoMock
  );
  describe('lock', () => {
    it('should lock the key ring if it is unlocked', () => {
      // Arrange
      const spyOnStatus = jest.spyOn(keyRing, 'status', 'get');
      spyOnStatus.mockReturnValue(KeyRingStatus.UNLOCKED);
      Object.defineProperty(keyRing, '_privateKey', {
        value: 'private key',
        writable: true
      });
      Object.defineProperty(keyRing, '_mnemonic', {
        value: 'test mnemonic',
        writable: true
      });
      Object.defineProperty(keyRing, '_ledgerPublicKey', {
        value: 'test _ledgerPublicKey',
        writable: true
      });
      // Monkey patch the password property
      Object.defineProperty(keyRing, 'password', {
        value: 'oraitest',
        writable: true
      });
      // Act
      keyRing.lock();
      spyOnStatus.mockReturnValue(KeyRingStatus.LOCKED);
      const password = Reflect.get(keyRing, 'password');

      const mnemonic = Reflect.get(keyRing, 'mnemonic');
      const privateKey = Reflect.get(keyRing, 'privateKey');
      const ledgerPublicKey = Reflect.get(keyRing, 'ledgerPublicKey');

      expect(keyRing.status).toBe(KeyRingStatus.LOCKED);
      expect(mnemonic).toBeUndefined();
      expect(privateKey).toBeUndefined();
      expect(ledgerPublicKey).toBeUndefined();
      expect(password).toBe('');
    });

    it('should throw an error if the key ring is not unlocked', () => {
      // Arrange
      const spyOnStatus = jest.spyOn(keyRing, 'status', 'get');
      spyOnStatus.mockReturnValue(KeyRingStatus.LOCKED);

      // Act & Assert
      expect(() => {
        keyRing.lock();
      }).toThrow(Error('Key ring is not unlocked'));
    });
  });
});
