import Transport from '@ledgerhq/hw-transport';
import CosmosApp from '@ledgerhq/hw-app-cosmos';
import EthApp from '@ledgerhq/hw-app-eth';
import TrxApp from '@ledgerhq/hw-app-trx';
import BtcApp from '@ledgerhq/hw-app-btc';
import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import { signatureImport, publicKeyConvert } from 'secp256k1';
import { Buffer } from 'buffer';
import { OWalletError } from '@owallet/router';
import { stringifyPath } from '../utils/helper';
import { payments } from 'bitcoinjs-lib';
import { getCoinNetwork, toBufferLE } from '@owallet/bitcoin';
export type TransportIniter = (...args: any[]) => Promise<Transport>;
export interface UTXO {
  txid: string;
  value: number;
  vout: number;
  addr: string;

  key(): string;
}

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
export type LedgerAppType = 'cosmos' | 'eth' | 'trx' | 'btc';

export class LedgerInternal {
  constructor(
    private readonly ledgerApp: CosmosApp | EthApp | TrxApp | BtcApp,
    private readonly type: LedgerAppType
  ) {}

  static transportIniters: Record<TransportMode, TransportIniter> = {
    webusb: TransportWebUSB.create.bind(TransportWebUSB),
    webhid: TransportWebHID.create.bind(TransportWebHID),
    // implemented in ReactNative
    ble: () => Promise.resolve(null)
  };

  static async init(
    mode: TransportMode,
    initArgs: any[] = [],
    ledgerAppType: LedgerAppType
  ): Promise<LedgerInternal> {
    const transportIniter = LedgerInternal.transportIniters[mode];
    // console.log('transportIniter', transportIniter);

    if (!transportIniter) {
      throw new OWalletError('ledger', 112, `Unknown mode: ${mode}`);
    }

    let app: CosmosApp | EthApp | TrxApp | BtcApp;

    const transport = await transportIniter(...initArgs);

    // console.log('transport ===', transport);

    try {
      if (ledgerAppType === 'trx') {
        app = new TrxApp(transport);
      } else if (ledgerAppType === 'eth') {
        app = new EthApp(transport);
      } else if (ledgerAppType === 'btc') {
        app = new BtcApp(transport);
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
      // console.log('transportIniter ledger', ledger);
      return ledger;
    } catch (e) {
      console.log('🚀 ~ file: ledger-internal.ts:99 ~ LedgerInternal ~ e:', e);

      // console.log(e);
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
      case 'btc':
        return 'Bitcoin App';
    }
  }

  async getPublicKey(path: number[]): Promise<object> {
    if (!this.ledgerApp) {
      throw new Error(`${this.LedgerAppTypeDesc} not initialized`);
    }

    if (this.ledgerApp instanceof CosmosApp) {
      // make compartible with ledger-cosmos-js
      const { publicKey, address } = await this.ledgerApp.getAddress(
        stringifyPath(path),
        'cosmos'
      );
      return { publicKey: Buffer.from(publicKey, 'hex'), address };
    } else if (this.ledgerApp instanceof EthApp) {
      const { publicKey, address } = await this.ledgerApp.getAddress(
        stringifyPath(path)
      );

      console.log('get here eth ===', publicKey, address);

      const pubKey = Buffer.from(publicKey, 'hex');
      // Compress the public key
      return {
        publicKey: publicKeyConvert(pubKey, true),
        address
      };
    } else if (this.ledgerApp instanceof BtcApp) {
      const { publicKey, bitcoinAddress } =
        await this.ledgerApp.getWalletPublicKey(stringifyPath(path), {
          format: 'bech32',
          verify: true
        });
      const pubKey = Buffer.from(publicKey, 'hex');
      // Compress the public key
      return {
        publicKey: publicKeyConvert(pubKey, true),
        address: bitcoinAddress
      };
    } else {
      console.log('get here trx === ', path, stringifyPath(path));
      const { publicKey, address } = await this.ledgerApp.getAddress(
        stringifyPath(path)
      );
      console.log('get here trx  2 === ', address);

      // Compress the public key

      return { publicKey: Buffer.from(publicKey, 'hex'), address };
    }
  }

  async sign(path: number[], message: any): Promise<Uint8Array | any> {
    if (!this.ledgerApp) {
      throw new Error(`${this.LedgerAppTypeDesc} not initialized`);
    }

    if (this.ledgerApp instanceof CosmosApp) {
      const { signature } = await this.ledgerApp.sign(
        stringifyPath(path),
        message
      );

      // Parse a DER ECDSA signature
      return signatureImport(signature);
    } else if (this.ledgerApp instanceof EthApp) {
      const rawTxHex = Buffer.from(message).toString('hex');

      const signature = await this.ledgerApp.signTransaction(
        stringifyPath(path),
        rawTxHex
      );
      return signature;
      // return convertEthSignature(signature);
    } else if (this.ledgerApp instanceof BtcApp) {
      const messageStr = Buffer.from(message).toString('utf-8');
      if (!messageStr) {
        throw new Error('Not found messageStr for ledger app type BTC');
      }
      const msgObject = JSON.parse(messageStr);
      // const signature = await this.signTransactionBtc(
      //   stringifyPath(path),

      // );
      // return signature;
      return 'ok';
    } else {
      // const rawTxHex = Buffer.from(message).toString('hex');
      const trxSignature = await this.ledgerApp.signTransactionHash(
        stringifyPath(path),
        message //rawTxHex
      );

      return Buffer.from(trxSignature, 'hex');
    }
  }

  async close(): Promise<void> {
    if (this.ledgerApp) {
      await this.ledgerApp.transport.close();
    }
  }
  async signTransactionBtc(
    path: string,
    amount: number,
    utxos: Array<UTXO & { hex: string }>,
    toAddress: string
  ): Promise<string> {
    const txs = utxos.map((utxo) => {
      return {
        tx: this.ledgerApp.splitTransaction(utxo.hex, true),
        ...utxo
      };
    });

    const script = payments.p2wpkh({
      address: toAddress,
      network: getCoinNetwork('bitcoinTestnet')
    });

    const outputScript = this.ledgerApp
      .serializeTransactionOutputs({
        version: Buffer.from('01000000', 'hex'),
        inputs: [],
        outputs: [
          {
            amount: toBufferLE(BigInt(amount), 8),
            script: script.output!
          }
        ]
      })
      .toString('hex');

    return this.ledgerApp.createPaymentTransactionNew({
      inputs: txs.map((utxo) => {
        return [utxo.tx, utxo.vout, null, null];
      }),
      associatedKeysets: txs.map((tx) => path),
      outputScriptHex: outputScript,
      segwit: true,
      additionals: ['bitcoin', 'bech32']
    });
  }
  static async isWebHIDSupported(): Promise<boolean> {
    return await TransportWebHID.isSupported();
  }
}
