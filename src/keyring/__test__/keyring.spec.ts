import {
  mockAddressLedger,
  mockCoinType,
  mockPathBip44
} from './../__mocks__/keyring';
// Mock Crypto module
jest.mock('../crypto', () => ({
  Crypto: {
    decrypt: jest.fn(),
    encrypt: jest.fn()
  },
  KeyStore: jest.fn()
}));

// Mock @owallet/crypto module
// jest.mock('@owallet/crypto', () => ({
//   Mnemonic: jest.fn(),
//   PrivKeySecp256k1: jest.fn(),
//   PubKeySecp256k1: jest.fn(),
//   RNG: jest.fn()
// }));

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
  LedgerService: jest.fn().mockImplementation(() => ({
    getPublicKey: jest.fn()
  }))
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
  getNetworkTypeByBip44HDPath: jest.fn().mockReturnValue('cosmos'),
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
import { getNetworkTypeByBip44HDPath } from '../../utils/helper';
import {
  mockBip44HDPath,
  mockCrypto,
  mockKdfMobile,
  mockKeyCosmos,
  mockKeyStore,
  mockMeta,
  mockMetaHasId,
  mockMultiKeyStore,
  mockMultiKeyStoreInfo,
  mockPassword,
  mockRng
} from '../__mocks__/keyring';
import { Crypto, KeyStore } from '../crypto';
import { KeyMultiStoreKey, KeyStoreKey } from '../__mocks__/types';
import { Env, OWalletError } from '@owallet/router';
import { Mnemonic, PrivKeySecp256k1 } from '@owallet/crypto';
// import { Mnemonic } from '@owallet/crypto';

