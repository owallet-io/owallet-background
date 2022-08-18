import Transport from '@ledgerhq/hw-transport';
import CosmosApp from '@ledgerhq/hw-app-cosmos/src/Cosmos';
import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import { signatureImport } from 'secp256k1';
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

export class LedgerInternal {
  constructor(private readonly cosmosApp: CosmosApp) {}

  static transportIniters: Record<TransportMode, TransportIniter> = {
    webusb: TransportWebUSB.create.bind(TransportWebUSB),
    webhid: TransportWebHID.create.bind(TransportWebHID),
    // implemented in ReactNative
    ble: () => Promise.resolve(null)
  };

  static async init(
    mode: TransportMode,
    initArgs: any[] = []
  ): Promise<LedgerInternal> {
    const transportIniter = LedgerInternal.transportIniters[mode];
    if (!transportIniter) {
      throw new OWalletError('ledger', 112, `Unknown mode: ${mode}`);
    }

    const transport = await transportIniter(...initArgs);
    try {
      console.log('return ledger 1');
      const cosmosApp = new CosmosApp(transport);
      console.log('return ledger 2');
      const ledger = new LedgerInternal(cosmosApp);
      console.log('return ledger 3');
      const versionResponse = await ledger.getVersion();
      console.log('return ledger 4');

      // In this case, device is on screen saver.
      // However, it is almost same as that the device is not unlocked to user-side.
      // So, handle this case as initializing failed in `Transport`.
      if (versionResponse.deviceLocked) {
        throw new Error('Device is on screen saver');
      }

      console.log('return ledger 5');
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
    if (!this.cosmosApp) {
      throw new Error('Cosmos App not initialized');
    }
    console.log('getversion 1');
    const { version, device_locked, major, test_mode } =
      await this.cosmosApp.getAppConfiguration();

    console.log('getversion 2');

    return {
      deviceLocked: device_locked,
      major,
      version,
      testMode: test_mode
    };
  }

  async getPublicKey(path: number[] | string): Promise<Uint8Array> {
    if (!this.cosmosApp) {
      throw new Error('Cosmos App not initialized');
    }

    // make compartible with ledger-cosmos-js
    const { publicKey } = await this.cosmosApp.getAddress(
      typeof path === 'string' ? fromString(path).toPathArray() : path,
      'cosmos'
    );

    return Buffer.from(publicKey, 'hex');
  }

  async sign(
    path: number[] | string,
    message: Uint8Array
  ): Promise<Uint8Array> {
    if (!this.cosmosApp) {
      throw new Error('Cosmos App not initialized');
    }

    const { signature } = await this.cosmosApp.sign(
      typeof path === 'string' ? fromString(path).toPathArray() : path,
      message
    );

    // Parse a DER ECDSA signature
    return signatureImport(signature);
  }

  async close(): Promise<void> {
    return await this.cosmosApp.transport.close();
  }

  static async isWebHIDSupported(): Promise<boolean> {
    return await TransportWebHID.isSupported();
  }
}
