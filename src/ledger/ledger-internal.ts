import Transport from '@ledgerhq/hw-transport';
import CosmosApp from '@ledgerhq/hw-app-cosmos';
import EthApp from '@ledgerhq/hw-app-eth';
import TrxApp from '@ledgerhq/hw-app-trx';
import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import { signatureImport, publicKeyConvert } from 'secp256k1';
import { Buffer } from 'buffer';
import { fromString } from 'bip32-path';
import { OWalletError } from '@owallet/router';

export type TransportIniter = (...args: any[]) => Promise<Transport>;

export enum LedgerInitErrorOn {
  Transport,
  App,
  Unknown
}

export class LedgerInitError extends Error {
  constructor(public readonly errorOn: LedgerInitErrorOn, message?: string) {
    super(message);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, LedgerInitError.prototype);
  }
}

export type TransportMode = 'webusb' | 'webhid' | 'ble';
export type LedgerAppType = 'cosmos' | 'eth' | 'trx';

export class LedgerInternal {
  constructor(
    private readonly ledgerApp: CosmosApp | EthApp | TrxApp,
    private readonly type: LedgerAppType
  ) {}

  static transportIniters: Record<TransportMode, TransportIniter> = {
    webusb: TransportWebUSB.create.bind(TransportWebUSB),
    webhid: TransportWebHID.create.bind(TransportWebHID),
    // implemented in ReactNative
    ble: () => Promise.resolve(null)
  };

  static transportList: Record<any, any> = {
    webusb: TransportWebUSB.list(),
    webhid: TransportWebHID.list()
  };

  static async init(
    mode: TransportMode,
    initArgs: any[] = [],
    ledgerAppType: LedgerAppType
  ): Promise<LedgerInternal> {
    const transportIniter = LedgerInternal.transportIniters[mode];
    // const list = await LedgerInternal.transportIniters[mode];
    console.log('transportIniter', transportIniter);
    console.log(
      'transportIniter type ledger 12',
      ledgerAppType,
      initArgs,
      mode
    );
    if (!transportIniter) {
      throw new OWalletError('ledger', 112, `Unknown mode: ${mode}`);
    }

    let app: CosmosApp | EthApp | TrxApp;
    let transport;
    try {
      transport = await transportIniter(...initArgs);
      // if (list.length > 1) {
      //   await transport.close();
      //   transport = await transportIniter(...initArgs);
      // }
      // listen((log) => console.log('log listen: ', log));
      console.log('transportIniter transport', transport);
      if (ledgerAppType === 'trx') {
        app = new TrxApp(transport);
      } else if (ledgerAppType === 'eth') {
        app = new EthApp(transport);
      } else {
        app = new CosmosApp(transport);
      }
      const ledger = new LedgerInternal(app, ledgerAppType);

      if (ledgerAppType === 'cosmos') {
        const versionResponse = await ledger.getVersion();

        // In this case, device is on screen saver.
        // However, it is almost same as that the device is not unlocked to user-side.
        // So, handle this case as initializing failed in `Transport`.
        if (versionResponse.deviceLocked) {
          throw new Error('Device is on screen saver');
        }
      }
      console.log('transportIniter ledger', ledger);
      return ledger;
    } catch (e) {
      console.log('transportIniter error', e, transport);
      if (transport) {
        await transport.close();
      }
      if (e.message === 'Device is on screen saver') {
        throw new LedgerInitError(LedgerInitErrorOn.Transport, e.message);
      }

      throw new LedgerInitError(LedgerInitErrorOn.App, e.message);
    }
  }

  async getVersion(): Promise<{
    deviceLocked: boolean;
    major: number;
    version: string;
    testMode: boolean;
  }> {
    const app = this.ledgerApp as CosmosApp;
    if (!app) {
      throw new Error('Cosmos App not initialized');
    }

    const { version, device_locked, major, test_mode } =
      await app.getAppConfiguration();

    return {
      deviceLocked: device_locked,
      major,
      version,
      testMode: test_mode
    };
  }

  public get LedgerAppTypeDesc(): string {
    switch (this.type) {
      case 'cosmos':
        return 'Cosmos App';
      case 'eth':
        return 'Ethereum App';
      case 'trx':
        return 'Tron App';
    }
  }

