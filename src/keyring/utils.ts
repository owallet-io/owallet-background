export const convertEthSignature = (signature: {
  s: string;
  r: string;
  recoveryParam?: number;
}) => {
  return Buffer.concat([
    Buffer.from(signature.r.replace('0x', ''), 'hex'),
    Buffer.from(signature.s.replace('0x', ''), 'hex'),
    // The metamask doesn't seem to consider the chain id in this case... (maybe bug on metamask?)
    signature.recoveryParam
      ? Buffer.from('1c', 'hex')
      : Buffer.from('1b', 'hex')
  ]);
};
