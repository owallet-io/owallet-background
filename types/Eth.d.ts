declare module '@ledgerhq/hw-app-eth' {
  import { BigNumber } from 'bignumber.js';
  import Transport from '@ledgerhq/hw-transport';

  export default class Eth {
    transport: Transport;
    constructor(transport: Transport, scrambleKey?: string);
    /**
     * get Ethereum address for a given BIP 32 path.
     * @param paths a path in BIP 32 format
     * @option boolDisplay optionally enable or not the display
     * @option boolChaincode optionally enable or not the chaincode request
     * @return an object with a publicKey, address and (optionally) chainCode
     * @example
     * eth.getAddress("44'/60'/0'/0/0").then(o => o.address)
     */
    getAddress(
      paths: number[],
      boolDisplay?: boolean,
      boolChaincode?: boolean
    ): Promise<{
      publicKey: string;
      address: string;
      chainCode?: string;
    }>;
    /**
     * You can sign a transaction and retrieve v, r, s given the raw transaction and the BIP 32 path of the account to sign.
     *
     * @param paths: the BIP32 path to sign the transaction on
     * @param rawTxHex: the raw ethereum transaction in hexadecimal to sign
     * @example
     import { ledgerService } from "@ledgerhq/hw-app-eth"
     const tx = "e8018504e3b292008252089428ee52a8f3d6e5d15f8b131996950d7f296c7952872bd72a2487400080"; // raw tx to sign
     const result = eth.signTransaction("44'/60'/0'/0/0", tx);
     console.log(result);
     */
    signTransaction(
      paths: number[],
      rawTxHex: string
    ): Promise<{
      s: string;
      v: string;
      r: string;
    }>;

    /**
     */
    getAppConfiguration(): Promise<{
      arbitraryDataEnabled: number;
      erc20ProvisioningNecessary: number;
      starkEnabled: number;
      version: string;
    }>;
    /**
    * You can sign a message according to eth_sign RPC call and retrieve v, r, s given the message and the BIP 32 path of the account to sign.
    * @example
    eth.signPersonalMessage("44'/60'/0'/0/0", Buffer.from("test").toString("hex")).then(result => {
    var v = result['v'] - 27;
    v = v.toString(16);
    if (v.length < 2) {
      v = "0" + v;
    }
    console.log("Signature 0x" + result['r'] + result['s'] + v);
    })
     */
    signPersonalMessage(
      path: string,
      messageHex: string
    ): Promise<{
      v: number;
      s: string;
      r: string;
    }>;
    /**
    * Sign a prepared message following web3.eth.signTypedData specification. The host computes the domain separator and hashStruct(message)
    * @example
    eth.signEIP712HashedMessage("44'/60'/0'/0/0", Buffer.from("0101010101010101010101010101010101010101010101010101010101010101").toString("hex"), Buffer.from("0202020202020202020202020202020202020202020202020202020202020202").toString("hex")).then(result => {
    var v = result['v'] - 27;
    v = v.toString(16);
    if (v.length < 2) {
      v = "0" + v;
    }
    console.log("Signature 0x" + result['r'] + result['s'] + v);
    })
     */
    signEIP712HashedMessage(
      path: string,
      domainSeparatorHex: string,
      hashStructMessageHex: string
    ): Promise<{
      v: number;
      s: string;
      r: string;
    }>;

    /**
     * get Stark public key for a given BIP 32 path.
     * @param path a path in BIP 32 format
     * @option boolDisplay optionally enable or not the display
     * @return the Stark public key
     */
    starkGetPublicKey(path: string, boolDisplay?: boolean): Promise<Buffer>;
    /**
     * sign a Stark order
     * @param path a path in BIP 32 format
     * @option sourceTokenAddress contract address of the source token (not present for ETH)
     * @param sourceQuantization quantization used for the source token
     * @option destinationTokenAddress contract address of the destination token (not present for ETH)
     * @param destinationQuantization quantization used for the destination token
     * @param sourceVault ID of the source vault
     * @param destinationVault ID of the destination vault
     * @param amountSell amount to sell
     * @param amountBuy amount to buy
     * @param nonce transaction nonce
     * @param timestamp transaction validity timestamp
     * @return the signature
     */
    starkSignOrder(
      path: string,
      sourceTokenAddress: string | undefined,
      sourceQuantization: BigNumber,
      destinationTokenAddress: string | undefined,
      destinationQuantization: BigNumber,
      sourceVault: number,
      destinationVault: number,
      amountSell: BigNumber,
      amountBuy: BigNumber,
      nonce: number,
      timestamp: number
    ): Promise<
      | Buffer
      | {
          r: string;
          s: string;
        }
    >;

    /**
     * sign a Stark transfer
     * @param path a path in BIP 32 format
     * @option transferTokenAddress contract address of the token to be transferred (not present for ETH)
     * @param transferQuantization quantization used for the token to be transferred
     * @param targetPublicKey target Stark public key
     * @param sourceVault ID of the source vault
     * @param destinationVault ID of the destination vault
     * @param amountTransfer amount to transfer
     * @param nonce transaction nonce
     * @param timestamp transaction validity timestamp
     * @return the signature
     */
    starkSignTransfer(
      path: string,
      transferTokenAddress: string | undefined,
      transferQuantization: BigNumber,
      targetPublicKey: string,
      sourceVault: number,
      destinationVault: number,
      amountTransfer: BigNumber,
      nonce: number,
      timestamp: number
    ): Promise<
      | Buffer
      | {
          r: string;
          s: string;
        }
    >;

    /**
     * provide quantization information before singing a deposit or withdrawal Stark powered contract call
     *
     * It shall be run following a provideERC20TokenInformation call for the given contract
     *
     * @param operationContract contract address of the token to be transferred (not present for ETH)
     * @param operationQuantization quantization used for the token to be transferred
     */
    starkProvideQuantum(
      operationContract: string | undefined,
      operationQuantization: BigNumber
    ): Promise<boolean>;
  }
}
