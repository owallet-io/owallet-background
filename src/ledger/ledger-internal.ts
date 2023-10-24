import Transport from '@ledgerhq/hw-transport';
import CosmosApp from '@ledgerhq/hw-app-cosmos';
import EthApp from '@ledgerhq/hw-app-eth';
import TrxApp from '@ledgerhq/hw-app-trx';
import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import { signatureImport } from 'secp256k1';
import { Buffer } from 'buffer';
import { OWalletError } from '@owallet/router';
import { EIP712MessageValidator, stringifyPath, ethSignatureToBytes, domainHash, messageHash } from '../utils/helper';
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
  constructor(private readonly ledgerApp: CosmosApp | EthApp | TrxApp, private readonly type: LedgerAppType) {}

  static transportIniters: Record<TransportMode, TransportIniter> = {
    webusb: TransportWebUSB.create.bind(TransportWebUSB),
    webhid: TransportWebHID.create.bind(TransportWebHID),
    // implemented in ReactNative
    ble: () => Promise.resolve(null)
  };

  static async init(mode: TransportMode, initArgs: any[] = [], ledgerAppType: LedgerAppType): Promise<LedgerInternal> {
    const transportIniter = LedgerInternal.transportIniters[mode];
    // console.log('transportIniter', transportIniter);

    if (!transportIniter) {
      throw new OWalletError('ledger', 112, `Unknown mode: ${mode}`);
    }

    let app: CosmosApp | EthApp | TrxApp;

    const transport = await transportIniter(...initArgs);

    // console.log('transport ===', transport);

    try {
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
      // console.log('transportIniter ledger', ledger);
      return ledger;
    } catch (e) {
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

    const { version, device_locked, major, test_mode } = await app.getAppConfiguration();

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

  async getPublicKey(path: number[]): Promise<object> {
    if (!this.ledgerApp) {
      throw new Error(`${this.LedgerAppTypeDesc} not initialized`);
    }

    if (this.ledgerApp instanceof CosmosApp) {
      // make compartible with ledger-cosmos-js
      const { publicKey, address } = await this.ledgerApp.getAddress(stringifyPath(path), 'cosmos');
      return { publicKey: Buffer.from(publicKey, 'hex'), address };
    } else if (this.ledgerApp instanceof EthApp) {
      const { publicKey, address } = await this.ledgerApp.getAddress(stringifyPath(path));

      console.log('get here eth ===', publicKey, address);

      const pubKey = Buffer.from(publicKey, 'hex');
      // Compress the public key
      return {
        // publicKey: publicKeyConvert(pubKey, true),
        address,
        publicKey: pubKey
      };
    } else {
      console.log('get here trx === ', path, stringifyPath(path));
      const { publicKey, address } = await this.ledgerApp.getAddress(stringifyPath(path));
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
      const { signature } = await this.ledgerApp.sign(stringifyPath(path), message);

      // Parse a DER ECDSA signature
      return signatureImport(signature);
    } else if (this.ledgerApp instanceof EthApp) {
      const rawTxHex = Buffer.from(message).toString('hex');

      const signDoc = (() => {
        try {
          return JSON.parse(Buffer.from(message).toString());
        } catch (error) {
          return null;
        }
      })();

      if (signDoc && signDoc?.chain_id && signDoc?.chain_id?.startsWith('injective')) {
        const eip712 = { ...signDoc?.eip712 };
        delete signDoc.eip712;
        let data: any;
        try {
          const message = Buffer.from(
            JSON.stringify({
              types: eip712.types,
              domain: eip712.domain,
              primaryType: eip712.primaryType,
              message: signDoc
            })
          );
          data = await EIP712MessageValidator.validateAsync(JSON.parse(Buffer.from(message).toString()));
        } catch (e) {
          console.log('🚀 ~ file: ledger-internal.ts:188 ~ LedgerInternal ~ sign ~ e:', e);

          throw new Error(e.message || e.toString());
        }

        try {
          // Unfortunately, signEIP712Message not works on ledger yet.
          return ethSignatureToBytes(await this.ledgerApp.signEIP712HashedMessage(stringifyPath(path), domainHash(data), messageHash(data)));
        } catch (e) {
          if (e?.message.includes('(0x6985)')) {
            throw new Error('User rejected signing');
          }
          throw new Error(e.message || e.toString());
        }
      }

      const signature = await this.ledgerApp.signTransaction(stringifyPath(path), rawTxHex);
      return signature;
      // return convertEthSignature(signature);
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

  static async isWebHIDSupported(): Promise<boolean> {
    return await TransportWebHID.isSupported();
  }
}
