// Mock Crypto module
jest.mock('../crypto', () => ({
  Crypto: {
    decrypt: jest.fn()
  },
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

// // Mock buffer module
// jest.mock('buffer', () => ({
//   Buffer: jest.fn()
// }));

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
import {
  mockCrypto,
  mockKdfMobile,
  mockKeyCosmos,
  mockKeyStore,
  mockMultiKeyStore,
  mockPassword,
  mockRng
} from '../__mocks__/keyring';
import { Crypto, KeyStore } from '../crypto';
import { RNG } from '@owallet/crypto';
import { object } from 'joi';

const mockKvStore = {
  get: jest.fn().mockResolvedValue(undefined),
  set: jest.fn().mockResolvedValue(undefined),
  prefix: jest.fn().mockReturnValue('keyring')
};
const mockEmbedChain: any = null;
export const keyRing = new KeyRing(
  mockEmbedChain,
  mockKvStore,
  new LedgerService(null, null, null),
  mockRng,
  mockCrypto
);
describe('keyring', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  // describe('assignKeyStoreIdMeta', () => {
    //   test('should call getIncrementalNumber and return the modified meta object', async () => {
    //     const kvStore = {
    //       get: jest.fn().mockResolvedValue(0),
    //       set: jest.fn().mockResolvedValue(undefined),
    //       prefix: jest.fn().mockReturnValue('')
    //     };
    //     // Object meta ban đầu
    //     // Tạo một đối tượng từ class chứa hàm getIncrementalNumber
    //     const mockAssignKey = new MockFnHelper();
    //     const initialMeta = { key1: 'value1', key2: 'value2' };
    //     mockAssignKey['kvStore'] = kvStore;
    //     // Giá trị trả về từ getIncrementalNumber
    //     // const mockIncrementalNumber = 1;
    //     const mockIncrementalNumber = await mockAssignKey.getIncrementalNumber();

    //     // Mock implementation cho getIncrementalNumber
    //     jest
    //       .spyOn(mockAssignKey, 'getIncrementalNumber')
    //       .mockResolvedValue(mockIncrementalNumber);

    //     // Gọi hàm assignKeyStoreIdMeta
    //     const result = await mockAssignKey.assignKeyStoreIdMeta(initialMeta);

    //     // Kiểm tra xem getIncrementalNumber đã được gọi
    //     expect(mockAssignKey.getIncrementalNumber).toHaveBeenCalled();

    //     // Kiểm tra xem kết quả trả về là đúng
    //     expect(result).toEqual({
    //       ...initialMeta,
    //       __id__: mockIncrementalNumber.toString()
    //     });
    //   });
    // });
  describe('getIncrementalNumber', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    test('should return the correct incremental number', async () => {
      // Mock kvStore
      // Gọi hàm getIncrementalNumber và kiểm tra kết quả
      const result = await keyRing['getIncrementalNumber']();
      // Kiểm tra kết quả trả về
      expect(result).toBe(1);
      // Kiểm tra các mock function được gọi đúng số lần và với đúng đối số
      expect(mockKvStore.get).toHaveBeenCalledTimes(1);
      expect(mockKvStore.get).toHaveBeenCalledWith('incrementalNumber');
      expect(mockKvStore.set).toHaveBeenCalledTimes(1);
      expect(mockKvStore.set).toHaveBeenCalledWith('incrementalNumber', 1);
    });

    test('should return the correct incremental number when it already exists', async () => {
      // Mock kvStore
      const kvStore = {
        get: jest.fn().mockResolvedValue(5),
        set: jest.fn().mockResolvedValue(undefined),
        prefix: jest.fn().mockReturnValue('')
      };
      Object.defineProperty(keyRing, 'kvStore', {
        value: kvStore,
        writable: true
      });
      // Gọi hàm getIncrementalNumber và kiểm tra kết quả
      const result = await keyRing['getIncrementalNumber']();
      // Kiểm tra kết quả trả về
      expect(result).toBe(6);
      // Kiểm tra các mock function được gọi đúng số lần và với đúng đối số
      expect(kvStore.get).toHaveBeenCalledTimes(1);
      expect(kvStore.get).toHaveBeenCalledWith('incrementalNumber');
      expect(kvStore.set).toHaveBeenCalledTimes(1);
      expect(kvStore.set).toHaveBeenCalledWith('incrementalNumber', 6);
    });
  });
  describe('status', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
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

    it('should return KeyRingStatus.EMPTY when keyStore is null', () => {
      // Gán giá trị null cho thuộc tính keyStore
      Object.defineProperty(keyRing, 'keyStore', {
        value: null,
        writable: true
      });
      // Monkey patch the loaded property
      Object.defineProperty(keyRing, 'loaded', {
        value: true,
        writable: true
      });

      // Gọi phương thức status
      const result = keyRing.status;
      // Kiểm tra kết quả
      expect(result).toBe(KeyRingStatus.EMPTY);
    });

    it('should return KeyRingStatus.UNLOCKED when keyRing.isLocked() returns false', () => {
      // Gán giá trị cho thuộc tính keyStore
      Object.defineProperty(keyRing, 'keyStore', {
        value: mockKeyStore.mnemonic.pbkdf2,
        writable: true
      });
      // Monkey patch the loaded property
      Object.defineProperty(keyRing, 'loaded', {
        value: true,
        writable: true
      });

      // Mock keyRing.isLocked() để trả về false
      jest.spyOn(keyRing, 'isLocked').mockReturnValue(false);

      // Gọi phương thức status
      const result = keyRing.status;
      // Kiểm tra kết quả
      expect(result).toBe(KeyRingStatus.UNLOCKED);
    });

    it('should return KeyRingStatus.LOCKED when all conditions are false', () => {
      // Gán giá trị cho thuộc tính keyStore
      Object.defineProperty(keyRing, 'keyStore', {
        value: mockKeyStore.mnemonic.pbkdf2,
        writable: true
      });
      // Monkey patch the loaded property
      Object.defineProperty(keyRing, 'loaded', {
        value: true,
        writable: true
      });
      // Mock MockIsLocked.isLocked() để trả về true
      jest.spyOn(keyRing, 'isLocked').mockReturnValue(true);

      // Gọi phương thức status
      const result = keyRing.status;
      // Kiểm tra kết quả
      expect(result).toBe(KeyRingStatus.LOCKED);
    });
  });
  describe('lock', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
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
  describe('getTypeOfKeyStore', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    it('should return "mnemonic" if type is null', () => {
      // Arrange
      const keyStore: Omit<KeyStore, 'crypto'> = {
        ...mockKeyStore.mnemonic.pbkdf2,
        type: null
      };

      // Act
      const result = KeyRing.getTypeOfKeyStore(keyStore);

      // Assert
      expect(result).toBe('mnemonic');
    });

    it('should return the correct type if type is valid', () => {
      // Arrange
      const mnemonicKeyStore: Omit<KeyStore, 'crypto'> = {
        ...mockKeyStore.mnemonic.pbkdf2,
        type: 'mnemonic'
      };

      const privateKeyKeyStore: Omit<KeyStore, 'crypto'> = {
        ...mockKeyStore.mnemonic.pbkdf2,
        type: 'privateKey'
      };

      const ledgerKeyStore: Omit<KeyStore, 'crypto'> = {
        ...mockKeyStore.mnemonic.pbkdf2,
        type: 'ledger'
      };

      // Act
      const mnemonicResult = KeyRing.getTypeOfKeyStore(mnemonicKeyStore);
      const privateKeyResult = KeyRing.getTypeOfKeyStore(privateKeyKeyStore);
      const ledgerResult = KeyRing.getTypeOfKeyStore(ledgerKeyStore);

      // Assert
      expect(mnemonicResult).toBe('mnemonic');
      expect(privateKeyResult).toBe('privateKey');
      expect(ledgerResult).toBe('ledger');
    });

    it('should throw an error if type is invalid', () => {
      // Arrange
      const invalidKeyStore: Omit<KeyStore, 'crypto'> = {
        ...mockKeyStore.mnemonic.pbkdf2,
        type: 'invalid' as any
      };

      // Act & Assert
      expect(() => KeyRing.getTypeOfKeyStore(invalidKeyStore)).toThrowError(
        'Invalid type of key store'
      );
    });
    describe('type', () => {
      afterEach(() => {
        jest.clearAllMocks();
      });
      it('should return "none" if keyStore is null or undefined', () => {
        // Arrange
        Object.defineProperty(keyRing, 'keyStore', {
          value: null,
          writable: true
        });
        // Act
        const result = keyRing.type;
        // Assert
        expect(result).toBe('none');
      });

      it('should return the correct type if keyStore is not null or undefined', () => {
        // Arrange
        const mnemonicKeyStore: Omit<KeyStore, 'crypto'> = {
          ...mockKeyStore.mnemonic.pbkdf2,
          type: 'mnemonic'
        };
        const privateKeyKeyStore: Omit<KeyStore, 'crypto'> = {
          ...mockKeyStore.privateKey.pbkdf2,
          type: 'privateKey'
        };
        const ledgerKeyStore: Omit<KeyStore, 'crypto'> = {
          ...mockKeyStore.ledger.pbkdf2,
          type: 'ledger'
        };
        Object.defineProperty(keyRing, 'keyStore', {
          value: mnemonicKeyStore,
          writable: true
        });
        const result1 = keyRing.type;
        expect(result1).toBe('mnemonic');
        Object.defineProperty(keyRing, 'keyStore', {
          value: privateKeyKeyStore,
          writable: true
        });
        const result2 = keyRing.type;
        expect(result2).toBe('privateKey');
        Object.defineProperty(keyRing, 'keyStore', {
          value: ledgerKeyStore,
          writable: true
        });
        const result3 = keyRing.type;
        expect(result3).toBe('ledger');
      });
    });
  });
  describe('unlock', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    it('should throw an error if keyStore is not initialized', async () => {
      // Arrange
      Object.defineProperty(keyRing, 'keyStore', {
        value: null,
        writable: true
      });

      // Act and Assert
      await expect(keyRing.unlock(mockPassword)).rejects.toThrow(
        'Key ring not initialized'
      );
    });

    it('should decrypt and set mnemonic if keyStore type is "mnemonic"', async () => {
      jest
        .spyOn(Crypto, 'decrypt')
        .mockResolvedValue(Buffer.from(mockKeyCosmos.mnemonic));
      // Arrange
      Object.defineProperty(keyRing, 'keyStore', {
        value: mockKeyStore.mnemonic.pbkdf2,
        writable: true
      });
      const spySetMnemonic = jest.spyOn(keyRing as any, 'mnemonic', 'set');
      // Act
      await keyRing.unlock(mockPassword);
      const mnemonic = Reflect.get(keyRing, 'mnemonic');
      const passwordReflect = Reflect.get(keyRing, 'password');

      // Assert
      expect(spySetMnemonic).toHaveBeenCalled();
      expect(spySetMnemonic).toBeCalledTimes(1);
      expect(Crypto.decrypt).toHaveBeenCalledWith(
        mockCrypto,
        mockKeyStore.mnemonic.pbkdf2,
        mockPassword
      );
      expect(mnemonic).toBe(mockKeyCosmos.mnemonic);
      expect(passwordReflect).toBe(mockPassword);
    });

    it('should decrypt and set privateKey if keyStore type is "privateKey"', async () => {
      jest
        .spyOn(Crypto, 'decrypt')
        .mockResolvedValue(Buffer.from(mockKeyCosmos.privateKey));
      // Arrange
      Object.defineProperty(keyRing, 'keyStore', {
        value: mockKeyStore.privateKey.pbkdf2,
        writable: true
      });
      const spySetPrivateKey = jest.spyOn(keyRing as any, 'privateKey', 'set');
      // Act
      await keyRing.unlock(mockPassword);
      const privateKey = Reflect.get(keyRing, 'privateKey');
      const passwordReflect = Reflect.get(keyRing, 'password');

      // Assert
      expect(spySetPrivateKey).toHaveBeenCalled();
      expect(spySetPrivateKey).toBeCalledTimes(1);
      expect(Crypto.decrypt).toHaveBeenCalledWith(
        mockCrypto,
        mockKeyStore.privateKey.pbkdf2,
        mockPassword
      );
      expect(privateKey.toString('hex')).toBe(mockKeyCosmos.privateKey);
      expect(passwordReflect).toBe(mockPassword);
    });

    it('should decrypt and set ledgerPublicKey if keyStore type is "ledger"', async () => {
      jest
        .spyOn(Crypto, 'decrypt')
        .mockResolvedValue(Buffer.from(mockKeyCosmos.publicKey));
      // Arrange
      Object.defineProperty(keyRing, 'keyStore', {
        value: mockKeyStore.ledger.pbkdf2,
        writable: true
      });
      const spySetLedgerPublicKey = jest.spyOn(
        keyRing as any,
        'ledgerPublicKey',
        'set'
      );
      // Act
      await keyRing.unlock(mockPassword);
      const ledgerPublicKey = Reflect.get(keyRing, 'ledgerPublicKey');
      const passwordReflect = Reflect.get(keyRing, 'password');

      // Assert
      expect(spySetLedgerPublicKey).toHaveBeenCalled();
      expect(spySetLedgerPublicKey).toBeCalledTimes(1);
      expect(Crypto.decrypt).toHaveBeenCalledWith(
        mockCrypto,
        mockKeyStore.ledger.pbkdf2,
        mockPassword
      );
      expect(ledgerPublicKey.toString('hex')).toBe(mockKeyCosmos.publicKey);
      expect(passwordReflect).toBe(mockPassword);
    });
  });
  describe('showKeyring', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    const mockIndex = 0;
    describe('should to throw err status for showKeyRing method', () => {
      afterEach(() => {
        jest.clearAllMocks();
      });
      it('check status KeyRingStatus.EMPTY with KeyRingStatus.UNLOCKED', async () => {
        const statusSpy = jest
          .spyOn(keyRing as any, 'status', 'get')
          .mockReturnValue(KeyRingStatus.EMPTY);

        await expect(
          keyRing.showKeyRing(mockIndex, mockPassword)
        ).rejects.toThrow('Key ring is not unlocked');
        expect(statusSpy).toHaveBeenCalled();
        expect(statusSpy).toBeCalledTimes(1);
      });
      it('check status KeyRingStatus.LOCKED with KeyRingStatus.UNLOCKED', async () => {
        const statusSpy = jest
          .spyOn(keyRing as any, 'status', 'get')
          .mockReturnValue(KeyRingStatus.LOCKED);

        await expect(
          keyRing.showKeyRing(mockIndex, mockPassword)
        ).rejects.toThrow('Key ring is not unlocked');
        expect(statusSpy).toHaveBeenCalled();
        expect(statusSpy).toBeCalledTimes(1);
      });
      it('check status KeyRingStatus.NOTLOADED with KeyRingStatus.UNLOCKED', async () => {
        const statusSpy = jest
          .spyOn(keyRing as any, 'status', 'get')
          .mockReturnValue(KeyRingStatus.NOTLOADED);

        await expect(
          keyRing.showKeyRing(mockIndex, mockPassword)
        ).rejects.toThrow('Key ring is not unlocked');
        expect(statusSpy).toHaveBeenCalled();
        expect(statusSpy).toBeCalledTimes(1);
      });
    });
    describe('should to throw err password for showKeyRing method', () => {
      afterEach(() => {
        jest.clearAllMocks();
      });
      it('check password with password params', async () => {
        const statusSpy = jest
          .spyOn(keyRing as any, 'status', 'get')
          .mockReturnValue(KeyRingStatus.UNLOCKED);
        Object.defineProperty(keyRing, 'password', {
          value: 'mock pass',
          writable: true
        });
        await expect(
          keyRing.showKeyRing(mockIndex, mockPassword)
        ).rejects.toThrow('Invalid password');
        expect(statusSpy).toHaveBeenCalled();
        expect(statusSpy).toBeCalledTimes(1);
      });
    });
    describe('should to throw err keyStore for showKeyRing method', () => {
      afterEach(() => {
        jest.clearAllMocks();
      });
      it('check keyStore null or undefined', async () => {
        const statusSpy = jest
          .spyOn(keyRing as any, 'status', 'get')
          .mockReturnValue(KeyRingStatus.UNLOCKED);
        Object.defineProperty(keyRing, 'password', {
          value: mockPassword,
          writable: true
        });
        await expect(keyRing.showKeyRing(5, mockPassword)).rejects.toThrow(
          'Empty key store'
        );
        expect(statusSpy).toHaveBeenCalled();
        expect(statusSpy).toBeCalledTimes(1);
      });
    });
    describe('decrypt data follow key store type', () => {
      afterEach(() => {
        jest.clearAllMocks();
      });
      it('with key store type == mnemonic', async () => {
        const statusSpy = jest
          .spyOn(keyRing as any, 'status', 'get')
          .mockReturnValue(KeyRingStatus.UNLOCKED);
        Object.defineProperty(keyRing, 'password', {
          value: mockPassword,
          writable: true
        });
        Object.defineProperty(keyRing, 'multiKeyStore', {
          value: mockMultiKeyStore,
          writable: true
        });
        const decryptSpy = jest
          .spyOn(Crypto, 'decrypt')
          .mockResolvedValue(Buffer.from(mockKeyCosmos.mnemonic));
        const rs = await keyRing.showKeyRing(1, mockPassword);
        expect(rs).toBe(mockKeyCosmos.mnemonic);
        expect(statusSpy).toHaveBeenCalled();
        expect(statusSpy).toBeCalledTimes(1);
        expect(decryptSpy).toHaveBeenCalled();
        expect(decryptSpy).toHaveBeenCalledWith(
          mockCrypto,
          mockMultiKeyStore[1],
          mockPassword
        );
      });
      it('with key store type == privateKey', async () => {
        const statusSpy = jest
          .spyOn(keyRing as any, 'status', 'get')
          .mockReturnValue(KeyRingStatus.UNLOCKED);
        Object.defineProperty(keyRing, 'password', {
          value: mockPassword,
          writable: true
        });
        Object.defineProperty(keyRing, 'multiKeyStore', {
          value: mockMultiKeyStore,
          writable: true
        });
        const decryptSpy = jest
          .spyOn(Crypto, 'decrypt')
          .mockResolvedValue(Buffer.from(mockKeyCosmos.privateKey));
        const rs = await keyRing.showKeyRing(2, mockPassword);
        expect(rs).toBe(mockKeyCosmos.privateKey);
        expect(statusSpy).toHaveBeenCalled();
        expect(statusSpy).toBeCalledTimes(1);
        expect(decryptSpy).toHaveBeenCalled();
        expect(decryptSpy).toHaveBeenCalledWith(
          mockCrypto,
          mockMultiKeyStore[2],
          mockPassword
        );
      });
      it('with key store type == ledger', async () => {
        const statusSpy = jest
          .spyOn(keyRing as any, 'status', 'get')
          .mockReturnValue(KeyRingStatus.UNLOCKED);
        Object.defineProperty(keyRing, 'password', {
          value: mockPassword,
          writable: true
        });
        Object.defineProperty(keyRing, 'multiKeyStore', {
          value: mockMultiKeyStore,
          writable: true
        });
        const decryptSpy = jest
          .spyOn(Crypto, 'decrypt')
          .mockResolvedValue(Buffer.from(mockKeyCosmos.publicKey));
        const rs = await keyRing.showKeyRing(0, mockPassword);
        expect(rs).toBe(mockKeyCosmos.publicKey);
        expect(statusSpy).toHaveBeenCalled();
        expect(statusSpy).toBeCalledTimes(1);
        expect(decryptSpy).toHaveBeenCalled();
        expect(decryptSpy).toHaveBeenCalledWith(
          mockCrypto,
          mockMultiKeyStore[0],
          mockPassword
        );
      });
    });
  });
});