const mockKvStore = {
  get: jest.fn().mockResolvedValue(undefined),
  set: jest.fn().mockResolvedValue(undefined),
  prefix: jest.fn().mockReturnValue('keyring')
};
const mockEmbedChain: any = null;
export let keyRing = new KeyRing(
  mockEmbedChain,
  mockKvStore,
  new LedgerService(null, null, null),
  mockRng,
  mockCrypto
);
describe('keyring', () => {
  beforeEach(() => {
    keyRing = new KeyRing(
      mockEmbedChain,
      mockKvStore,
      new LedgerService(null, null, null),
      mockRng,
      mockCrypto
    );
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getKeyStoreId', () => {
    it('should return the id of the key store if it exists', () => {
      const result = KeyRing['getKeyStoreId'](mockMultiKeyStore[1]);

      expect(result).toBe(mockMetaHasId.__id__);
    });

    it('should throw an error if the key store id is empty', () => {
      const keyStoreMock: KeyStore = {
        ...mockMultiKeyStore[1],
        meta: {
          __id__: ''
        }
      };
      expect(() => KeyRing['getKeyStoreId'](keyStoreMock)).toThrow(
        "Key store's id is empty"
      );
    });

    it('should throw an error if the key store id is undefined', () => {
      const keyStoreMock: KeyStore = {
        ...mockMultiKeyStore[1],
        meta: {
          __id__: ''
        }
      };
      expect(() => KeyRing['getKeyStoreId'](keyStoreMock)).toThrow(
        "Key store's id is empty"
      );
    });
  });
  describe('getMultiKeyStoreInfo', () => {
    it('should return the correct multiKeyStoreInfo', () => {
      keyRing['multiKeyStore'] = mockMultiKeyStore;
      // Mock keyStore

      keyRing['keyStore'] = mockMultiKeyStore[1];
      // Gọi phương thức getMultiKeyStoreInfo()
      const result = keyRing.getMultiKeyStoreInfo();

      // Kiểm tra kết quả
      expect(result).toEqual(mockMultiKeyStoreInfo);
    });
  });
  describe('save', () => {
    it('should save keyStore and multiKeyStore', async () => {
      keyRing['keyStore'] = mockMultiKeyStore[1];
      keyRing['multiKeyStore'] = mockMultiKeyStore;

      // Gọi phương thức save()
      await keyRing.save();

      // Kiểm tra việc gọi kvStore.set với đúng đối số
      expect(mockKvStore.set).toHaveBeenCalledTimes(2);
      expect(mockKvStore.set).toHaveBeenCalledWith(
        KeyStoreKey,
        mockMultiKeyStore[1]
      );
      expect(mockKvStore.set).toHaveBeenCalledWith(
        KeyMultiStoreKey,
        mockMultiKeyStore
      );
    });
  });
  describe('isLocked', () => {
    it('should return true when privateKey, mnemonic, and ledgerPublicKey are null or undefined', () => {
      // Tạo instance của lớp MockIsLocked
      // const instance = new MockIsLocked();

      // Gán giá trị null/undefined cho các thuộc tính
      keyRing['privateKey'] = null;
      keyRing['mnemonic'] = undefined;
      keyRing['ledgerPublicKey'] = null;
      // Gọi phương thức isLocked()
      const result = keyRing.isLocked();

      // Kiểm tra kết quả
      expect(result).toBe(true);
    });

    it('should return false when at least one of privateKey, mnemonic, or ledgerPublicKey has a value', () => {
      // Gán giá trị cho một trong các thuộc tính
      keyRing['privateKey'] = new Uint8Array();
      keyRing['mnemonic'] = mockKeyCosmos.mnemonic;
      keyRing['ledgerPublicKey'] = new Uint8Array();

      // Gọi phương thức isLocked()
      const result = keyRing.isLocked();

      // Kiểm tra kết quả
      expect(result).toBe(false);
    });
  });
  describe('getIncrementalNumber', () => {
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
  describe('assignKeyStoreIdMeta', () => {
    test('should call getIncrementalNumber and return the modified meta object', async () => {
      // Mock implementation cho getIncrementalNumber
      const getIncrementalNumberSpy = jest
        .spyOn(keyRing as any, 'getIncrementalNumber')
        .mockResolvedValue('1');

      // Gọi hàm assignKeyStoreIdMeta
      const result = await keyRing['assignKeyStoreIdMeta'](mockMeta);

      // Kiểm tra xem getIncrementalNumber đã được gọi
      expect(getIncrementalNumberSpy).toHaveBeenCalled();
      expect(getIncrementalNumberSpy).toHaveBeenCalledTimes(1);
      // Kiểm tra xem kết quả trả về là đúng
      expect(result).toEqual({
        ...mockMeta,
        __id__: '1'
      });
    });
  });

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
  describe('CreateMnemonicKeyStore', () => {
    it('should call Crypto.encrypt with the correct arguments', async () => {
      // Gọi hàm CreateMnemonicKeyStore
      await KeyRing['CreateMnemonicKeyStore'](
        mockRng,
        mockCrypto,
        mockKdfMobile,
        mockKeyCosmos.mnemonic,
        mockPassword,
        mockMetaHasId,
        mockBip44HDPath
      );

      // Kiểm tra xem Crypto.encrypt đã được gọi với đúng các tham số
      expect(Crypto.encrypt).toHaveBeenCalled();
      expect(Crypto.encrypt).toHaveBeenCalledTimes(1);
      expect(Crypto.encrypt).toHaveBeenCalledWith(
        mockRng,
        mockCrypto,
        mockKdfMobile,
        'mnemonic',
        mockKeyCosmos.mnemonic,
        mockPassword,
        mockMetaHasId,
        mockBip44HDPath
      );
    });
  });
  describe('CreateLedgerKeyStore', () => {
    beforeEach(() => {
      jest.spyOn(Crypto, 'encrypt').mockClear();
    });

    it('should call Crypto.encrypt with the correct arguments', async () => {
      await KeyRing['CreateLedgerKeyStore'](
        mockRng,
        mockCrypto,
        mockKdfMobile,
        mockKeyCosmos.publicKeyHex,
        mockPassword,
        mockMetaHasId,
        mockBip44HDPath,
        mockAddressLedger
      );
      expect(Crypto.encrypt).toHaveBeenCalled();
      expect(Crypto.encrypt).toHaveBeenCalledTimes(1);
      expect(Crypto.encrypt).toHaveBeenCalledWith(
        mockRng,
        mockCrypto,
        mockKdfMobile,
        'ledger',
        Buffer.from(mockKeyCosmos.publicKeyHex).toString('hex'),
        mockPassword,
        mockMetaHasId,
        mockBip44HDPath,
        mockAddressLedger
      );
    });
  });
  describe('CreatePrivateKeyStore', () => {
    beforeEach(() => {
      jest.spyOn(Crypto, 'encrypt').mockClear();
    });
    it('should call Crypto.encrypt with the correct arguments', async () => {
      // Gọi hàm CreateMnemonicKeyStore
      await KeyRing['CreatePrivateKeyStore'](
        mockRng,
        mockCrypto,
        mockKdfMobile,
        mockKeyCosmos.privateKeyHex,
        mockPassword,
        mockMetaHasId
      );

      // Kiểm tra xem Crypto.encrypt đã được gọi với đúng các tham số
      expect(Crypto.encrypt).toHaveBeenCalledWith(
        mockRng,
        mockCrypto,
        mockKdfMobile,
        'privateKey',
        Buffer.from(mockKeyCosmos.privateKeyHex).toString('hex'),
        mockPassword,
        mockMetaHasId
      );
    });
  });
  describe('createMnemonicKey', () => {
    it('should create mnemonic key and update keyStore and multiKeyStore', async () => {
      // Gán giá trị cho các thuộc tính

      // Mock các phương thức liên quan
      const spyCreateMnemonicKeyStore = jest
        .spyOn(KeyRing as any, 'CreateMnemonicKeyStore')
        .mockResolvedValue(mockMultiKeyStore[1]);

      jest
        .spyOn(keyRing as any, 'status', 'get')
        .mockReturnValue(KeyRingStatus.UNLOCKED);
      jest
        .spyOn(keyRing as any, 'getMultiKeyStoreInfo')
        .mockReturnValue(mockMultiKeyStoreInfo);
      jest.spyOn(keyRing, 'save');
      const assignKeyStoreIdMetaSpy = jest.spyOn(
        keyRing as any,
        'assignKeyStoreIdMeta'
      );
      // Gọi phương thức createMnemonicKey()
      const result = await keyRing.createMnemonicKey(
        mockKdfMobile,
        mockKeyCosmos.mnemonic,
        mockPassword,
        mockMeta,
        mockBip44HDPath
      );

      // Kiểm tra kết quả
      expect(result.status).toBe(KeyRingStatus.UNLOCKED);
      expect(result.multiKeyStoreInfo).toEqual(mockMultiKeyStoreInfo);
      expect(keyRing['mnemonic']).toBe(mockKeyCosmos.mnemonic);
      expect(keyRing['keyStore']).toBe(mockMultiKeyStore[1]);
      expect(keyRing['password']).toBe(mockPassword);
      // expect(instance.multiKeyStore).toEqual(mockMultiKeyStore);
      expect(spyCreateMnemonicKeyStore).toHaveBeenCalledWith(
        mockRng,
        mockCrypto,
        mockKdfMobile,
        mockKeyCosmos.mnemonic,
        mockPassword,
        mockMetaHasId,
        mockBip44HDPath
      );
      expect(assignKeyStoreIdMetaSpy).toHaveBeenCalled();
      expect(keyRing.save).toHaveBeenCalled();
    });
  });
  describe('addMnemonicKey', () => {
    it('should add mnemonic key and update keyStore and multiKeyStore', async () => {
      // Mock các phương thức liên quan
      const spyCreateMnemonicKeyStore = jest
        .spyOn(KeyRing as any, 'CreateMnemonicKeyStore')
        .mockResolvedValue(mockMultiKeyStore[1]);
      keyRing['password'] = mockPassword;
      jest
        .spyOn(keyRing as any, 'getMultiKeyStoreInfo')
        .mockReturnValue(mockMultiKeyStoreInfo);
      jest.spyOn(keyRing, 'save');
      const assignKeyStoreIdMetaSpy = jest.spyOn(
        keyRing as any,
        'assignKeyStoreIdMeta'
      );
      // Gọi phương thức createMnemonicKey()
      const result = await keyRing.addMnemonicKey(
        mockKdfMobile,
        mockKeyCosmos.mnemonic,
        mockMeta,
        mockBip44HDPath
      );

      // Kiểm tra kết quả
      expect(result.multiKeyStoreInfo).toEqual(mockMultiKeyStoreInfo);
      expect(keyRing['password']).toBe(mockPassword);
      // expect(instance.multiKeyStore).toEqual(mockMultiKeyStore);
      expect(spyCreateMnemonicKeyStore).toHaveBeenCalledWith(
        mockRng,
        mockCrypto,
        mockKdfMobile,
        mockKeyCosmos.mnemonic,
        mockPassword,
        mockMetaHasId,
        mockBip44HDPath
      );
      expect(assignKeyStoreIdMetaSpy).toHaveBeenCalled();
      expect(keyRing.save).toHaveBeenCalled();
    });
  });
  describe('createPrivateKey', () => {
    it('should create private key and update keyStore and multiKeyStore', async () => {
      // Mock các phương thức liên quan
      const spyCreatePrivateKeyStore = jest
        .spyOn(KeyRing as any, 'CreatePrivateKeyStore')
        .mockResolvedValue(mockMultiKeyStore[2]);

      jest
        .spyOn(keyRing as any, 'status', 'get')
        .mockReturnValue(KeyRingStatus.UNLOCKED);
      jest
        .spyOn(keyRing as any, 'getMultiKeyStoreInfo')
        .mockReturnValue(mockMultiKeyStoreInfo);
      jest.spyOn(keyRing, 'save');
      const assignKeyStoreIdMetaSpy = jest.spyOn(
        keyRing as any,
        'assignKeyStoreIdMeta'
      );
      // Gọi phương thức createMnemonicKey()
      const result = await keyRing.createPrivateKey(
        mockKdfMobile,
        mockKeyCosmos.privateKeyHex,
        mockPassword,
        mockMeta
      );

      // Kiểm tra kết quả
      expect(result.status).toBe(KeyRingStatus.UNLOCKED);
      expect(result.multiKeyStoreInfo).toEqual(mockMultiKeyStoreInfo);
      expect(keyRing['privateKey']).toBe(mockKeyCosmos.privateKeyHex);
      expect(keyRing['keyStore']).toBe(mockMultiKeyStore[2]);
      expect(keyRing['password']).toBe(mockPassword);
      expect(spyCreatePrivateKeyStore).toHaveBeenCalledWith(
        mockRng,
        mockCrypto,
        mockKdfMobile,
        mockKeyCosmos.privateKeyHex,
        mockPassword,
        mockMetaHasId
      );
      expect(assignKeyStoreIdMetaSpy).toHaveBeenCalled();
      expect(keyRing.save).toHaveBeenCalled();
    });
  });
  describe('addPrivateKey', () => {
    it('should add private key and update keyStore and multiKeyStore', async () => {
      keyRing['password'] = mockPassword;
      // Mock các phương thức liên quan
      const spyCreatePrivateKeyStore = jest
        .spyOn(KeyRing as any, 'CreatePrivateKeyStore')
        .mockResolvedValue(mockMultiKeyStore[2]);

      jest
        .spyOn(keyRing as any, 'getMultiKeyStoreInfo')
        .mockReturnValue(mockMultiKeyStoreInfo);
      jest.spyOn(keyRing, 'save');
      const assignKeyStoreIdMetaSpy = jest.spyOn(
        keyRing as any,
        'assignKeyStoreIdMeta'
      );
      // Gọi phương thức createMnemonicKey()
      const result = await keyRing.addPrivateKey(
        mockKdfMobile,
        mockKeyCosmos.privateKeyHex,
        mockMeta
      );

      // Kiểm tra kết quả

      expect(result.multiKeyStoreInfo).toEqual(mockMultiKeyStoreInfo);
      expect(keyRing['password']).toBe(mockPassword);
      expect(spyCreatePrivateKeyStore).toHaveBeenCalledWith(
        mockRng,
        mockCrypto,
        mockKdfMobile,
        mockKeyCosmos.privateKeyHex,
        mockPassword,
        mockMetaHasId
      );
      expect(assignKeyStoreIdMetaSpy).toHaveBeenCalled();
      expect(keyRing.save).toHaveBeenCalled();
    });
  });
  describe('createLedgerKey', () => {
    it('should create ledger key and update keyStore and multiKeyStore', async () => {
      // Mock các phương thức liên quan
      jest.spyOn(keyRing['ledgerKeeper'], 'getPublicKey').mockResolvedValue({
        publicKey: mockKeyCosmos.publicKeyHex,
        address: mockKeyCosmos.address
      });
      const spyCreateLedgerKeyStore = jest
        .spyOn(KeyRing as any, 'CreateLedgerKeyStore')
        .mockResolvedValue(mockMultiKeyStore[0]);

      jest
        .spyOn(keyRing as any, 'getMultiKeyStoreInfo')
        .mockReturnValue(mockMultiKeyStoreInfo);
      jest
        .spyOn(keyRing as any, 'assignKeyStoreIdMeta')
        .mockResolvedValue(mockMetaHasId);
      jest
        .spyOn(keyRing as any, 'status', 'get')
        .mockReturnValue(KeyRingStatus.UNLOCKED);
      jest.spyOn(keyRing, 'save');
      const mockEnv: Env = {
        isInternalMsg: false,
        requestInteraction: jest.fn()
      };
      // Gọi phương thức createMnemonicKey()
      const result = await keyRing.createLedgerKey(
        mockEnv,
        mockKdfMobile,
        mockPassword,
        mockMeta,
        mockBip44HDPath
      );

      // Kiểm tra kết quả
      expect(result.status).toBe(KeyRingStatus.UNLOCKED);
      expect(result.multiKeyStoreInfo).toEqual(mockMultiKeyStoreInfo);
      expect(keyRing['ledgerPublicKey']).toBe(mockKeyCosmos.publicKeyHex);
      expect(keyRing['keyStore']).toBe(mockMultiKeyStore[0]);
      expect(keyRing['password']).toBe(mockPassword);

      expect(spyCreateLedgerKeyStore).toHaveBeenCalledWith(
        mockRng,
        mockCrypto,
        mockKdfMobile,
        mockKeyCosmos.publicKeyHex,
        mockPassword,
        mockMetaHasId,
        mockBip44HDPath,
        mockAddressLedger
      );
      expect(keyRing['assignKeyStoreIdMeta']).toHaveBeenCalled();
      expect(keyRing.save).toHaveBeenCalled();
      expect(getNetworkTypeByBip44HDPath).toHaveBeenCalled();
      expect(keyRing['ledgerKeeper'].getPublicKey).toHaveBeenCalled();
    });
  });
  describe('addLedgerKey', () => {
    it('should create ledger key and update keyStore and multiKeyStore', async () => {
      keyRing['password'] = mockPassword;
      // Mock các phương thức liên quan
      jest.spyOn(keyRing['ledgerKeeper'], 'getPublicKey').mockResolvedValue({
        publicKey: mockKeyCosmos.publicKeyHex,
        address: mockKeyCosmos.address
      });
      const spyCreateLedgerKeyStore = jest
        .spyOn(KeyRing as any, 'CreateLedgerKeyStore')
        .mockResolvedValue(mockMultiKeyStore[0]);

      jest
        .spyOn(keyRing as any, 'getMultiKeyStoreInfo')
        .mockReturnValue(mockMultiKeyStoreInfo);
      jest
        .spyOn(keyRing as any, 'assignKeyStoreIdMeta')
        .mockResolvedValue(mockMetaHasId);

      jest.spyOn(keyRing, 'save');
      const mockEnv: Env = {
        isInternalMsg: false,
        requestInteraction: jest.fn()
      };
      // Gọi phương thức createMnemonicKey()
      const result = await keyRing.addLedgerKey(
        mockEnv,
        mockKdfMobile,
        mockMeta,
        mockBip44HDPath
      );

      // Kiểm tra kết quả
      expect(result.multiKeyStoreInfo).toEqual(mockMultiKeyStoreInfo);
      expect(keyRing['password']).toBe(mockPassword);

      expect(spyCreateLedgerKeyStore).toHaveBeenCalledWith(
        mockRng,
        mockCrypto,
        mockKdfMobile,
        mockKeyCosmos.publicKeyHex,
        mockPassword,
        mockMetaHasId,
        mockBip44HDPath,
        mockAddressLedger
      );
      expect(keyRing['assignKeyStoreIdMeta']).toHaveBeenCalled();
      expect(keyRing.save).toHaveBeenCalled();
      expect(getNetworkTypeByBip44HDPath).toHaveBeenCalled();
      expect(keyRing['ledgerKeeper'].getPublicKey).toHaveBeenCalled();
    });
  });
  describe('showKeyring', () => {
    const mockIndex = 0;
    describe('should to throw err status for showKeyRing method', () => {
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
  describe('validateBIP44Path', () => {
    test('should throw an error if account is not an integer or is negative', () => {
      expect(() => {
        KeyRing.validateBIP44Path({ ...mockBip44HDPath, account: -1 });
      }).toThrow('Invalid account in hd path');
    });

    test('should throw an error if change is not an integer or is not 0 or 1', () => {
      expect(() => {
        KeyRing.validateBIP44Path({ ...mockBip44HDPath, change: 2 });
      }).toThrow('Invalid change in hd path');

      expect(() => {
        KeyRing.validateBIP44Path({
          ...mockBip44HDPath,
          change: 'invalid'
        } as any);
      }).toThrow('Invalid change in hd path');
    });

    test('should throw an error if addressIndex is not an integer or is negative', () => {
      expect(() => {
        KeyRing.validateBIP44Path({
          ...mockBip44HDPath,
          addressIndex: -1
        });
      }).toThrow('Invalid address index in hd path');

      expect(() => {
        KeyRing.validateBIP44Path({
          ...mockBip44HDPath,
          addressIndex: 1.5
        });
      }).toThrow('Invalid address index in hd path');

      expect(() => {
        KeyRing.validateBIP44Path({
          ...mockBip44HDPath,
          addressIndex: 'invalid'
        } as any);
      }).toThrow('Invalid address index in hd path');
    });

    test('should not throw an error if BIP44 path is valid', () => {
      expect(() => {
        KeyRing.validateBIP44Path(mockBip44HDPath);
      }).not.toThrow();
      expect(() => {
        KeyRing.validateBIP44Path({ account: 1, change: 1, addressIndex: 1 });
      }).not.toThrow();
    });
  });

  describe('getKeyStoreBIP44Path', () => {
    test('should return default BIP44 path if keyStore has no bip44HDPath', () => {
      const result = KeyRing['getKeyStoreBIP44Path']({
        ...mockKeyStore.mnemonic.pbkdf2,
        bip44HDPath: null
      });
      expect(result).toEqual(mockBip44HDPath);
    });

    test('should validate and return the bip44HDPath if it exists in keyStore', () => {
      const keyStore = mockKeyStore.mnemonic.pbkdf2;
      // Mock the validateBIP44Path method
      const mockValidateBIP44Path = jest.spyOn(KeyRing, 'validateBIP44Path');

      const result = KeyRing['getKeyStoreBIP44Path'](
        mockKeyStore.mnemonic.pbkdf2
      );

      expect(result).toEqual(keyStore.bip44HDPath);
      expect(mockValidateBIP44Path).toHaveBeenCalledWith(keyStore.bip44HDPath);

      // Restore the original validateBIP44Path method
      mockValidateBIP44Path.mockRestore();
    });
  });
  describe('loadPrivKey', () => {
    test('should throw error when key ring is not unlocked with status = LOCKED', () => {
      Object.defineProperty(keyRing, 'status', {
        value: KeyRingStatus.LOCKED,
        writable: true
      });
      Object.defineProperty(keyRing, 'type', {
        value: 'mnemonic',
        writable: true
      });
      keyRing['keyStore'] = mockKeyStore.mnemonic.pbkdf2;

      expect(() => keyRing['loadPrivKey'](mockCoinType)).toThrow(
        'Key ring is not unlocked'
      );
    });
    test('should throw error when key ring is not unlocked with type === none', () => {
      Object.defineProperty(keyRing, 'status', {
        value: KeyRingStatus.UNLOCKED,
        writable: true
      });
      Object.defineProperty(keyRing, 'type', {
        value: 'none',
        writable: true
      });
      keyRing['keyStore'] = mockKeyStore.mnemonic.pbkdf2;

      expect(() => keyRing['loadPrivKey'](mockCoinType)).toThrow(
        'Key ring is not unlocked'
      );
    });
    test('should throw error when key ring is not unlocked with keyStore === null', () => {
      Object.defineProperty(keyRing, 'status', {
        value: KeyRingStatus.UNLOCKED,
        writable: true
      });
      Object.defineProperty(keyRing, 'type', {
        value: 'mnemonic',
        writable: true
      });
      keyRing['keyStore'] = null;

      expect(() => keyRing['loadPrivKey'](mockCoinType)).toThrow(
        'Key ring is not unlocked'
      );
    });
    test('should not throw error when key ring is not unlocked with keyStore === null', () => {
      Object.defineProperty(keyRing, 'status', {
        value: KeyRingStatus.UNLOCKED,
        writable: true
      });
      Object.defineProperty(keyRing, 'type', {
        value: 'mnemonic',
        writable: true
      });
      keyRing['keyStore'] = mockKeyStore.mnemonic.pbkdf2;

      expect(() => keyRing['loadPrivKey'](mockCoinType)).not.toThrow(
        'Key ring is not unlocked'
      );
    });
    test('loadprivate key with type mnemonic err when not show this.mnemonic', () => {
      Object.defineProperty(keyRing, 'status', {
        value: KeyRingStatus.UNLOCKED,
        writable: true
      });
      Object.defineProperty(keyRing, 'type', {
        value: 'mnemonic',
        writable: true
      });

      keyRing['keyStore'] = mockKeyStore.mnemonic.pbkdf2;
      const spyKeyStoreBip44 = jest
        .spyOn(KeyRing as any, 'getKeyStoreBIP44Path')
        .mockReturnValue(mockKeyStore.mnemonic.pbkdf2);
      expect(() => keyRing['loadPrivKey'](mockCoinType)).toThrow(
        'Key store type is mnemonic and it is unlocked. But, mnemonic is not loaded unexpectedly'
      );
      expect(spyKeyStoreBip44).toHaveBeenCalled();
      jest.clearAllMocks();
    });
    test('loadprivate key with type mnemonic to get private key', () => {
      Object.defineProperty(keyRing, 'status', {
        value: KeyRingStatus.UNLOCKED,
        writable: true
      });
      Object.defineProperty(keyRing, 'type', {
        value: 'mnemonic',
        writable: true
      });
      keyRing['mnemonic'] = mockKeyCosmos.mnemonic;
      keyRing['keyStore'] = mockKeyStore.mnemonic.pbkdf2;
      const spyKeyStoreBip44 = jest
        .spyOn(KeyRing as any, 'getKeyStoreBIP44Path')
        .mockReturnValue(mockKeyStore.mnemonic.pbkdf2.bip44HDPath);
      const spyGenerateWalletFromMnemonic = jest
        .spyOn(Mnemonic as any, 'generateWalletFromMnemonic')
        .mockReturnValue(mockKeyCosmos.privateKeyHex);
      const rs = keyRing['loadPrivKey'](mockCoinType);
      expect(rs).toEqual(new PrivKeySecp256k1(mockKeyCosmos.privateKeyHex));
      expect(spyGenerateWalletFromMnemonic).toHaveBeenCalledTimes(1);
      expect(spyKeyStoreBip44).toHaveBeenCalledTimes(1);
      jest.clearAllMocks();
    });
    test('load private key with type mnemonic have cached key', () => {
      Object.defineProperty(keyRing, 'status', {
        value: KeyRingStatus.UNLOCKED,
        writable: true
      });
      Object.defineProperty(keyRing, 'type', {
        value: 'mnemonic',
        writable: true
      });
      keyRing['mnemonic'] = mockKeyCosmos.mnemonic;
      keyRing['keyStore'] = mockKeyStore.mnemonic.pbkdf2;
      keyRing['cached'].set(mockPathBip44, mockKeyCosmos.privateKeyHex);
      const spyGenerateWalletFromMnemonic = jest.spyOn(
        Mnemonic as any,
        'generateWalletFromMnemonic'
      );
      const spyKeyStoreBip44 = jest
        .spyOn(KeyRing as any, 'getKeyStoreBIP44Path')
        .mockReturnValue(mockKeyStore.mnemonic.pbkdf2.bip44HDPath);
      const rs = keyRing['loadPrivKey'](mockCoinType);
      expect(rs).toEqual(new PrivKeySecp256k1(mockKeyCosmos.privateKeyHex));
      expect(spyGenerateWalletFromMnemonic).not.toHaveBeenCalled();
      expect(spyKeyStoreBip44).toHaveBeenCalledTimes(1);
      jest.clearAllMocks();
    });
    test('loadprivate key with type private key err when not show this.privateKey', () => {
      Object.defineProperty(keyRing, 'status', {
        value: KeyRingStatus.UNLOCKED,
        writable: true
      });
      Object.defineProperty(keyRing, 'type', {
        value: 'privateKey',
        writable: true
      });

      keyRing['keyStore'] = mockKeyStore.mnemonic.pbkdf2;
      const spyKeyStoreBip44 = jest
        .spyOn(KeyRing as any, 'getKeyStoreBIP44Path')
        .mockReturnValue(mockKeyStore.mnemonic.pbkdf2);
      expect(() => keyRing['loadPrivKey'](mockCoinType)).toThrow(
        'Key store type is private key and it is unlocked. But, private key is not loaded unexpectedly'
      );
      expect(spyKeyStoreBip44).toHaveBeenCalled();
      jest.clearAllMocks();
    });
    test('load private key with type private key to get private key', () => {
      Object.defineProperty(keyRing, 'status', {
        value: KeyRingStatus.UNLOCKED,
        writable: true
      });
      Object.defineProperty(keyRing, 'type', {
        value: 'privateKey',
        writable: true
      });
      keyRing['_privateKey'] = mockKeyCosmos.privateKeyHex;
      keyRing['keyStore'] = mockKeyStore.mnemonic.pbkdf2;
      const spyKeyStoreBip44 = jest
        .spyOn(KeyRing as any, 'getKeyStoreBIP44Path')
        .mockReturnValue(mockKeyStore.mnemonic.pbkdf2.bip44HDPath);
      const rs = keyRing['loadPrivKey'](mockCoinType);
      expect(rs).toEqual(new PrivKeySecp256k1(mockKeyCosmos.privateKeyHex));
      expect(spyKeyStoreBip44).toHaveBeenCalledTimes(1);
      jest.clearAllMocks();
    });
    test('load private key with type private key err when Unexpected type of keyring', () => {
      Object.defineProperty(keyRing, 'status', {
        value: KeyRingStatus.UNLOCKED,
        writable: true
      });
      Object.defineProperty(keyRing, 'type', {
        value: 'invalid',
        writable: true
      });

      keyRing['keyStore'] = mockKeyStore.mnemonic.pbkdf2;
      const spyKeyStoreBip44 = jest
        .spyOn(KeyRing as any, 'getKeyStoreBIP44Path')
        .mockReturnValue(mockKeyStore.mnemonic.pbkdf2);
      expect(() => keyRing['loadPrivKey'](mockCoinType)).toThrow(
        'Unexpected type of keyring'
      );
      expect(spyKeyStoreBip44).toHaveBeenCalled();
      jest.clearAllMocks();
    });
  });
  describe('loadKey', () => {
    it('test case this.status !== KeyRingStatus.UNLOCKED', () => {
      Object.defineProperty(keyRing, 'status', {
        value: KeyRingStatus.LOCKED,
        writable: true
      });
      expect(() => keyRing['loadKey'](mockCoinType)).toThrow(
        'Key ring is not unlocked'
      );
    });
    it('test for case this.keyStore is null', () => {
      Object.defineProperty(keyRing, 'status', {
        value: KeyRingStatus.UNLOCKED,
        writable: true
      });
      expect(() => keyRing['loadKey'](mockCoinType)).not.toThrow(
        'Key ring is not unlocked'
      );
      expect(() => keyRing['loadKey'](mockCoinType)).toThrow(
        'Key Store is empty'
      );
    });
    describe('test for case this.keyStore.type === ledger', () => {
      it('test throw for this.ledgerPublicKey is null', () => {
        Object.defineProperty(keyRing, 'status', {
          value: KeyRingStatus.UNLOCKED,
          writable: true
        });
        keyRing['keyStore'] = mockKeyStore.ledger.pbkdf2;
        expect(() => keyRing['loadKey'](mockCoinType)).not.toThrow(
          'Key ring is not unlocked'
        );
        expect(() => keyRing['loadKey'](mockCoinType)).not.toThrow(
          'Key Store is empty'
        );
        expect(() => keyRing['loadKey'](mockCoinType)).toThrow(
          'Ledger public key not set'
        );
      });
      it('test case for ledgerPublicKey is not null', () => {
        Object.defineProperty(keyRing, 'status', {
          value: KeyRingStatus.UNLOCKED,
          writable: true
        });
        keyRing['keyStore'] = mockKeyStore.ledger.pbkdf2;
        keyRing['ledgerPublicKey'] = mockKeyCosmos.publicKeyHex;
        const rs = keyRing['loadKey'](mockCoinType);
        expect(Buffer.from(rs.pubKey).toString('hex')).toBe(
          '0407e5b99e7849b4c2f6af0ee7e7f094b8859f1109962ad6e94fa3672fc8003a301c28c6ba894f7a08c3ca761abf39285c46614d7d8727b1ecd67b2c33d1ee81c1'
        );
        expect(Buffer.from(rs.address).toString('hex')).toBe(
          'eb90d36cdb04b7a06b63e5736ac76cad7f3a112d'
        );
        expect(rs.algo).toBe('secp256k1');
        expect(rs.isNanoLedger).toBe(true);
      });
    });
  });
});
