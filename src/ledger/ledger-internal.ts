import Transport from '@ledgerhq/hw-transport';
import CosmosApp from '@ledgerhq/hw-app-cosmos';
import EthApp from '@ledgerhq/hw-app-eth';
import TrxApp from '@ledgerhq/hw-app-trx';
import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import { signatureImport } from 'secp256k1';
import { Buffer } from 'buffer';
import { fromString, fromPathArray } from 'bip32-path';
import { OWalletError } from '@owallet/router';
import { NetworkType } from '@owallet/types';
import * as BytesUtils from '@ethersproject/bytes';

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

export class LedgerInternal {
  private static transport: Transport;
  // private ethApp: EthApp;
  // private trxApp: TrxApp;
  constructor(private ledgerApp: CosmosApp | EthApp | TrxApp) {}

  static transportIniters: Record<TransportMode, TransportIniter> = {
    webusb: TransportWebUSB.create.bind(TransportWebUSB),
    webhid: TransportWebHID.create.bind(TransportWebHID),
    // implemented in ReactNative
    ble: () => Promise.resolve(null)
  };

  static async init(
    mode: TransportMode,
    initArgs: any[] = [],
    networkType?: string
  ): Promise<LedgerInternal> {
    const transportIniter = LedgerInternal.transportIniters[mode];
    if (!transportIniter) {
      throw new OWalletError('ledger', 112, `Unknown mode: ${mode}`);
    }

    // already init
    if (this.transport) {
      return;
    }
    let ledger;
    const transport = await transportIniter(...initArgs);
    try {
      if (networkType === 'tron') {
        ledger = new LedgerInternal(new TrxApp(transport));
      } else if (networkType === 'evm') {
        ledger = new LedgerInternal(new EthApp(transport));
      } else {
        ledger = new LedgerInternal(new CosmosApp(transport));
      }
      const versionResponse = await ledger.getVersion();

      // In this case, device is on screen saver.
      // However, it is almost same as that the device is not unlocked to user-side.
      // So, handle this case as initializing failed in `Transport`.
      if (versionResponse.deviceLocked) {
        throw new Error('Device is on screen saver');
      }
      this.transport = transport;
      return ledger;
    } catch (e) {
      console.log(e);
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
    if (!this.ledgerApp) {
      throw new Error('Cosmos App not initialized');
    }

    const { version, device_locked, major, test_mode } =
      await this.ledgerApp.getAppConfiguration();

    return {
      deviceLocked: device_locked,
      major,
      version,
      testMode: test_mode
    };
  }

  async getPublicKey(path: number[] | string): Promise<Uint8Array> {
    if (!this.ledgerApp) {
      throw new Error('Cosmos App not initialized');
    }

    // make compartible with ledger-cosmos-js
    const { publicKey } = await this.ledgerApp.getAddress(
      typeof path === 'string' ? fromString(path).toPathArray() : path,
      'cosmos'
    );

    return Buffer.from(publicKey, 'hex');
  }

  async sign(
    path: number[] | string,
    message: any,
    networkType: NetworkType
  ): Promise<Uint8Array> {
    console.log('sign ledger === ', message, networkType, path);

    const hdPath =
      typeof path === 'string' ? fromString(path).toPathArray() : path;
    const hdPathString =
      typeof path === 'string' ? path : fromPathArray(path).toString();
    if (networkType === 'cosmos') {
      if (!this.ledgerApp) {
        throw new Error('Cosmos App not initialized');
      }

      const { signature } = await this.ledgerApp.sign(hdPath, message);

      // Parse a DER ECDSA signature
      return signatureImport(signature);
    } else if (networkType === 'evm') {
      const rawTxHex = Buffer.from(message).toString('hex');
      const coinType = hdPath[1];
      if (coinType === 195) {
        if (!this.ledgerApp) {
          this.ledgerApp = new TrxApp(LedgerInternal.transport);
        }
        const trxSignature = await this.ledgerApp.signTransaction(
          hdPathString,
          rawTxHex,
          []
        );
        return Buffer.from(trxSignature, 'hex');
      }

      if (!this.ledgerApp) {
        this.ledgerApp = new EthApp(LedgerInternal.transport);
      }
      const signature = await this.ledgerApp.signTransaction(
        hdPathString,
        rawTxHex
      );

      const splitSignature = BytesUtils.splitSignature({
        v: Number(signature.v),
        r: signature.r,
        s: signature.s
      });
      return BytesUtils.arrayify(
        BytesUtils.concat([splitSignature.r, splitSignature.s])
      );
    }
  }

  async close(): Promise<void> {
    await LedgerInternal.transport.close();
    delete LedgerInternal.transport;
  }

  static async isWebHIDSupported(): Promise<boolean> {
    return await TransportWebHID.isSupported();
  }
}
