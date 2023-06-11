import { BIP44HDPath } from './../types';
import { CommonCrypto, AddressesLedger, ScryptParams } from '../types';
import { KeyStore } from '../crypto';
import { Crypto } from '../crypto';
import {
  MockCreateLedgerKey,
  MockCreateLedgerKeyStore,
  MockCreateMnemonicKey,
  MockCreateMnemonicKeyStore,
  MockCreatePrivateKey,
  MockCreatePrivateKeyStore,
  MockFnHelper,
  MockIsLocked,
  MockMultiKeyStore,
  MockSave,
  MockStatus
} from '../__mocks__/keyring';
// import { KeyMultiStoreKey, KeyRingStatus, KeyStoreKey } from '../keyring';
import {
  KeyRingStatus,
  KeyStoreKey,
  KeyMultiStoreKey
} from '../__mocks__/types';
import { Env } from '@owallet/router';
const mockMnemonic = 'example mnemonic';
const mockPrivateKey =
  '4c985e1bb3d14094ca13e3f69d49f2e28cdef6c49b71a27ab1eecf6b0d8c4f71';
const mockPublicKey =
  '0407e5b99e7849b4c2f6af0ee7e7f094b8859f1109962ad6e94fa3672fc8003a301c28c6ba894f7a08c3ca761abf39285c46614d7d8727b1ecd67b2c33d1ee81c1';
const mockAddress = '0xD906B8F9FE7DCFBDFFC13451BBFC8DAAFFA988C7';

