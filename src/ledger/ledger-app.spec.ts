import {
  openTransportReplayer,
  RecordStore
} from '@ledgerhq/hw-transport-mocker';
import Bip32Path from 'bip32-path';
import CosmosApp from '@ledgerhq/hw-app-cosmos';
import EthApp from '@ledgerhq/hw-app-eth';

describe('Test ledger app', () => {
  it('test ledger app type', async () => {
    const ethApp = new EthApp(
      await openTransportReplayer(
        // second is public key return
        RecordStore.fromString(`
        => e002000015058000002c8000003c800000008000000000000000
        <= 4104df00ad3869baad7ce54f4d560ba7f268d542df8f2679a5898d78a690c3db8f9833d2973671cb14b088e91bdf7c0ab00029a576473c0e12f84d252e630bb3809b28436241393833363265313939633431453138363444303932334146393634366433413634383435319000
    `)
      )
    );

    console.log('instance of', ethApp instanceof CosmosApp);

    const ethRet = await ethApp.getAddress("44'/60'/0'/0'/0");
    console.log(ethRet.address);

    const cosmosApp = new CosmosApp(
      await openTransportReplayer(
        // second is public key return
        RecordStore.fromString(`
          => 5504000019046f7261690000008000000080000000800000000000000000
          <= 4104df00ad3869baad7ce54f4d560ba7f268d542df8f2679a5898d78a690c3db8f9833d2973671cb14b088e91bdf7c0ab00029a576473c0e12f84d252e630bb3809b28436241393833363265313939633431453138363444303932334146393634366433413634383435319000
      `)
      )
    );
    const cosmosRet = await cosmosApp.getAddress(
      Bip32Path.fromString("44'/118'/0'/0'/0"),
      'orai'
    );
    console.log(cosmosRet.publicKey);
  });
});
