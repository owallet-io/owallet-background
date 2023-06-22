import { EmbedChainInfos } from '@owallet/common';
import { BackgroundTxService } from '../service';
import { TendermintTxTracer } from '@owallet/cosmos';
const mockTx = '250001000192CD0000002F6D6E742F72';
const mockChainInfo = EmbedChainInfos[0];
const expectTx = Buffer.from(mockTx, 'hex');
describe('service', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  const paramsCaseSendTx = [
    [
      'isProtoTx',
      expectTx,
      'testnet',
      Buffer.from(mockTx),
      'async',
      {
        data: {
          tx_response: {
            code: 0,
            txhash: mockTx,
            raw_log: ''
          }
        }
      },
      {
        param1: '/cosmos/tx/v1beta1/txs',
        param2: {
          mode: 'BROADCAST_MODE_ASYNC',
          tx_bytes: 'MjUwMDAxMDAwMTkyQ0QwMDAwMDAyRjZENkU3NDJGNzI='
        }
      }
    ],
    [
      'NotIsProtoTx',
      expectTx,
      'testnet',
      mockTx,
      'async',
      {
        data: {
          code: 0,
          txhash: mockTx
        }
      },
      {
        param1: '/txs',
        param2: {
          mode: 'async',
          tx: mockTx
        }
      }
    ],
    [
      `throw_tx_response`,
      'err_raw_log',
      'testnet',
      mockTx,
      'async',
      {
        data: {
          code: 1,
          raw_log: 'err_raw_log'
        }
      },
      {
        param1: '/txs',
        param2: {
          mode: 'async',
          tx: mockTx
        }
      }
    ]
  ];

  const backgroundTxService = new BackgroundTxService(null, null, null, null);
  it.each(paramsCaseSendTx)(
    'sendTx with case %s',
    async (
      caseTest,
      expectResult,
      chainId: any,
      tx: unknown,
      mode: any,
      txResponse: any,
      paramsPost: any
    ) => {
      Object.defineProperty(backgroundTxService, 'chainsService', {
        value: { getChainInfo: jest.fn().mockResolvedValue(mockChainInfo) }
      });
      Object.defineProperty(backgroundTxService, 'notification', {
        value: { create: jest.fn() }
      });
      const spyPostAxios = jest
        .spyOn(require('axios'), 'create')
        .mockReturnValue({
          post: jest.fn().mockResolvedValue(txResponse)
        });
      const spyProcessTxError = jest
        .spyOn(BackgroundTxService as any, 'processTxErrorNotification')
        .mockReturnValue(true);
      if (caseTest == 'throw_tx_response') {
        await expect(() =>
          backgroundTxService.sendTx(chainId, tx, mode)
        ).rejects.toThrow('err');
        expect(spyProcessTxError).toHaveBeenCalled();
        return;
      }
      const spyTraceTx = jest
        .spyOn(TendermintTxTracer.prototype, 'traceTx')
        .mockResolvedValue(mockTx);
      const spyClose = jest
        .spyOn(TendermintTxTracer.prototype, 'close')
        .mockReturnValue(true as any);

      const spyGetChainInfo = jest
        .spyOn(backgroundTxService['chainsService'], 'getChainInfo')
        .mockResolvedValue(mockChainInfo as any);
      const spyProcessTxResult = jest
        .spyOn(BackgroundTxService as any, 'processTxResultNotification')
        .mockReturnValue(true);
      const rs = await backgroundTxService.sendTx(chainId, tx, mode);
      expect(rs).toEqual(expectResult);
      //   console.log('rs: ', backgroundTxService.sendTx.prototype.params);
      expect(spyGetChainInfo).toHaveBeenCalled();
      expect(spyGetChainInfo).toHaveBeenCalledWith(chainId);
      expect(backgroundTxService['notification'].create).toHaveBeenCalled();
      expect(backgroundTxService['notification'].create).toHaveBeenCalledWith({
        iconRelativeUrl: 'assets/orai_wallet_logo.png',
        title: 'Tx is pending...',
        message: 'Wait a second'
      });
      expect(spyPostAxios).toHaveBeenCalled();
      expect(spyPostAxios.mock.results[0].value.post).toHaveBeenCalled();
      expect(spyPostAxios.mock.results[0].value.post).toHaveBeenCalledWith(
        paramsPost.param1,
        paramsPost.param2
      );
      expect(spyTraceTx).toHaveBeenCalled();
      expect(spyTraceTx).toHaveBeenCalledWith(expectResult);
      expect(spyClose).toHaveBeenCalled();
      expect(spyProcessTxResult).toHaveBeenCalled();
      expect(spyProcessTxResult).toHaveBeenCalledWith(
        backgroundTxService['notification'],
        mockTx
      );
    }
  );
});