const mockPrivateKeyHex = Buffer.from(mockPrivateKey, 'hex');
const mockPublicKeyHex = Buffer.from(mockPublicKey, 'hex');
const mockPassword = 'password';
const mockMeta = { name: 'orai' };
const scryptMock = jest.fn(
  async (text: string, params: ScryptParams) => new Uint8Array(params.dklen)
);
const cryptoMock: CommonCrypto = {
  scrypt: scryptMock
};
const rngMock = jest.fn(async (array) => array);
const mockMultiKeyStoreInfo = [
  {
    version: '1.2',
    type: 'mnemonic',
    addresses: undefined,
    meta: { key: 'value', __id__: '12345' },
    coinTypeForChain: {},
    bip44HDPath: undefined,
    selected: true
  },
  {
    version: '1.2',
    type: 'mnemonic',
    addresses: undefined,
    meta: { key: 'value', __id__: '1111' },
    coinTypeForChain: {},
    bip44HDPath: undefined,
    selected: false
  }
];
const mockBip44HDPath: BIP44HDPath = undefined;
describe('getIncrementalNumber', () => {
  test('should return the correct incremental number', async () => {
    // Mock kvStore
    const kvStore = {
      get: jest.fn().mockResolvedValue(undefined),
      set: jest.fn().mockResolvedValue(undefined),
      prefix: jest.fn().mockReturnValue('')
    };

    // Tạo một đối tượng từ class chứa hàm getIncrementalNumber
    const obj = new MockFnHelper();
    obj['kvStore'] = kvStore;
    // Gọi hàm getIncrementalNumber và kiểm tra kết quả
    const result = await obj.getIncrementalNumber();

    // Kiểm tra kết quả trả về
    expect(result).toBe(1);

    // Kiểm tra các mock function được gọi đúng số lần và với đúng đối số
    expect(kvStore.get).toHaveBeenCalledTimes(1);
    expect(kvStore.get).toHaveBeenCalledWith('incrementalNumber');
    expect(kvStore.set).toHaveBeenCalledTimes(1);
    expect(kvStore.set).toHaveBeenCalledWith('incrementalNumber', 1);
  });

  test('should return the correct incremental number when it already exists', async () => {
    // Mock kvStore
    const kvStore = {
      get: jest.fn().mockResolvedValue(5),
      set: jest.fn().mockResolvedValue(undefined),
      prefix: jest.fn().mockReturnValue('')
    };

    // Tạo một đối tượng từ class chứa hàm getIncrementalNumber

    // Tạo một đối tượng từ class chứa hàm getIncrementalNumber
    const obj = new MockFnHelper();
    obj['kvStore'] = kvStore;
    // Gọi hàm getIncrementalNumber và kiểm tra kết quả
    const result = await obj.getIncrementalNumber();

    // Kiểm tra kết quả trả về
    expect(result).toBe(6);

    // Kiểm tra các mock function được gọi đúng số lần và với đúng đối số
    expect(kvStore.get).toHaveBeenCalledTimes(1);
    expect(kvStore.get).toHaveBeenCalledWith('incrementalNumber');
    expect(kvStore.set).toHaveBeenCalledTimes(1);
    expect(kvStore.set).toHaveBeenCalledWith('incrementalNumber', 6);
  });

  describe('assignKeyStoreIdMeta', () => {
    test('should call getIncrementalNumber and return the modified meta object', async () => {
      const kvStore = {
        get: jest.fn().mockResolvedValue(0),
        set: jest.fn().mockResolvedValue(undefined),
        prefix: jest.fn().mockReturnValue('')
      };
      // Object meta ban đầu
      // Tạo một đối tượng từ class chứa hàm getIncrementalNumber
      const mockAssignKey = new MockFnHelper();
      const initialMeta = { key1: 'value1', key2: 'value2' };
      mockAssignKey['kvStore'] = kvStore;
      // Giá trị trả về từ getIncrementalNumber
      // const mockIncrementalNumber = 1;
      const mockIncrementalNumber = await mockAssignKey.getIncrementalNumber();
      console.log('mockIncrementalNumber: ', mockIncrementalNumber);
      // Mock implementation cho getIncrementalNumber
      jest
        .spyOn(mockAssignKey, 'getIncrementalNumber')
        .mockResolvedValue(mockIncrementalNumber);

      // Gọi hàm assignKeyStoreIdMeta
      const result = await mockAssignKey.assignKeyStoreIdMeta(initialMeta);
      console.log('mockAssignKey: ', result);

      // Kiểm tra xem getIncrementalNumber đã được gọi
      expect(mockAssignKey.getIncrementalNumber).toHaveBeenCalled();

      // Kiểm tra xem kết quả trả về là đúng
      expect(result).toEqual({
        ...initialMeta,
        __id__: mockIncrementalNumber.toString()
      });
    });
  });
});
describe('getKeyStoreId', () => {
  const keyStore: KeyStore = {
    version: '1.2',
    type: 'mnemonic',
    coinTypeForChain: {},
    bip44HDPath: undefined,
    meta: { key: 'value', __id__: '12345' },
    crypto: {
      cipher: 'aes-128-ctr',
      cipherparams: { iv: '00000000000000000000000000000000' },
      ciphertext: 'b9eda115d22ceca9c026c779fdea49e4',
      kdf: 'scrypt',
      kdfparams: {
        salt: '0000000000000000000000000000000000000000000000000000000000000000',
        dklen: 32,
        n: 131072,
        r: 8,
        p: 1
      },
      mac: '349eb4397e0a2b2394a85bfb7340b9dd46ca5d5502733fd364ccce56c3528363'
    },
    addresses: undefined
  };
  it('should return the id of the key store if it exists', () => {
    const result = MockFnHelper.getKeyStoreId(keyStore);

    expect(result).toBe('12345');
  });

  it('should throw an error if the key store id is empty', () => {
    const keyStoreMock: KeyStore = {
      ...keyStore,
      meta: {
        __id__: ''
      }
    };

    expect(() => MockFnHelper.getKeyStoreId(keyStoreMock)).toThrow(
      "Key store's id is empty"
    );
  });

  it('should throw an error if the key store id is undefined', () => {
    const keyStoreMock: KeyStore = {
      ...keyStore,
      meta: {
        __id__: undefined
      }
    };

    expect(() => MockFnHelper.getKeyStoreId(keyStoreMock)).toThrow(
      "Key store's id is empty"
    );
  });
});
const mockMultiKeyStore: KeyStore[] = [
  {
    version: '1.2',
    type: 'mnemonic',
    coinTypeForChain: {},
    bip44HDPath: undefined,
    meta: { key: 'value', __id__: '12345' },
    crypto: {
      cipher: 'aes-128-ctr',
      cipherparams: { iv: '00000000000000000000000000000000' },
      ciphertext: 'b9eda115d22ceca9c026c779fdea49e4',
      kdf: 'scrypt',
      kdfparams: {
        salt: '0000000000000000000000000000000000000000000000000000000000000000',
        dklen: 32,
        n: 131072,
        r: 8,
        p: 1
      },
      mac: '349eb4397e0a2b2394a85bfb7340b9dd46ca5d5502733fd364ccce56c3528363'
    },
    addresses: undefined
  },
  {
    version: '1.2',
    type: 'mnemonic',
    coinTypeForChain: {},
    bip44HDPath: undefined,
    meta: { key: 'value', __id__: '1111' },
    crypto: {
      cipher: 'aes-128-ctr',
      cipherparams: { iv: '00000000000000000000000000000000' },
      ciphertext: 'b9eda115d22ceca9c026c779fdea49e4',
      kdf: 'scrypt',
      kdfparams: {
        salt: '0000000000000000000000000000000000000000000000000000000000000000',
        dklen: 32,
        n: 131072,
        r: 8,
        p: 1
      },
      mac: '349eb4397e0a2b2394a85bfb7340b9dd46ca5d5502733fd364ccce56c3528363'
    },
    addresses: undefined
  }
];
const mockKeyStore: KeyStore = {
  version: '1.2',
  type: 'mnemonic',
  coinTypeForChain: {},
  bip44HDPath: undefined,
  meta: { key: 'value', __id__: '12345' },
  crypto: {
    cipher: 'aes-128-ctr',
    cipherparams: { iv: '00000000000000000000000000000000' },
    ciphertext: 'b9eda115d22ceca9c026c779fdea49e4',
    kdf: 'scrypt',
    kdfparams: {
      salt: '0000000000000000000000000000000000000000000000000000000000000000',
      dklen: 32,
      n: 131072,
      r: 8,
      p: 1
    },
    mac: '349eb4397e0a2b2394a85bfb7340b9dd46ca5d5502733fd364ccce56c3528363'
  },
  addresses: undefined
};
describe('MockMultiKeyStore', () => {
  describe('getMultiKeyStoreInfo', () => {
    it('should return the correct multiKeyStoreInfo', () => {
      // Tạo instance của lớp MockMultiKeyStore
      const instance = new MockMultiKeyStore();
      // Mock multiKeyStore

      instance.multiKeyStore = mockMultiKeyStore;
      // Mock keyStore

      instance.keyStore = mockKeyStore;
      // Gọi phương thức getMultiKeyStoreInfo()
      const result = instance.getMultiKeyStoreInfo();

      // Kiểm tra kết quả
      expect(result).toEqual(mockMultiKeyStoreInfo);
    });
  });
});
describe('Keyring', () => {
  let keyStoreEncrypted: KeyStore;

  const text = 'This is a test';
  const password = mockPassword;
  const meta = { key: 'value' };
  describe('encrypt', () => {
    // Mock implementation cho các dependencies

    beforeEach(() => {
      rngMock.mockClear();
      scryptMock.mockClear();
    });

    test('should encrypt using scrypt', async () => {
      const kdf = 'scrypt';
      const type = 'mnemonic';
      const addresses: AddressesLedger = { cosmos: 'cosmos-address' };

      const result = await Crypto.encrypt(
        rngMock,
        cryptoMock,
        kdf,
        type,
        text,
        password,
        meta,
        mockBip44HDPath,
        addresses
      );
      // console.log('result: ', result);
      keyStoreEncrypted = result;
      expect(rngMock).toHaveBeenCalledTimes(2);
      expect(scryptMock).toHaveBeenCalledTimes(1);

      expect(result.version).toBe('1.2');
      expect(result.type).toBe(type);
      expect(result.coinTypeForChain).toEqual({});
      expect(result.bip44HDPath).toBeUndefined();
      expect(result.meta).toEqual(meta);
      expect(result.crypto.cipher).toBe('aes-128-ctr');
      expect(result.crypto.kdf).toBe(kdf);
      expect(result.addresses).toEqual(addresses);
    });

    test('should encrypt using sha256', async () => {
      const kdf = 'sha256';
      const type = 'privateKey';

      const result = await Crypto.encrypt(
        rngMock,
        cryptoMock,
        kdf,
        type,
        text,
        password,
        meta
      );

      expect(rngMock).toHaveBeenCalledTimes(2);
      expect(scryptMock).not.toHaveBeenCalled();

      expect(result.version).toBe('1.2');
      expect(result.type).toBe(type);
      expect(result.coinTypeForChain).toEqual({});
      expect(result.bip44HDPath).toBeUndefined();
      expect(result.meta).toEqual(meta);
      expect(result.crypto.cipher).toBe('aes-128-ctr');
      expect(result.crypto.kdf).toBe(kdf);
      expect(result.addresses).toBeUndefined();
    });

    test('should encrypt using pbkdf2', async () => {
      const kdf = 'pbkdf2';
      const type = 'ledger';

      const result = await Crypto.encrypt(
        rngMock,
        cryptoMock,
        kdf,
        type,
        text,
        password,
        meta
      );

      expect(rngMock).toHaveBeenCalledTimes(2);
      expect(scryptMock).not.toHaveBeenCalled();
      // expect(sha256Mock).not.toHaveBeenCalled();
      // expect(pbkdf2Mock).toHaveBeenCalledTimes(1);

      // Kiểm tra giá trị trả về
      expect(result.version).toBe('1.2');
      expect(result.type).toBe(type);
      expect(result.coinTypeForChain).toEqual({});
      expect(result.bip44HDPath).toBeUndefined();
      expect(result.meta).toEqual(meta);
      expect(result.crypto.cipher).toBe('aes-128-ctr');
      expect(result.crypto.kdf).toBe(kdf);
      expect(result.addresses).toBeUndefined();
    });
  });
  describe('decrypt', () => {
    test('should decrypt data correctly', async () => {
      const keyStore: KeyStore = keyStoreEncrypted;
      // Gọi hàm decrypt và kiểm tra kết quả
      const result = await Crypto.decrypt(cryptoMock, keyStore, password);
      // Kiểm tra kết quả trả về
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.toString()).toEqual(text);
      // Thêm các kiểm tra khác tùy thuộc vào logic decrypt

      // Kiểm tra các mock function được gọi đúng số lần và với đúng đối số
      expect(cryptoMock.scrypt).toHaveBeenCalledTimes(1);
      expect(cryptoMock.scrypt).toHaveBeenCalledWith(
        password,
        keyStore.crypto.kdfparams
      );
    });
  });

  describe('CreateMnemonicKeyStore', () => {
    jest.spyOn(Crypto, 'encrypt');

    it('should call Crypto.encrypt with the correct arguments', async () => {
      // Chuỗi mnemonic và mật khẩu
      // Gọi hàm CreateMnemonicKeyStore
      const result = await MockCreateMnemonicKeyStore.CreateMnemonicKeyStore(
        rngMock,
        cryptoMock,
        'scrypt',
        mockMnemonic,
        password,
        meta,
        mockBip44HDPath
      );
      // console.log('result: ', result);

      // Kiểm tra xem Crypto.encrypt đã được gọi với đúng các tham số
      expect(Crypto.encrypt).toHaveBeenCalledWith(
        rngMock,
        cryptoMock,
        'scrypt',
        'mnemonic',
        mockMnemonic,
        password,
        meta,
        mockBip44HDPath
      );
    });

    it('should return the result from Crypto.encrypt', async () => {
      // Kết quả trả về từ Crypto.encrypt
      const mockEncryptedData: KeyStore = {
        version: '1.2',
        type: 'mnemonic',
        coinTypeForChain: {},
        bip44HDPath: undefined,
        meta: { key: 'value' },
        crypto: {
          cipher: 'aes-128-ctr',
          cipherparams: { iv: '00000000000000000000000000000000' },
          ciphertext: 'b9eda115d22ceca9c026c779fdea49e4',
          kdf: 'scrypt',
          kdfparams: {
            salt: '0000000000000000000000000000000000000000000000000000000000000000',
            dklen: 32,
            n: 131072,
            r: 8,
            p: 1
          },
          mac: '349eb4397e0a2b2394a85bfb7340b9dd46ca5d5502733fd364ccce56c3528363'
        },
        addresses: undefined
      };

      // Gọi hàm CreateMnemonicKeyStore
      const result = await MockCreateMnemonicKeyStore.CreateMnemonicKeyStore(
        rngMock,
        cryptoMock,
        'scrypt',
        mockMnemonic,
        password,
        meta,
        mockBip44HDPath
      );
      // Kiểm tra xem kết quả trả về là đúng
      expect(result).toEqual(mockEncryptedData);
    });
  });
  describe('CreateLedgerKeyStore', () => {
    beforeEach(() => {
      jest.spyOn(Crypto, 'encrypt').mockClear();
    });

    it('should call Crypto.encrypt with the correct arguments', async () => {
      // Chuỗi mnemonic và mật khẩu
      // Gọi hàm CreateMnemonicKeyStore
      const result = await MockCreateLedgerKeyStore.CreateLedgerKeyStore(
        rngMock,
        cryptoMock,
        'scrypt',
        mockPublicKeyHex,
        password,
        meta,
        mockBip44HDPath,
        {
          cosmos: mockAddress
        }
      );
      // console.log('result: ', result);

      // Kiểm tra xem Crypto.encrypt đã được gọi với đúng các tham số
      expect(Crypto.encrypt).toHaveBeenCalledWith(
        rngMock,
        cryptoMock,
        'scrypt',
        'ledger',
        Buffer.from(mockPublicKeyHex).toString('hex'),
        password,
        meta,
        mockBip44HDPath,
        {
          cosmos: mockAddress
        }
      );
    });

    it('should return the result from Crypto.encrypt', async () => {
      // Kết quả trả về từ Crypto.encrypt
      const mockEncryptedData: KeyStore = {
        version: '1.2',
        type: 'ledger',
        coinTypeForChain: {},
        bip44HDPath: undefined,
        meta: { key: 'value' },
        crypto: {
          cipher: 'aes-128-ctr',
          cipherparams: { iv: '00000000000000000000000000000000' },
          ciphertext:
            'eca1f04fc775ebb0942d952ca6bd42b3303deccda62306dccc54d1c6a2fb4abfac9f780874065a5f3777fce58892f92e175937ac56951c43e3c496b6453606efee7a804b7f72824d2389611d736a01967779a8d2e2da4806501d7f8598350827e5a7bb451799195357f194d773a60591d9cc2d86f7ac944ed58f7857313b259cc8cb',
          kdf: 'scrypt',
          kdfparams: {
            salt: '0000000000000000000000000000000000000000000000000000000000000000',
            dklen: 32,
            n: 131072,
            r: 8,
            p: 1
          },
          mac: 'ae30e52b59b97e8b078a6771983a3bc9686e968c776e6e504bde5470e83f0901'
        },
        addresses: undefined
      };

      // Gọi hàm CreateMnemonicKeyStore
      const result = await MockCreateLedgerKeyStore.CreateLedgerKeyStore(
        rngMock,
        cryptoMock,
        'scrypt',
        mockPublicKeyHex,
        password,
        meta,
        mockBip44HDPath
      );
      // Kiểm tra xem kết quả trả về là đúng
      expect(result).toEqual(mockEncryptedData);
    });
  });
  describe('CreatePrivateKeyStore', () => {
    beforeEach(() => {
      jest.spyOn(Crypto, 'encrypt').mockClear();
    });
    it('should call Crypto.encrypt with the correct arguments', async () => {
      // Chuỗi mnemonic và mật khẩu
      // Gọi hàm CreateMnemonicKeyStore
      const result = await MockCreatePrivateKeyStore.CreatePrivateKeyStore(
        rngMock,
        cryptoMock,
        'scrypt',
        mockPrivateKeyHex,
        password,
        meta
      );
      console.log('result: ', result);

      // Kiểm tra xem Crypto.encrypt đã được gọi với đúng các tham số
      expect(Crypto.encrypt).toHaveBeenCalledWith(
        rngMock,
        cryptoMock,
        'scrypt',
        'privateKey',
        Buffer.from(mockPrivateKeyHex).toString('hex'),
        password,
        meta
      );
    });

    it('should return the result from Crypto.encrypt', async () => {
      // Kết quả trả về từ Crypto.encrypt
      const mockEncryptedData: KeyStore = {
        version: '1.2',
        type: 'privateKey',
        coinTypeForChain: {},
        bip44HDPath: undefined,
        meta: { key: 'value' },
        crypto: {
          cipher: 'aes-128-ctr',
          cipherparams: { iv: '00000000000000000000000000000000' },
          ciphertext:
            'e8f6f9409725b8ebcf7bc625a6b419b3306ebbc8a276508f900780c8a2f916b9f6c424582b56085a3e2cf2e2dbc1aa79105166af54c01c16e1c6cded416002bf',
          kdf: 'scrypt',
          kdfparams: {
            salt: '0000000000000000000000000000000000000000000000000000000000000000',
            dklen: 32,
            n: 131072,
            r: 8,
            p: 1
          },
          mac: '5fb2bc5b7f626f23e6a1fb324942a03fe4d56650a51741495d08dc85909ae7e4'
        },
        addresses: undefined
      };

      // Gọi hàm CreateMnemonicKeyStore
      const result = await MockCreatePrivateKeyStore.CreatePrivateKeyStore(
        rngMock,
        cryptoMock,
        'scrypt',
        mockPrivateKeyHex,
        password,
        meta
      );
      // Kiểm tra xem kết quả trả về là đúng
      expect(result).toEqual(mockEncryptedData);
    });
  });
});
describe('save', () => {
  it('should save keyStore and multiKeyStore', async () => {
    // Tạo instance của lớp keyring

    const instance = new MockSave();

    // Mock kvStore

    const mockKvStore = {
      get: jest.fn().mockResolvedValue(10),
      set: jest.fn().mockResolvedValue(true),
      prefix: jest.fn().mockReturnValue('keyring')
    };
    instance.kvStore = mockKvStore;

    // Mock keyStore và multiKeyStore
    // const mockKeyStore = { version: 1, type: 'type1' };
    // const mockMultiKeyStore = [{ version: 2, type: 'type2' }];
    instance.keyStore = mockKeyStore;
    instance.multiKeyStore = mockMultiKeyStore;

    // Gọi phương thức save()
    await instance.save();

    // Kiểm tra việc gọi kvStore.set với đúng đối số
    expect(mockKvStore.set).toHaveBeenCalledTimes(2);
    expect(mockKvStore.set).toHaveBeenCalledWith(KeyStoreKey, mockKeyStore);
    expect(mockKvStore.set).toHaveBeenCalledWith(
      KeyMultiStoreKey,
      mockMultiKeyStore
    );
  });
});
describe('MockIsLocked', () => {
  describe('isLocked', () => {
    it('should return true when privateKey, mnemonic, and ledgerPublicKey are null or undefined', () => {
      // Tạo instance của lớp MockIsLocked
      const instance = new MockIsLocked();

      // Gán giá trị null/undefined cho các thuộc tính
      instance.privateKey = null;
      instance.mnemonic = undefined;
      instance.ledgerPublicKey = null;

      // Gọi phương thức isLocked()
      const result = instance.isLocked();

      // Kiểm tra kết quả
      expect(result).toBe(true);
    });

    it('should return false when at least one of privateKey, mnemonic, or ledgerPublicKey has a value', () => {
      // Tạo instance của lớp MockIsLocked
      const instance = new MockIsLocked();

      // Gán giá trị cho một trong các thuộc tính
      instance.privateKey = new Uint8Array();
      instance.mnemonic = 'mock mnemonic';
      instance.ledgerPublicKey = new Uint8Array();

      // Gọi phương thức isLocked()
      const result = instance.isLocked();

      // Kiểm tra kết quả
      expect(result).toBe(false);
    });
  });
});