  private getHdPath(path: number[] | string): number[] {
    return typeof path === 'string' ? fromString(path).toPathArray() : path;
  }

  async getPublicKey(path: number[] | string): Promise<object> {
    if (!this.ledgerApp) {
      throw new Error(`${this.LedgerAppTypeDesc} not initialized`);
    }

    const hdPath = this.getHdPath(path);

    console.log('get publichdPath', hdPath);
    console.log(
      'get this.ledgerAp',
      this.ledgerApp,
      this.ledgerApp instanceof TrxApp,
      this.ledgerApp instanceof EthApp,
      this.ledgerApp instanceof CosmosApp
    );

    if (this.ledgerApp instanceof CosmosApp) {
      // make compartible with ledger-cosmos-js
      const { publicKey, address } = await this.ledgerApp.getAddress(
        "44'/118'/0'/0/0",
        'cosmos'
      );
      return { publicKey: Buffer.from(publicKey, 'hex'), address };
    } else if (this.ledgerApp instanceof EthApp) {
      console.log('11111');

      const { publicKey, address } = await this.ledgerApp.getAddress(
        "44'/60'/0'/0/0"
      );

      console.log('get here eth ===', publicKey, address);

      const pubKey = Buffer.from(publicKey, 'hex');
      // Compress the public key
      return {
        publicKey: publicKeyConvert(pubKey, true),
        address
      };
    } else {
      console.log('hdPath', hdPath);

      const { publicKey, address } = await this.ledgerApp.getAddress(
        "44'/195'/0'/0/0"
      );

      // Compress the public key

      return { publicKey: Buffer.from(publicKey, 'hex'), address };
    }
  }

  async sign(path: number[] | string, message: any): Promise<Uint8Array | any> {
    console.log('sign ledger === ', message, path);

    if (!this.ledgerApp) {
      throw new Error(`${this.LedgerAppTypeDesc} not initialized`);
    }
    console.log({ ledgerApp: this.ledgerApp });

    if (this.ledgerApp instanceof CosmosApp) {
      const { signature } = await this.ledgerApp.sign(
        "44'/118'/0'/0/0",
        message
      );

      // Parse a DER ECDSA signature
      return signatureImport(signature);
    } else if (this.ledgerApp instanceof EthApp) {
      const rawTxHex = Buffer.from(message).toString('hex');
      // const tx = JSON.parse(Buffer.from(message).toString());
      // This is normal object to serialize
      // const rlpArray = serialize(tx).replace('0x', '');
      // const signature = await this.ledgerApp.signTransaction(
      //   "44'/60'/0'/0/0",
      //   rlpArray
      // );

      // console.log('rawTxHex wth===', rawTxHex);
      const signature = await this.ledgerApp.signTransaction(
        "44'/60'/0'/0/0",
        rawTxHex
      );
      // const signedTx = serialize(message, {
      //   r: `0x${signature.r}`,
      //   s: `0x${signature.s}`,
      //   v: parseInt(signature.v, 16)
      // }).replace('0x', '');
      // return Buffer.from(signedTx, 'hex');
      console.log('signature eth ===', signature);
      return signature;
      // const splitSignature = BytesUtils.splitSignature({
      //   v: Number(signature.v),
      //   r: '0x' + signature.r,
      //   s: '0x' + signature.s
      // });
      // console.log('splitSignature === 1', splitSignature);
      // console.log(
      //   'Buffer === 1',
      //   BytesUtils.arrayify(
      //     BytesUtils.concat([splitSignature.r, splitSignature.s])
      //   )
      // );
      // return BytesUtils.arrayify(
      //   BytesUtils.concat([splitSignature.r, splitSignature.s])
      // );
    } else {
      const rawTxHex = Buffer.from(message).toString('hex');
      console.log('rawTxHex sign ===', rawTxHex);

      const trxSignature = await this.ledgerApp.signTransaction(
        "44'/195'/0'/0/0",
        rawTxHex,
        []
      );
      console.log('trxSignature', trxSignature);

      return Buffer.from(trxSignature, 'hex');
    }
  }

  async close(): Promise<void> {
    if (this.ledgerApp) {
      await this.ledgerApp.transport.close();
    }
  }

  static async isWebHIDSupported(): Promise<boolean> {
    return await TransportWebHID.isSupported();
  }
}
