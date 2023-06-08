import { KVStore } from '@owallet/common';
import { Hash, RNG } from '@owallet/crypto';
import { BIP44HDPath } from '@owallet/background';
import { CommonCrypto, AddressesLedger, ScryptParams } from '../types';
import { KeyStore } from '../crypto';
import { Crypto } from '../crypto';
import {
  MockCreateMnemonicKeyStore,
  MockFnHelper
} from '../__mocks__/keyring';

describe('getIncrementalNumber', () => {
  test('should return the correct incremental number', async () => {
    // Mock kvStore
    const kvStore = {
      get: jest.fn().mockResolvedValue(undefined),
      set: jest.fn().mockResolvedValue(undefined)
    };

    // Tạo một đối tượng từ class chứa hàm getIncrementalNumber
    const obj = new MockFnHelper(kvStore);

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
      set: jest.fn().mockResolvedValue(undefined)
    };

    // Tạo một đối tượng từ class chứa hàm getIncrementalNumber
    const obj = new MockFnHelper(kvStore);

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
        set: jest.fn().mockResolvedValue(undefined)
      };
      // Object meta ban đầu
      // Tạo một đối tượng từ class chứa hàm getIncrementalNumber
    const mockAssignKey = new MockFnHelper(kvStore);
      const initialMeta = { key1: 'value1', key2: 'value2' };
      
      // Giá trị trả về từ getIncrementalNumber
      // const mockIncrementalNumber = 1;
      const mockIncrementalNumber = await mockAssignKey.getIncrementalNumber();
      console.log('mockIncrementalNumber: ', mockIncrementalNumber);
      // Mock implementation cho getIncrementalNumber
      jest.spyOn(mockAssignKey, 'getIncrementalNumber').mockResolvedValue(mockIncrementalNumber);
  
      // Gọi hàm assignKeyStoreIdMeta
      const result = await mockAssignKey.assignKeyStoreIdMeta(initialMeta);
  
      // Kiểm tra xem getIncrementalNumber đã được gọi
      expect(mockAssignKey.getIncrementalNumber).toHaveBeenCalled();
  
      // Kiểm tra xem kết quả trả về là đúng
      expect(result).toEqual({ ...initialMeta, __id__: mockIncrementalNumber.toString() });
    });
  });
});

describe('Crypto', () => {
  let keyStoreEncrypted: KeyStore;
  const scryptMock = jest.fn(
    async (text: string, params: ScryptParams) => new Uint8Array(params.dklen)
  );
  const cryptoMock: CommonCrypto = {
    scrypt: scryptMock
  };
  const rngMock = jest.fn(async (array) => array);
  const mockBip44HDPath: BIP44HDPath = undefined;
  const text = 'This is a test';
  const password = 'password';
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
    const mnemonic = 'example mnemonic';
    it('should call Crypto.encrypt with the correct arguments', async () => {
      // Chuỗi mnemonic và mật khẩu
      // Gọi hàm CreateMnemonicKeyStore
      const result = await MockCreateMnemonicKeyStore.CreateMnemonicKeyStore(
        rngMock,
        cryptoMock,
        'scrypt',
        mnemonic,
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
        mnemonic,
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
        mnemonic,
        password,
        meta,
        mockBip44HDPath
      );
      // Kiểm tra xem kết quả trả về là đúng
      expect(result).toEqual(mockEncryptedData);
    });
  });
});