describe('MockStatus', () => {
  describe('status', () => {
    it('should return KeyRingStatus.NOTLOADED when loaded is false', () => {
      // Tạo instance của lớp MockStatus
      const instance = new MockStatus();

      // Gán giá trị false cho thuộc tính loaded
      instance.loaded = false;

      // Gọi phương thức status
      const result = instance.status;

      // Kiểm tra kết quả
      expect(result).toBe(KeyRingStatus.NOTLOADED);
    });

    it('should return KeyRingStatus.EMPTY when keyStore is null', () => {
      // Tạo instance của lớp MockStatus
      const instance = new MockStatus();

      // Gán giá trị null cho thuộc tính keyStore
      instance.keyStore = null;
      instance.loaded = true;

      // Gọi phương thức status
      const result = instance.status;

      // Kiểm tra kết quả
      expect(result).toBe(KeyRingStatus.EMPTY);
    });

    it('should return KeyRingStatus.UNLOCKED when MockStatus.isLocked() returns false', () => {
      // Tạo instance của lớp MockStatus
      const instance = new MockStatus();

      // Gán giá trị true cho thuộc tính loaded
      instance.loaded = true;
      instance.keyStore = mockKeyStore;
      // Mock MockIsLocked.isLocked() để trả về false
      jest.spyOn(MockStatus.prototype, 'isLocked').mockReturnValue(false);

      // Gọi phương thức status
      const result = instance.status;

      // Kiểm tra kết quả
      expect(result).toBe(KeyRingStatus.UNLOCKED);
    });

    it('should return KeyRingStatus.LOCKED when all conditions are false', () => {
      // Tạo instance của lớp MockStatus
      const instance = new MockStatus();
      instance.keyStore = mockKeyStore;
      // Gán giá trị true cho thuộc tính loaded
      instance.loaded = true;

      // Mock MockIsLocked.isLocked() để trả về true
      jest.spyOn(MockStatus.prototype, 'isLocked').mockReturnValue(true);

      // Gọi phương thức status
      const result = instance.status;

      // Kiểm tra kết quả
      expect(result).toBe(KeyRingStatus.LOCKED);
    });
  });
});
describe('MockCreateMnemonicKey', () => {
  describe('createMnemonicKey', () => {
    it('should create mnemonic key and update keyStore and multiKeyStore', async () => {
      // Tạo instance của lớp MockCreateMnemonicKey
      const instance = new MockCreateMnemonicKey();
      // Gán giá trị cho các thuộc tính
      instance.mnemonic = null;
      instance.keyStore = null;
      instance.multiKeyStore = mockMultiKeyStore;
      instance.rng = rngMock;
      instance.crypto = cryptoMock;
      // Mock các phương thức liên quan
      jest
        .spyOn(instance, 'CreateMnemonicKeyStore')
        .mockResolvedValue(mockKeyStore);
      jest
        .spyOn(instance, 'getMultiKeyStoreInfo')
        .mockReturnValue(mockMultiKeyStoreInfo);
      jest
        .spyOn(instance, 'assignKeyStoreIdMeta')
        .mockResolvedValue({ name: 'orai', __id__: '1' });
      jest.spyOn(instance, 'save').mockResolvedValue(true);

      // Gọi phương thức createMnemonicKey()
      const result = await instance.createMnemonicKey(
        'scrypt',
        mockMnemonic,
        mockPassword,
        mockMeta,
        mockBip44HDPath
      );

      // Kiểm tra kết quả
      expect(result.status).toBe(KeyRingStatus.UNLOCKED);
      expect(result.multiKeyStoreInfo).toEqual(mockMultiKeyStoreInfo);
      expect(instance.mnemonic).toBe(mockMnemonic);
      expect(instance.keyStore).toBe(mockKeyStore);
      expect(instance.password).toBe(mockPassword);
      // expect(instance.multiKeyStore).toEqual(mockMultiKeyStore);
      expect(instance.CreateMnemonicKeyStore).toHaveBeenCalledWith(
        instance.rng,
        instance.crypto,
        'scrypt',
        mockMnemonic,
        mockPassword,
        await instance.assignKeyStoreIdMeta(mockMeta),
        mockBip44HDPath
      );
      expect(instance.assignKeyStoreIdMeta).toHaveBeenCalled();
      expect(instance.save).toHaveBeenCalled();
    });
  });
});

