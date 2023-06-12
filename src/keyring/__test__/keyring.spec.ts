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
import { mockKeyCosmos, mockPassword } from '../__mocks__/keyring';
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
  describe('status', () => {
    it('should return KeyRingStatus.NOTLOADED when loaded is false', () => {
      // Monkey patch the loaded property
      Object.defineProperty(keyRing, 'loaded', {
        value: false,
        writable: true
      });
      // Gọi phương thức status
      const result = keyRing.status;
      // Kiểm tra kết quả
      expect(result).toBe(KeyRingStatus.NOTLOADED);
    });

    // it('should return KeyRingStatus.EMPTY when keyStore is null', () => {
    //   // Tạo instance của lớp MockStatus
    //   const instance = new MockStatus();

    //   // Gán giá trị null cho thuộc tính keyStore
    //   instance.keyStore = null;
    //   instance.loaded = true;

    //   // Gọi phương thức status
    //   const result = instance.status;

    //   // Kiểm tra kết quả
    //   expect(result).toBe(KeyRingStatus.EMPTY);
    // });

    // it('should return KeyRingStatus.UNLOCKED when MockStatus.isLocked() returns false', () => {
    //   // Tạo instance của lớp MockStatus
    //   const instance = new MockStatus();

    //   // Gán giá trị true cho thuộc tính loaded
    //   instance.loaded = true;
    //   instance.keyStore = mockKeyStore;
    //   // Mock MockIsLocked.isLocked() để trả về false
    //   jest.spyOn(MockStatus.prototype, 'isLocked').mockReturnValue(false);

    //   // Gọi phương thức status
    //   const result = instance.status;

    //   // Kiểm tra kết quả
    //   expect(result).toBe(KeyRingStatus.UNLOCKED);
    // });

    // it('should return KeyRingStatus.LOCKED when all conditions are false', () => {
    //   // Tạo instance của lớp MockStatus
    //   const instance = new MockStatus();
    //   instance.keyStore = mockKeyStore;
    //   // Gán giá trị true cho thuộc tính loaded
    //   instance.loaded = true;

    //   // Mock MockIsLocked.isLocked() để trả về true
    //   jest.spyOn(MockStatus.prototype, 'isLocked').mockReturnValue(true);

    //   // Gọi phương thức status
    //   const result = instance.status;

    //   // Kiểm tra kết quả
    //   expect(result).toBe(KeyRingStatus.LOCKED);
    // });
  });
  describe('lock', () => {
    it('should lock the key ring if it is unlocked', () => {
      // Arrange
      const spyOnStatus = jest.spyOn(keyRing, 'status', 'get');
      spyOnStatus.mockReturnValue(KeyRingStatus.UNLOCKED);
      Object.defineProperty(keyRing, '_privateKey', {
        value: mockKeyCosmos.privateKeyHex,
        writable: true
      });
      Object.defineProperty(keyRing, '_mnemonic', {
        value: mockKeyCosmos.mnemonic,
        writable: true
      });
      Object.defineProperty(keyRing, '_ledgerPublicKey', {
        value: mockKeyCosmos.publicKeyHex,
        writable: true
      });
      // Monkey patch the password property
      Object.defineProperty(keyRing, 'password', {
        value: mockPassword,
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
