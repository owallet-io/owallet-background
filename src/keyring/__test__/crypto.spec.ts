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

    it('should encrypt with scrypt and return a KeyStore object', async () => {
      // Mock the scrypt function to return the derived key
      const metaHasId = await keyRing['assignKeyStoreIdMeta'](mockMeta);
      const scryptParams = {
        salt: expect.any(String),
        dklen: 32,
        n: 131072,
        r: 8,
        p: 1
      };
      const scryptSpy = jest.spyOn(mockCrypto, 'scrypt');
      // const scryptSpy = jest.spyOn(mockRng);
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

    // it('should encrypt with sha256 and return a KeyStore object', async () => {
    //   const expectedKeyStore: KeyStore = {
    //     version: '1.2',
    //     type: 'mnemonic',
    //     coinTypeForChain: {},
    //     bip44HDPath: undefined,
    //     meta: {},
    //     crypto: {
    //       cipher: 'aes-128-ctr',
    //       cipherparams: {
    //         iv: '00000000000000000000000000000000',
    //       },
    //       ciphertext: 'abcdef1234567890',
    //       kdf: 'sha256',
    //       kdfparams: {
    //         salt: 'abcdef',
    //         dklen: 32,
    //         n: 131072,
    //         r: 8,
    //         p: 1,
    //       },
    //       mac: 'abcdef1234567890abcdef1234567890',
    //     },
    //     addresses: undefined,
    //   };

    //   const result = await encrypt({ ...defaultParams, kdf: 'sha256' });

    //   expect(cryptoMock.scrypt).not.toHaveBeenCalled();

    //   expect(result).toEqual(expectedKeyStore);
    // });

    // it('should encrypt with pbkdf2 and return a KeyStore object', async () => {
    //   // Mock the pbkdf2 function to return the derived key
    //   const derivedKey = new Uint8Array(32);
    //   const pbkdf2Mock = jest.fn().mockImplementationOnce((_, __, ___, ____, _____, callback) => {
    //     callback(null, derivedKey);
    //   });
    //   jest.mock('pbkdf2', () => ({
    //     pbkdf2: pbkdf2Mock,
    //   }));

    //   const expectedKeyStore: KeyStore = {
    //     version: '1.2',
    //     type: 'mnemonic',
    //     coinTypeForChain: {},
    //     bip44HDPath: undefined,
    //     meta: {},
    //     crypto: {
    //       cipher: 'aes-128-ctr',
    //       cipherparams: {
    //         iv: '00000000000000000000000000000000',
    //       },
    //       ciphertext: 'abcdef1234567890',
    //       kdf: 'pbkdf2',
    //       kdfparams: {
    //         salt: 'abcdef',
    //         dklen: 32,
    //         n: 131072,
    //         r: 8,
    //         p: 1,
    //       },
    //       mac: 'abcdef1234567890abcdef1234567890',
    //     },
    //     addresses: undefined,
    //   };

    //   const result = await encrypt({ ...defaultParams, kdf: 'pbkdf2' });

    //   expect(pbkdf2Mock).toHaveBeenCalledWith(
    //     'password',
    //     'abcdef',
    //     4000,
    //     32,
    //     'sha256',
    //     expect.any(Function)
    //   );

    //   expect(result).toEqual(expectedKeyStore);
    // });
  });
});