describe('MockCreatePrivateKey', () => {
  describe('createPrivateKey', () => {
    it('should create private key and update keyStore and multiKeyStore', async () => {
      // Tạo instance của lớp MockCreatePrivateKey
      const instance = new MockCreatePrivateKey();
      // Gán giá trị cho các thuộc tính
      instance.privateKey = null;
      instance.keyStore = null;
      instance.multiKeyStore = mockMultiKeyStore;
      instance.rng = rngMock;
      instance.crypto = cryptoMock;
      // Mock các phương thức liên quan
      jest
        .spyOn(instance, 'CreatePrivateKeyStore')
        .mockResolvedValue(mockKeyStore);
      jest
        .spyOn(instance, 'getMultiKeyStoreInfo')
        .mockReturnValue(mockMultiKeyStoreInfo);
      jest
        .spyOn(instance, 'assignKeyStoreIdMeta')
        .mockResolvedValue({ name: 'orai', __id__: '1' });
      jest.spyOn(instance, 'save').mockResolvedValue(true);

      // Gọi phương thức createMnemonicKey()
      const result = await instance.createPrivateKey(
        'scrypt',
        mockPrivateKeyHex,
        mockPassword,
        mockMeta
      );

      // Kiểm tra kết quả
      expect(result.status).toBe(KeyRingStatus.UNLOCKED);
      expect(result.multiKeyStoreInfo).toEqual(mockMultiKeyStoreInfo);
      expect(instance.privateKey).toBe(mockPrivateKeyHex);
      expect(instance.keyStore).toBe(mockKeyStore);
      expect(instance.password).toBe(mockPassword);
      // expect(instance.multiKeyStore).toEqual(mockMultiKeyStore);
      expect(instance.CreatePrivateKeyStore).toHaveBeenCalledWith(
        instance.rng,
        instance.crypto,
        'scrypt',
        mockPrivateKeyHex,
        mockPassword,
        await instance.assignKeyStoreIdMeta(mockMeta)
      );
      expect(instance.assignKeyStoreIdMeta).toHaveBeenCalled();
      expect(instance.save).toHaveBeenCalled();
    });
  });
});

