import { BIP44HDPath } from './../types';
import { CommonCrypto, AddressesLedger, ScryptParams } from '../types';
import { KeyStore } from '../crypto';
import { Crypto } from '../crypto';
import {
  MockCreateMnemonicKey,
  MockCreateMnemonicKeyStore,
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
const mockMnemonic = 'example mnemonic';
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
        .mockResolvedValue(mockMultiKeyStoreInfo);
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
