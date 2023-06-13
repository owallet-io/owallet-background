import { scrypt } from 'scrypt-js';
import {
  mockKeyStorePbkdf2Ledger,
  mockKeyStorePbkdf2Mnemonic,
  mockKeyStorePbkdf2PrivateKey,
  mockKeyStoreScryptLedger,
  mockKeyStoreScryptMnemonic,
  mockKeyStoreScryptPrivateKey,
  mockKeyStoreSha256Ledger,
  mockKeyStoreSha256Mnemonic,
  mockKeyStoreSha256PrivateKey
} from './keystores';

//key cosmos example
const mockAddressCosmos = 'cosmos1eu2ecyzedvkvsfcd5vfht4whgx3uf22fjj9a4n';
const mnemonicCosmos =
  'sure tragic expand guess girl boy settle pull monster bleak daughter butter';
//add "0x" before privateKeyCosmos
const privateKeyCosmos =
  'ae0e3814fad957fb1fdca450a9795f5e64b46061a8618cc4029fcbbfdf215221';
const publicKeyTest =
  '0407e5b99e7849b4c2f6af0ee7e7f094b8859f1109962ad6e94fa3672fc8003a301c28c6ba894f7a08c3ca761abf39285c46614d7d8727b1ecd67b2c33d1ee81c1';
export const mockKeyCosmos = {
  address: mockAddressCosmos,
  mnemonic: mnemonicCosmos,
  privateKey: privateKeyCosmos,
  privateKeyHex: Buffer.from(privateKeyCosmos, 'hex'),
  publicKey: publicKeyTest,
  publicKeyHex: Buffer.from(publicKeyTest, 'hex')
};
export const mockAddressLedger = {
  cosmos: mockKeyCosmos.address
};
export const mockPassword = '12345678';
export const mockBip44HDPath: BIP44HDPath = {
  coinType: 118,
  account: 0,
  change: 0,
  addressIndex: 0
};
export const rng = (array) => {
  return Promise.resolve(crypto.getRandomValues(array));
};
export const mockRng = jest.fn().mockImplementation(rng);
export const mockKdfMobile = 'pbkdf2';
export const mockKdfExtension = 'scrypt';
export const mockMeta = { name: 'orai' };
export const mockMetaHasId = { ...mockMeta, __id__: '1' };
export const mockCrypto: CommonCrypto = {
  scrypt: async (text: string, params: ScryptParams) => {
    return await scrypt(
      Buffer.from(text),
      Buffer.from(params.salt, 'hex'),
      params.n,
      params.r,
      params.p,
      params.dklen
    );
  }
};

export const mockKeyStore: TypeMockKeyStore = {
  ledger: {
    pbkdf2: mockKeyStorePbkdf2Ledger,
    sha256: mockKeyStoreSha256Ledger,
    scrypt: mockKeyStoreScryptLedger
  },
  mnemonic: {
    pbkdf2: mockKeyStorePbkdf2Mnemonic,
    sha256: mockKeyStoreSha256Mnemonic,
    scrypt: mockKeyStoreScryptMnemonic
  },
  privateKey: {
    pbkdf2: mockKeyStorePbkdf2PrivateKey,
    sha256: mockKeyStoreSha256PrivateKey,
    scrypt: mockKeyStoreScryptPrivateKey
  }
};
import { KVStore } from '@owallet/common';
import { RNG } from '@owallet/crypto';
import { BIP44HDPath, CommonCrypto, ScryptParams } from '../types';
import { Crypto, KeyStore } from '../crypto';
import {
  KeyRingStatus,
  KeyStoreKey,
  MultiKeyStoreInfoWithSelected,
  KeyMultiStoreKey,
  AddressesLedger,
  TypeMockKeyStore
} from './types';
import { Env } from '@owallet/router';

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
export class MockCreateLedgerKeyStore {
  static async CreateLedgerKeyStore(
    rng: RNG,
    crypto: CommonCrypto,
    kdf: 'scrypt' | 'sha256' | 'pbkdf2',
    publicKey: Uint8Array,
    password: string,
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath,
    addresses?: AddressesLedger
  ): Promise<KeyStore> {
    return await Crypto.encrypt(
      rng,
      crypto,
      kdf,
      'ledger',
      Buffer.from(publicKey).toString('hex'),
      password,
      meta,
      bip44HDPath,
      addresses
    );
  }
}
export class MockCreatePrivateKeyStore {
  static async CreatePrivateKeyStore(
    rng: RNG,
    crypto: CommonCrypto,
    kdf: 'scrypt' | 'sha256' | 'pbkdf2',
    privateKey: Uint8Array,
    password: string,
    meta: Record<string, string>
  ): Promise<KeyStore> {
    return await Crypto.encrypt(
      rng,
      crypto,
      kdf,
      'privateKey',
      Buffer.from(privateKey).toString('hex'),
      password,
      meta
    );
  }
}

