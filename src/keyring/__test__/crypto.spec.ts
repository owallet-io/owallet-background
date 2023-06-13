import { RNG } from '@owallet/crypto';
import {
  mockBip44HDPath,
  mockCrypto,
  mockKdfExtension,
  mockKdfMobile,
  mockKeyCosmos,
  mockMeta,
  mockMetaHasId,
  mockPassword,
  mockRng
} from '../__mocks__/keyring';
import { Crypto, KeyStore } from '../crypto';
import { keyRing } from './keyring.spec';

describe('Crypto', () => {
  describe('encrypt', () => {
    //   const rngMock: RNG = jest.fn().mockResolvedValue(new Uint8Array());
    // const cryptoMock: CommonCrypto = {
    //   scrypt: jest.fn(),
    // };

    //   const defaultParams = {
    //     rng: mockRng,
    //     crypto: mockCrypto,
    //     kdf: 'scrypt',
    //     type: 'mnemonic',
    //     text: 'secret',
    //     password: 'password',
    //     meta: {},
    //   };

    afterEach(() => {
      jest.clearAllMocks();
    });
    const scryptSpy = jest.spyOn(mockCrypto, 'scrypt');
    const scryptParams = {
      salt: expect.any(String),
      dklen: 32,
      n: 131072,
      r: 8,
      p: 1
    };
    it('should encrypt with scrypt and return a KeyStore object', async () => {
      // Mock the scrypt function to return the derived key
      const metaHasId = await keyRing['assignKeyStoreIdMeta'](mockMeta);
      const result = await Crypto.encrypt(
        mockRng,
        mockCrypto,
        mockKdfExtension,
        'mnemonic',
        mockKeyCosmos.mnemonic,
        mockPassword,
        metaHasId,
        mockBip44HDPath
      );

      expect(mockRng).toHaveBeenCalled();
      expect(mockRng).toBeCalledTimes(2);
      expect(scryptSpy).toHaveBeenCalledWith(mockPassword, scryptParams);
      expect(result.version).toBe('1.2');
      expect(result.type).toBe('mnemonic');
      expect(result.coinTypeForChain).toEqual({});
      expect(result.bip44HDPath).toBe(mockBip44HDPath);
      expect(result.meta).toBe(metaHasId);
      expect(result.crypto.cipher).toBe('aes-128-ctr');
      expect(result.crypto.cipherparams.iv).toEqual(expect.any(String));
      expect(result.crypto.ciphertext).toEqual(expect.any(String));
      expect(result.crypto.kdf).toBe(mockKdfExtension);
      expect(result.crypto.kdfparams).toEqual(scryptParams);
      expect(result.crypto.mac).toEqual(expect.any(String));
      expect(result.addresses).toBe(undefined);
    });

    it('should encrypt with sha256 and return a KeyStore object', async () => {
      const metaHasId = await keyRing['assignKeyStoreIdMeta'](mockMeta);
      const result = await Crypto.encrypt(
        mockRng,
        mockCrypto,
        'sha256',
        'mnemonic',
        mockKeyCosmos.mnemonic,
        mockPassword,
        metaHasId,
        mockBip44HDPath
      );
      expect(mockRng).toHaveBeenCalled();
      expect(mockRng).toBeCalledTimes(2);
      expect(scryptSpy).not.toHaveBeenCalled();
      expect(result.version).toBe('1.2');
      expect(result.type).toBe('mnemonic');
      expect(result.coinTypeForChain).toEqual({});
      expect(result.bip44HDPath).toBe(mockBip44HDPath);
      expect(result.meta).toBe(metaHasId);
      expect(result.crypto.cipher).toBe('aes-128-ctr');
      expect(result.crypto.cipherparams.iv).toEqual(expect.any(String));
      expect(result.crypto.ciphertext).toEqual(expect.any(String));
      expect(result.crypto.kdf).toBe('sha256');
      expect(result.crypto.kdfparams).toEqual(scryptParams);
      expect(result.crypto.mac).toEqual(expect.any(String));
      expect(result.addresses).toBe(undefined);
    });

    it('should encrypt with pbkdf2 and return a KeyStore object', async () => {
      jest.clearAllMocks();
      const metaHasId = await keyRing['assignKeyStoreIdMeta'](mockMeta);
      const result = await Crypto.encrypt(
        mockRng,
        mockCrypto,
        mockKdfMobile,
        'mnemonic',
        mockKeyCosmos.mnemonic,
        mockPassword,
        metaHasId,
        mockBip44HDPath
      );
      expect(mockRng).toHaveBeenCalled();
      expect(mockRng).toBeCalledTimes(2);
      expect(scryptSpy).not.toHaveBeenCalled();
      expect(result.version).toBe('1.2');
      expect(result.type).toBe('mnemonic');
      expect(result.coinTypeForChain).toEqual({});
      expect(result.bip44HDPath).toBe(mockBip44HDPath);
      expect(result.meta).toBe(metaHasId);
      expect(result.crypto.cipher).toBe('aes-128-ctr');
      expect(result.crypto.cipherparams.iv).toEqual(expect.any(String));
      expect(result.crypto.ciphertext).toEqual(expect.any(String));
      expect(result.crypto.kdf).toBe(mockKdfMobile);
      expect(result.crypto.kdfparams).toEqual(scryptParams);
      expect(result.crypto.mac).toEqual(expect.any(String));
      expect(result.addresses).toBe(undefined);
    });
  });
});
