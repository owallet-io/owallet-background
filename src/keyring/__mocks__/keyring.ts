import { KVStore } from '@owallet/common';
import { RNG } from '@owallet/crypto';
import { BIP44HDPath, CommonCrypto } from '../types';
import { Crypto, KeyStore } from '../crypto';
import {
  KeyRingStatus,
  KeyStoreKey,
  MultiKeyStoreInfoWithSelected,
  KeyMultiStoreKey
} from './types';

export class MockIsLocked {
  privateKey?: Uint8Array;
  mnemonic?: string;
  ledgerPublicKey?: Uint8Array;

  public isLocked(): boolean {
    return (
      this.privateKey == null &&
      this.mnemonic == null &&
      this.ledgerPublicKey == null
    );
  }
}
export class MockStatus {
  keyStore: KeyStore | null;
  loaded: boolean;
  public get status(): KeyRingStatus {
    if (!this.loaded) {
      return KeyRingStatus.NOTLOADED;
    }

    if (!this.keyStore) {
      return KeyRingStatus.EMPTY;
    } else if (!this.isLocked()) {
      return KeyRingStatus.UNLOCKED;
    } else {
      return KeyRingStatus.LOCKED;
    }
  }
  public isLocked(): boolean {
    return true;
  }
}
export class MockSave {
  kvStore: KVStore;
  keyStore: KeyStore | null;
  multiKeyStore: KeyStore[];
  public async save() {
    await this.kvStore.set<KeyStore>(KeyStoreKey, this.keyStore);
    await this.kvStore.set<KeyStore[]>(KeyMultiStoreKey, this.multiKeyStore);
  }
}
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

export class MockCreateMnemonicKey {
  mnemonic?: string;
  keyStore: KeyStore | null;
  rng: RNG;
  password: string = '';
  crypto: CommonCrypto;
  multiKeyStore: KeyStore[];
  public async createMnemonicKey(
    kdf: 'scrypt' | 'sha256' | 'pbkdf2',
    mnemonic: string,
    password: string,
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath
  ): Promise<{
    status: KeyRingStatus;
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
  }> {
    // Affect if remove this check ?
    // if (this.status !== KeyRingStatus.EMPTY) {
    //   throw new Error('Key ring is not loaded or not empty');
    // }

    this.mnemonic = mnemonic;
    this.keyStore = await this.CreateMnemonicKeyStore(
      this.rng,
      this.crypto,
      kdf,
      mnemonic,
      password,
      await this.assignKeyStoreIdMeta(meta),
      bip44HDPath
    );
    this.password = password;
    this.multiKeyStore.push(this.keyStore);

    await this.save();

    return {
      status: this.status,
      multiKeyStoreInfo: await this.getMultiKeyStoreInfo()
    };
  }
  async save(): Promise<boolean> {
    return true;
  }
  get status() {
    return KeyRingStatus.UNLOCKED;
  }
  async getMultiKeyStoreInfo(): Promise<any> {
    return null;
  }
  async assignKeyStoreIdMeta(meta: { [key: string]: string }): Promise<{
    [key: string]: string;
  }> {
    return null;
  }
  async CreateMnemonicKeyStore(p1, p2, p3, p4, p5, p6, p7: any): Promise<any> {}
}
export class MockMultiKeyStore {
  multiKeyStore: KeyStore[];
  keyStore: KeyStore | null;
  public getMultiKeyStoreInfo(): MultiKeyStoreInfoWithSelected {
    const result: MultiKeyStoreInfoWithSelected = [];
    for (const keyStore of this.multiKeyStore) {
      result.push({
        version: keyStore.version,
        type: keyStore.type,
        addresses: keyStore.addresses,
        meta: keyStore.meta,
        coinTypeForChain: keyStore.coinTypeForChain,
        bip44HDPath: keyStore.bip44HDPath,
        selected: this.keyStore
          ? MockFnHelper.getKeyStoreId(keyStore) ===
            MockFnHelper.getKeyStoreId(this.keyStore)
          : false
      });
    }
    return result;
  }
}
export class MockFnHelper {
  kvStore: KVStore;
  private keyStore: KeyStore | null;
  private multiKeyStore: KeyStore[];
  async getIncrementalNumber(): Promise<number> {
    let num = await this.kvStore.get<number>('incrementalNumber');
    if (num === undefined) {
      num = 0;
    }
    num++;

    await this.kvStore.set('incrementalNumber', num);
    return num;
  }
  static getKeyStoreId(keyStore: KeyStore): string {
    const id = keyStore.meta?.__id__;
    if (!id) {
      throw new Error("Key store's id is empty");
    }

    return id;
  }
  async assignKeyStoreIdMeta(meta: { [key: string]: string }): Promise<{
    [key: string]: string;
  }> {
    // `__id__` is used to distinguish the key store.
    return Object.assign({}, meta, {
      __id__: (await this.getIncrementalNumber()).toString()
    });
  }
  public getMultiKeyStoreInfo(): MultiKeyStoreInfoWithSelected {
    const result: MultiKeyStoreInfoWithSelected = [];
    for (const keyStore of this.multiKeyStore) {
      result.push({
        version: keyStore.version,
        type: keyStore.type,
        addresses: keyStore.addresses,
        meta: keyStore.meta,
        coinTypeForChain: keyStore.coinTypeForChain,
        bip44HDPath: keyStore.bip44HDPath,
        selected: this.keyStore
          ? MockFnHelper.getKeyStoreId(keyStore) ===
            MockFnHelper.getKeyStoreId(this.keyStore)
          : false
      });
    }
    return result;
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