export class MockCreatePrivateKey {
  privateKey?: Uint8Array;
  keyStore: KeyStore | null;
  rng: RNG;
  password: string = '';
  crypto: CommonCrypto;
  multiKeyStore: KeyStore[];
  public async createPrivateKey(
    kdf: 'scrypt' | 'sha256' | 'pbkdf2',
    privateKey: Uint8Array,
    password: string,
    meta: Record<string, string>
  ): Promise<{
    status: KeyRingStatus;
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
  }> {
    // if (this.status !== KeyRingStatus.EMPTY) {
    //   throw new Error('Key ring is not loaded or not empty');
    // }

    this.privateKey = privateKey;
    this.keyStore = await this.CreatePrivateKeyStore(
      this.rng,
      this.crypto,
      kdf,
      privateKey,
      password,
      await this.assignKeyStoreIdMeta(meta)
    );
    this.password = password;
    this.multiKeyStore.push(this.keyStore);

    await this.save();

    return {
      status: this.status,
      multiKeyStoreInfo: this.getMultiKeyStoreInfo()
    };
  }

  async save(): Promise<boolean> {
    return true;
  }
  get status() {
    return KeyRingStatus.UNLOCKED;
  }
  getMultiKeyStoreInfo(): any {
    return null;
  }
  async assignKeyStoreIdMeta(meta: { [key: string]: string }): Promise<{
    [key: string]: string;
  }> {
    return null;
  }
  async CreatePrivateKeyStore(p1, p2, p3, p4, p5, p6): Promise<any> {}
}
export class MockCreateLedgerKey {
  keyStore: KeyStore | null;
  rng: RNG;
  password: string = '';
  crypto: CommonCrypto;
  multiKeyStore: KeyStore[];
  ledgerKeeper: any;
  ledgerPublicKey?: Uint8Array;
  public async createLedgerKey(
    env: Env,
    kdf: 'scrypt' | 'sha256' | 'pbkdf2',
    password: string,
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath
  ): Promise<{
    status: KeyRingStatus;
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
  }> {
    // if (this.status !== KeyRingStatus.EMPTY) {
    //   throw new Error('Key ring is not loaded or not empty');
    // }
    const ledgerAppType = this.getNetworkTypeByBip44HDPath(bip44HDPath);

    console.log('bip44HDPath', bip44HDPath);

    // detect network type here when create ledger
    // Get public key first
    const { publicKey, address } =
      (await this.ledgerKeeper.getPublicKey(env, bip44HDPath, ledgerAppType)) ||
      {};

    console.log('publicKey---', publicKey, address);

    this.ledgerPublicKey = publicKey;

    console.log('ledgerPublicKey ===', this.ledgerPublicKey);

    const keyStore = await this.CreateLedgerKeyStore(
      this.rng,
      this.crypto,
      kdf,
      this.ledgerPublicKey,
      password,
      await this.assignKeyStoreIdMeta(meta),
      bip44HDPath,
      {
        [ledgerAppType]: address
      }
    );

    this.password = password;
    this.keyStore = keyStore;
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
  CreateLedgerKeyStore(p1, p2, p3, p4, p5, p6, p7, p8): any {
    return null;
  }
  getNetworkTypeByBip44HDPath(bip44: any): any {
    return 'cosmos';
  }
  getMultiKeyStoreInfo(): any {
    return null;
  }
  async assignKeyStoreIdMeta(meta: { [key: string]: string }): Promise<{
    [key: string]: string;
  }> {
    return null;
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
      multiKeyStoreInfo: this.getMultiKeyStoreInfo()
    };
  }
  async save(): Promise<boolean> {
    return true;
  }
  get status() {
    return KeyRingStatus.UNLOCKED;
  }
  getMultiKeyStoreInfo(): any {
    return null;
  }
  async assignKeyStoreIdMeta(meta: { [key: string]: string }): Promise<{
    [key: string]: string;
  }> {
    return null;
  }
  async CreateMnemonicKeyStore(p1, p2, p3, p4, p5, p6, p7: any): Promise<any> {}
}

