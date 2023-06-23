import { LedgerInternal } from '../index';
// class MockCosmosApp {
//   constructor(transport: any) {}
//   getAppConfiguration() {}
// }
// jest.mock('@ledgerhq/hw-app-cosmos', () => {
//   return jest.fn().mockImplementation((transport: any) => {
//     return new MockCosmosApp(transport);
//   });
// });
jest.mock('@ledgerhq/hw-app-cosmos');
jest.mock('@ledgerhq/hw-app-eth');
jest.mock('@ledgerhq/hw-app-trx');
// import TransportWebHID from '@ledgerhq/hw-transport-webhid';
// import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import { OWalletError } from '@owallet/router';
import CosmosApp from '@ledgerhq/hw-app-cosmos';
import EthApp from '@ledgerhq/hw-app-eth';
import TrxApp from '@ledgerhq/hw-app-trx';

// const ledgerInternalMock =
//   jest.createMockFromModule<LedgerInternal>('./ledger-internal');
describe('LedgerInternal', () => {
  let ledgerInternal = new LedgerInternal(null, null);
  afterEach(() => {
    jest.resetAllMocks();

    ledgerInternal = new LedgerInternal(null, null);
  });

  //   it.each([
  //     ['webusb', [], 'cosmos'],
  //     ['webhid', [], 'cosmos'],
  //     ['ble', [], 'cosmos'],
  //     ['webusb', [], 'eth'],
  //     ['webhid', [], 'eth'],
  //     ['ble', [], 'eth'],
  //     ['webusb', [], 'trx'],
  //     ['webhid', [], 'trx'],
  //     ['ble', [], 'trx']
  //   ])('init %s', async (mode: any, initArgs, ledgerAppType: any) => {
  //     LedgerInternal.transportIniters[mode] = jest.fn().mockResolvedValue(null);
  //     await expect(LedgerInternal.init(mode, initArgs, ledgerAppType)).rejects.toThrowError(
  //         new OWalletError('ledger',112, `Unknown mode: ${mode}`)
  //       );
  //     // const rs = await LedgerInternal.init(mode, initArgs, ledgerAppType);
  //     // console.log('rs: ', rs);
  //     // expect(LedgerInternal.transportIniters[mode]).rejects.toHaveBeenCalled();
  //     // expect((LedgerInternal.transportIniters as jest.Mock))
  //     // console.log('spyTransportIniters: ', spyTransportIniters);
  //     // console.log('rs: ', rs);
  //   });
  //   it('test', async () => {

  //     // const res = LedgerInternal.transportIniters['webusb'];

  //     LedgerInternal.transportIniters = {
  //       webusb: jest.fn().mockResolvedValue(null),
  //       webhid: jest.fn().mockResolvedValue(null),
  //       ble: jest.fn().mockResolvedValue(null)
  //     };
  //     const spyGetVersion = jest
  //       .spyOn(LedgerInternal.prototype as any, 'getVersion')
  //       .mockResolvedValue({
  //         deviceLocked: false
  //       });

  //     const rs = await LedgerInternal.init('webusb', [], 'cosmos');
  //     // expect(LedgerInternal.transportIniters).toHaveBeenCalled();
  //     console.log('rs: ', rs);
  //   });
  it('should initialize and return LedgerInternal instance for valid mode and ledgerAppType', async () => {
    // Mock transportIniters
    // LedgerInternal.transportIniters = {
    //   webusb: jest.fn().mockResolvedValue({}),
    //   webhid: jest.fn().mockResolvedValue({}),
    //   ble: jest.fn().mockResolvedValue(null)
    // };
    // // Mock app classes
    // const cosmosAppMock = jest.fn().mockReturnValue({});
    // const ethAppMock = jest.fn().mockReturnValue({});
    // const trxAppMock = jest.fn().mockReturnValue({});
    // // Mock getVersion method
    // jest.spyOn(cosmosAppMock.prototype, 'getVersion').mockResolvedValue({
    //   deviceLocked: false,
    // });
    // jest.spyOn(ethAppMock.prototype, 'getVersion').mockResolvedValue({
    //   deviceLocked: false,
    // });
    // jest.spyOn(trxAppMock.prototype, 'getVersion').mockResolvedValue({
    //   deviceLocked: false,
    // });
    // // Mock constructor of LedgerInternal
    // jest.spyOn(LedgerInternal.prototype, 'getVersion').mockResolvedValue({
    //   deviceLocked: false,
    // } as any);
    // // Mock app instantiation based on ledgerAppType
    // jest.spyOn(CosmosApp as any, 'mockImplementation').mockImplementation(cosmosAppMock);
    // jest.spyOn(EthApp, 'mockImplementation').mockImplementation(ethAppMock);
    // jest.spyOn(TrxApp as any, 'mockImplementation').mockImplementation(trxAppMock);
    // Call the init method
    // jest.spyOn(require('../index'),'LedgerInternal').mockImplementation(()=>{
    // })
    // const ledger = await LedgerInternal.init('webusb', [], 'cosmos');
    // console.log('ledger: ', ledger);
    // Expectations
    // expect(LedgerInternal.transportIniters['webusb']).toHaveBeenCalled();
    // expect(cosmosAppMock).toHaveBeenCalledTimes(1);
    // expect(LedgerInternal.prototype.getVersion).toHaveBeenCalledTimes(1);
    // expect(ledger).toBeInstanceOf(LedgerInternal);
  });
  describe('get version', () => {
    const mockCase = [
      [
        'result_version_1',
        {
          test_mode: false,
          version: '1.0.0',
          device_locked: false,
          major: 1
        }
      ],
      [
        'result_version_2',
        {
          test_mode: true,
          version: '1.0.0',
          device_locked: false,
          major: 1
        }
      ],
      [
        'result_version_3',
        {
          test_mode: false,
          version: '1.0.0',
          device_locked: true,
          major: 1
        }
      ],
      [
        'result_version_4',
        {
          test_mode: true,
          version: '1.0.0',
          device_locked: true,
          major: 1
        }
      ],
      ['err', null]
    ];
    it.each(mockCase)(
      'test case get version with data mock %s',
      async (caseTest: string, expectResult: any) => {
        if (caseTest == 'err') {
          await expect(ledgerInternal.getVersion()).rejects.toThrowError(
            'Cosmos App not initialized'
          );
          return;
        }
        (ledgerInternal['ledgerApp'] as any) = {
          getAppConfiguration: jest.fn().mockResolvedValue({
            version: expectResult.version,
            device_locked: expectResult.device_locked,
            major: expectResult.major,
            test_mode: expectResult.test_mode
          })
        };
        const rs = await ledgerInternal.getVersion();

        expect(rs.deviceLocked).toBe(expectResult.device_locked);
        expect(rs.major).toBe(expectResult.major);
        expect(rs.version).toBe(expectResult.version);
        expect(rs.testMode).toBe(expectResult.test_mode);
      }
    );
  });
  describe('getPublicKey', () => {
    // afterEach(() => {
    //   jest.resetAllMocks();
    // });
    it.each([['cosmos'], ['eth'], ['trx']])('test err %s', async (type) => {
      (ledgerInternal['type'] as any) = type;
      const mockPathNumber = [44, 118, 0, 0, 0];
      await expect(ledgerInternal.getPublicKey(mockPathNumber)).rejects.toThrow(
        `${ledgerInternal['LedgerAppTypeDesc']} not initialized`
      );
    });
  });

  describe('init', () => {
    it.each([
      [
        'webusb-cosmos',
        'webusb',
        [],
        'cosmos',
        {
          deviceLocked: false,
          major: 12,
          version: '1.2',
          testMode: true
        }
      ],
      [
        'webhid-cosmos',
        'webhid',
        [],
        'cosmos',
        {
          deviceLocked: true,
          major: 1,
          version: '1.2',
          testMode: true
        }
      ],
      [
        'ble-cosmos',
        'ble',
        [],
        'cosmos',
        {
          deviceLocked: false,
          major: 1,
          version: '1.2',
          testMode: false
        }
      ],
      [
        'webusb-eth',
        'webusb',
        [],
        'eth',
        {
          deviceLocked: true,
          major: 1,
          version: '1.2',
          testMode: true
        }
      ],
      [
        'webhid-eth',
        'webhid',
        [],
        'eth',
        {
          deviceLocked: false,
          major: 1,
          version: '1.2',
          testMode: false
        }
      ],
      [
        'ble-eth',
        'ble',
        [],
        'eth',
        {
          deviceLocked: false,
          major: 3,
          version: '1.2',
          testMode: true
        }
      ],
      [
        'webusb-trx',
        'webusb',
        [],
        'trx',
        {
          deviceLocked: false,
          major: 12,
          version: '1.4',
          testMode: true
        }
      ],
      [
        'webhid-trx',
        'webhid',
        [],
        'trx',
        {
          deviceLocked: false,
          major: 1,
          version: '1.5',
          testMode: true
        }
      ],
      [
        'ble-trx',
        'ble',
        [],
        'trx',
        {
          deviceLocked: false,
          major: 1,
          version: '2.2',
          testMode: true
        }
      ],
      [
        'transportIniterIsNull',
        'inValid',
        [],
        null,
        {
          deviceLocked: false,
          major: 1,
          version: '4.2',
          testMode: true
        }
      ]
    ])(
      'init %s',
      async (
        caseTest: string,
        mode: any,
        initArgs: any,
        ledgerAppType: any,
        versionResponse: {
          deviceLocked: boolean;
          major: number;
          version: string;
          testMode: boolean;
        }
      ) => {
        const TransportWebUSB = jest.createMockFromModule<
          typeof import('@ledgerhq/hw-transport-webusb')
        >('@ledgerhq/hw-transport-webusb');
        const TransportWebHID = jest.createMockFromModule<
          typeof import('@ledgerhq/hw-transport-webhid')
        >('@ledgerhq/hw-transport-webhid');

        LedgerInternal.transportIniters = {
          webusb: jest.fn().mockResolvedValue(caseTest),
          webhid: jest.fn().mockResolvedValue(caseTest),
          ble: jest.fn().mockResolvedValue(caseTest)
        };
        if (caseTest === 'transportIniterIsNull') {
          await expect(
            LedgerInternal.init(mode, initArgs, ledgerAppType)
          ).rejects.toThrow(
            new OWalletError('ledger', 112, `Unknown mode: ${mode}`)
          );
          return;
        }
        const spyTransportIniter = jest.spyOn(
          LedgerInternal.transportIniters,
          mode
        );
        const spyLedger = jest
          .spyOn(LedgerInternal.prototype, 'getVersion')
          .mockResolvedValue({
            deviceLocked: versionResponse.deviceLocked,
            major: versionResponse.major,
            version: versionResponse.version,
            testMode: versionResponse.testMode
          });
        if (caseTest === 'webhid-cosmos') {
          await expect(
            LedgerInternal.init(mode, initArgs, ledgerAppType)
          ).rejects.toThrow('transport.close is not a function');
          return;
        }
        const rs = await LedgerInternal.init(mode, initArgs, ledgerAppType);
        expect(spyTransportIniter).toHaveBeenCalled();
        expect(spyTransportIniter).toHaveBeenCalledWith(...initArgs);
        if (ledgerAppType === 'trx') {
          expect(TrxApp).toHaveBeenCalled();
          expect(TrxApp).toHaveBeenCalledTimes(1);
          expect(TrxApp).toHaveBeenCalledWith(caseTest);
        } else if (ledgerAppType === 'eth') {
          expect(EthApp).toHaveBeenCalled();
          expect(EthApp).toHaveBeenCalledTimes(1);
          expect(EthApp).toHaveBeenCalledWith(caseTest);
        } else if (ledgerAppType === 'cosmos') {
          expect(CosmosApp).toHaveBeenCalled();
          expect(CosmosApp).toHaveBeenCalledTimes(1);
          expect(CosmosApp).toHaveBeenCalledWith(caseTest);
          expect(spyLedger).toHaveBeenCalled();
          expect(spyLedger).toHaveBeenCalledTimes(1);
        }
      }
    );
  });
});
