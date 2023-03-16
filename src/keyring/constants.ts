export const ROUTE = 'keyring';
export const ETHEREUM_BASE_FEE = 1000000000;
export const TYPED_MESSAGE_SCHEMA = {
  type: 'object',
  properties: {
    types: {
      type: 'object',
      additionalProperties: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            type: { type: 'string' }
          },
          required: ['name', 'type']
        }
      }
    },
    primaryType: { type: 'string' },
    domain: { type: 'object' },
    message: { type: 'object' }
  },
  required: ['types', 'primaryType', 'domain', 'message']
};

export const LIST_NETWORK_BY_CHAIN_ID = {
  evm: ['kawaii_6886-1', '0x1ae6', '0x01', '0x38', '0x2b6653dc'],
  cosmos: [
    'Oraichain',
    'Oraichain-testnet',
    'oraibridge-subnet-2',
    'cosmoshub-4',
    'osmosis-1',
    'juno-1'
  ]
};

export const LIST_CHAIN_ID_BY_NETWORK = {
  'kawaii_6886-1': 'evm',
  '0x1ae6': 'evm',
  '0x01': 'evm',
  '0x38': 'evm',
  '0x2b6653dc': 'evm',
  Oraichain: 'cosmos',
  'Oraichain-testnet': 'cosmos',
  'oraibridge-subnet-2': 'cosmos',
  'cosmoshub-4': 'cosmos',
  'osmosis-1': 'cosmos',
  'juno-1': 'cosmos'
};
