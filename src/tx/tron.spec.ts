// (globalThis as any).TronWeb = require('tronweb');

// describe('Test ledger app', () => {
//   it('test ledger app type', async () => {
//     const tronWeb = new TronWeb(
//       'https://nile.trongrid.io',
//       'https://nile.trongrid.io'
//     );

//     const privateKey =
//       '4975143b17cb704090c925ed228d76b90f4c642bcad616439c7b7daa432d9a3f';

//     const from = TronWeb.address.fromPrivateKey(privateKey);

//     const transaction = await tronWeb.transactionBuilder.sendTrx(
//       'TZAjoY9H62kHkLkDtMuPc7U86UdqrCT52T',
//       10,
//       from
//     );

//     TronWeb.utils.crypto.signTransaction(privateKey, transaction);

//     const signature = TronWeb.utils.crypto.signBytes(
//       privateKey,
//       Buffer.from(transaction.raw_data_hex, 'hex')
//     );

//     expect(transaction.signature).toEqual([signature]);
//   });
// });
