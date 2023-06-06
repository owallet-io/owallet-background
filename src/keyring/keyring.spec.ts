import { Hash } from '@owallet/crypto';

describe('Test ether utils', () => {
  it('test keccak256', async () => {
    expect(Buffer.from(Buffer.from('abcdef')).toString('hex')).toEqual(
      'acd0c377fe36d5b209125185bc3ac41155ed1bf7103ef9f0c2aff4320460b6df'
    );
  });
});
