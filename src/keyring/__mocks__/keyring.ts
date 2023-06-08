import { KVStore } from '@owallet/common';
import { RNG } from '@owallet/crypto';
import { BIP44HDPath, CommonCrypto } from '../types';
import { Crypto, KeyStore } from '../crypto';


export class MockCreateMnemonicKeyStore {
    static async CreateMnemonicKeyStore(
        rng: RNG,
        crypto: CommonCrypto,
        kdf: 'scrypt' | 'sha256' | 'pbkdf2',
        mnemonic: string,
        password: string,
        meta: Record<string, string>,
        bip44HDPath: BIP44HDPath
      ): Promise<KeyStore> {
        return await Crypto.encrypt(
          rng,
          crypto,
          kdf,
          'mnemonic',
          mnemonic,
          password,
          meta,
          bip44HDPath
        );
      }
}
export class MockFnHelper {
  private readonly kvStore: KVStore;
  constructor(kvStore) {
    this.kvStore = kvStore;
  }
  async getIncrementalNumber(): Promise<number> {
    let num = await this.kvStore.get<number>('incrementalNumber');
    if (num === undefined) {
      num = 0;
    }
    num++;

    await this.kvStore.set('incrementalNumber', num);
    return num;
  }
  async assignKeyStoreIdMeta(meta: { [key: string]: string }): Promise<{
    [key: string]: string;
  }> {
    // `__id__` is used to distinguish the key store.
    return Object.assign({}, meta, {
      __id__: (await this.getIncrementalNumber()).toString()
    });
  }
}

export class MockKVStore implements KVStore {
  private _prefix: string;
  constructor(prefix?: string) {
    this._prefix = prefix;
  }
  async get<T = unknown>(key: string): Promise<any> {
    if (key === 'incrementalNumber') {
      return Promise.resolve(10);
    }
    return undefined;
  }
  async set<T = unknown>(key: string, data: T): Promise<void> {}
  prefix(): string {
    return this._prefix;
  }
}
