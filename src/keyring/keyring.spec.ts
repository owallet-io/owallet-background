import { keccak256 } from '@ethersproject/keccak256';

describe('Test ether utils', () => {
  it('test keccak256', async () => {
    console.log(keccak256(Buffer.from('abcdef')));
  });
});
