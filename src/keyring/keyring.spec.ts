import { Hash } from '@owallet/crypto';
import { privateToAddress, privateToPublic, ecsign } from 'ethereumjs-util';

describe('Test ether utils', () => {
  it('test keccak256', async () => {
    expect(
      Buffer.from(Hash.keccak256(Buffer.from('abcdef'))).toString('hex')
    ).toEqual(
      'acd0c377fe36d5b209125185bc3ac41155ed1bf7103ef9f0c2aff4320460b6df'
    );
  });

  it('test wallet', async () => {
    const privateKey = Buffer.from(
      '4975143b17cb704090c925ed228d76b90f4c642bcad616439c7b7daa432d9a3f',
      'hex'
    );

    expect('0x993d06fc97f45f16e4805883b98a6c20bab54964').toEqual(
      '0x' + privateToAddress(privateKey).toString('hex')
    );

    expect(
      '0x0487e5c45ea6075bddce401529d78a7426e85c58faae1abd7be09308fdaf4382dc3518d6d1a419dccf8becf8850b7a1c979ec73401fabed52d1e300f111f1d3de5'
    ).toEqual('0x04' + privateToPublic(privateKey).toString('hex'));

    const hash = Buffer.from(
      'acd0c377fe36d5b209125185bc3ac41155ed1bf7103ef9f0c2aff4320460b6df',
      'hex'
    );

    const sig = ecsign(hash, privateKey);

    console.log(
      '7e1980a2258f181f4a38d35d41e34c99bc2fe10ea71630ea366e97fcd964e7fe',
      sig.r.toString('hex')
    );
  });
});