export class MockAddPrivateKey {
  privateKey?: Uint8Array;
  keyStore: KeyStore | null;
  rng: RNG;
  password: string = '';
  crypto: CommonCrypto;
  multiKeyStore: KeyStore[];
  public async addPrivateKey(
    kdf: 'scrypt' | 'sha256' | 'pbkdf2',
    privateKey: Uint8Array,
    meta: Record<string, string>
  ): Promise<{
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
  }> {
    if (this.password == '') {
      // throw new OWalletError(
      //   'keyring',
      //   141,
      //   'Key ring is locked or not initialized'
      // );
    }

    const keyStore = await this.CreatePrivateKeyStore(
      this.rng,
      this.crypto,
      kdf,
      privateKey,
      this.password,
      await this.assignKeyStoreIdMeta(meta)
    );
    this.multiKeyStore.push(keyStore);

    await this.save();
    return {
      multiKeyStoreInfo: await this.getMultiKeyStoreInfo()
    };
  }

  async save(): Promise<boolean> {
    return true;
  }
  get status() {
    return KeyRingStatus.UNLOCKED;
  }
  getMultiKeyStoreInfo(): any {
    return null;
  }
  async assignKeyStoreIdMeta(meta: { [key: string]: string }): Promise<{
    [key: string]: string;
  }> {
    return null;
  }
  async CreatePrivateKeyStore(p1, p2, p3, p4, p5, p6): Promise<any> {}
}
export class MockAddLedgerKey {
  keyStore: KeyStore | null;
  rng: RNG;
  password: string = '';
  crypto: CommonCrypto;
  multiKeyStore: KeyStore[];
  ledgerKeeper: any;
  ledgerPublicKey?: Uint8Array;
  public async addLedgerKey(
    env: Env,
    kdf: 'scrypt' | 'sha256' | 'pbkdf2',
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath
  ): Promise<{
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
  }> {
    try {
      // if (this.password == '') {
      //   throw new OWalletError(
      //     'keyring',
      //     141,
      //     'Key ring is locked or not initialized'
      //   );
      // }
      console.log('HERE');
      const ledgerAppType = this.getNetworkTypeByBip44HDPath(bip44HDPath);
      const { publicKey, address } =
        (await this.ledgerKeeper.getPublicKey(
          env,
          bip44HDPath,
          ledgerAppType
        )) || {};

      console.log('address ==1', address);

      const keyStore = await this.CreateLedgerKeyStore(
        this.rng,
        this.crypto,
        kdf,
        publicKey,
        this.password,
        await this.assignKeyStoreIdMeta(meta),
        bip44HDPath,
        {
          [ledgerAppType]: address
        }
      );

      console.log(keyStore, 'keystore here');

      this.multiKeyStore.push(keyStore);

      await this.save();

      console.log(this.getMultiKeyStoreInfo, 'multi here');
      return {
        multiKeyStoreInfo: await this.getMultiKeyStoreInfo()
      };
    } catch (error) {
      console.log('Error in add ledger key: ', error);
      throw new Error(error);
    }
  }

  async save(): Promise<boolean> {
    return true;
  }
  get status() {
    return KeyRingStatus.UNLOCKED;
  }
  CreateLedgerKeyStore(p1, p2, p3, p4, p5, p6, p7, p8): any {
    return null;
  }
  getNetworkTypeByBip44HDPath(bip44: any): any {
    return 'cosmos';
  }
  getMultiKeyStoreInfo(): any {
    return null;
  }
  async assignKeyStoreIdMeta(meta: { [key: string]: string }): Promise<{
    [key: string]: string;
  }> {
    return null;
  }
}
export class MockAddMnemonicKey {
  mnemonic?: string;
  keyStore: KeyStore | null;
  rng: RNG;
  password: string = '';
  crypto: CommonCrypto;
  multiKeyStore: KeyStore[];
  public async addMnemonicKey(
    kdf: 'scrypt' | 'sha256' | 'pbkdf2',
    mnemonic: string,
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath
  ): Promise<{
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
  }> {
    if (this.password == '') {
      // throw new OWalletError(
      //   'keyring',
      //   141,
      //   'Key ring is locked or not initialized'
      // );
    }

    const keyStore = await this.CreateMnemonicKeyStore(
      this.rng,
      this.crypto,
      kdf,
      mnemonic,
      this.password,
      await this.assignKeyStoreIdMeta(meta),
      bip44HDPath
    );
    this.multiKeyStore.push(keyStore);

    await this.save();
    return {
      multiKeyStoreInfo: await this.getMultiKeyStoreInfo()
    };
  }
  async save(): Promise<boolean> {
    return true;
  }
  get status() {
    return KeyRingStatus.UNLOCKED;
  }
  getMultiKeyStoreInfo(): any {
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