describe('MockCreateLedgerKey', () => {
  const mockNetworkTypeByBip44HDPath = 'cosmos';
  describe('createLedgerKey', () => {
    it('should create ledger key and update keyStore and multiKeyStore', async () => {
      // Tạo instance của lớp MockCreateLedgerKey
      const instance = new MockCreateLedgerKey();
      // Gán giá trị cho các thuộc tính
      instance.ledgerPublicKey = null;
      instance.keyStore = null;
      instance.multiKeyStore = mockMultiKeyStore;
      instance.rng = rngMock;
      instance.crypto = cryptoMock;
      instance.ledgerKeeper = {
        getPublicKey: jest.fn().mockResolvedValue({
          publicKey: mockPublicKeyHex,
          address: mockAddress
        })
      };

      // Mock các phương thức liên quan
      jest
        .spyOn(instance, 'CreateLedgerKeyStore')
        .mockResolvedValue(mockKeyStore);
      jest
        .spyOn(instance, 'getNetworkTypeByBip44HDPath')
        .mockReturnValue(mockNetworkTypeByBip44HDPath);
      jest
        .spyOn(instance, 'getMultiKeyStoreInfo')
        .mockReturnValue(mockMultiKeyStoreInfo);
      jest
        .spyOn(instance, 'assignKeyStoreIdMeta')
        .mockResolvedValue({ name: 'orai', __id__: '1' });
      jest.spyOn(instance, 'save').mockResolvedValue(true);
      const mockEnv: Env = {
        isInternalMsg: false,
        requestInteraction: jest.fn()
      };
      // Gọi phương thức createMnemonicKey()
      const result = await instance.createLedgerKey(
        mockEnv,
        'scrypt',
        mockPassword,
        mockMeta,
        mockBip44HDPath
      );

      // Kiểm tra kết quả
      expect(result.status).toBe(KeyRingStatus.UNLOCKED);
      expect(result.multiKeyStoreInfo).toEqual(mockMultiKeyStoreInfo);
      expect(instance.ledgerPublicKey).toBe(mockPublicKeyHex);
      expect(instance.keyStore).toBe(mockKeyStore);
      expect(instance.password).toBe(mockPassword);
      // expect(instance.multiKeyStore).toEqual(mockMultiKeyStore);
      expect(instance.CreateLedgerKeyStore).toHaveBeenCalledWith(
        instance.rng,
        instance.crypto,
        'scrypt',
        mockPublicKeyHex,
        mockPassword,
        await instance.assignKeyStoreIdMeta(mockMeta),
        mockBip44HDPath,
        {
          [mockNetworkTypeByBip44HDPath]: mockAddress
        }
      );
      expect(instance.assignKeyStoreIdMeta).toHaveBeenCalled();
      expect(instance.save).toHaveBeenCalled();
      expect(instance.getNetworkTypeByBip44HDPath).toHaveBeenCalled();
      expect(instance.ledgerKeeper.getPublicKey).toHaveBeenCalled();
    });
  });
});
