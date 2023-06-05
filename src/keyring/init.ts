import { Router } from '@owallet/router';
import {
  CreateMnemonicKeyMsg,
  CreatePrivateKeyMsg,
  GetKeyMsg,
  UnlockKeyRingMsg,
  RequestSignAminoMsg,
  RequestSignDirectMsg,
  LockKeyRingMsg,
  DeleteKeyRingMsg,
  UpdateNameKeyRingMsg,
  ShowKeyRingMsg,
  AddMnemonicKeyMsg,
  AddPrivateKeyMsg,
  GetMultiKeyStoreInfoMsg,
  ChangeKeyRingMsg,
  CreateLedgerKeyMsg,
  AddLedgerKeyMsg,
  GetIsKeyStoreCoinTypeSetMsg,
  SetKeyStoreCoinTypeMsg,
  SetKeyStoreLedgerAddressMsg,
  RestoreKeyRingMsg,
  CheckPasswordMsg,
  ExportKeyRingDatasMsg,
  RequestVerifyADR36AminoSignDoc,
  RequestSignEthereumMsg,
  RequestSignEthereumTypedDataMsg,
  RequestSignReEncryptDataMsg,
  RequestSignDecryptDataMsg,
  RequestPublicKeyMsg,
  ChangeChainMsg,
  RequestSignTronMsg,
  GetDefaultAddressTronMsg
} from './messages';
import { ROUTE } from './constants';
import { getHandler } from './handler';
import { KeyRingService } from './service';

export function init(router: Router, service: KeyRingService): void {
  router.registerMessage(RestoreKeyRingMsg);
  router.registerMessage(DeleteKeyRingMsg);
  router.registerMessage(UpdateNameKeyRingMsg);
  router.registerMessage(ShowKeyRingMsg);
  router.registerMessage(CreateMnemonicKeyMsg);
  router.registerMessage(AddMnemonicKeyMsg);
  router.registerMessage(CreatePrivateKeyMsg);
  router.registerMessage(AddPrivateKeyMsg);
  router.registerMessage(CreateLedgerKeyMsg);
  router.registerMessage(AddLedgerKeyMsg);
  router.registerMessage(LockKeyRingMsg);
  router.registerMessage(UnlockKeyRingMsg);
  router.registerMessage(GetKeyMsg);
  router.registerMessage(RequestSignAminoMsg);
  router.registerMessage(RequestVerifyADR36AminoSignDoc);
  router.registerMessage(RequestSignDirectMsg);
  router.registerMessage(RequestSignEthereumMsg);
  router.registerMessage(RequestSignTronMsg);
  router.registerMessage(RequestSignEthereumTypedDataMsg);
  router.registerMessage(GetDefaultAddressTronMsg);
  router.registerMessage(RequestPublicKeyMsg);
  router.registerMessage(SetKeyStoreLedgerAddressMsg);
  router.registerMessage(RequestSignDecryptDataMsg);
  router.registerMessage(RequestSignReEncryptDataMsg);
  router.registerMessage(GetMultiKeyStoreInfoMsg);
  router.registerMessage(GetDefaultAddressTronMsg);
  router.registerMessage(ChangeKeyRingMsg);
  router.registerMessage(GetIsKeyStoreCoinTypeSetMsg);
  router.registerMessage(SetKeyStoreCoinTypeMsg);
  router.registerMessage(SetKeyStoreLedgerAddressMsg);
  router.registerMessage(CheckPasswordMsg);
  router.registerMessage(ExportKeyRingDatasMsg);

  //
  router.registerMessage(ChangeChainMsg);

  router.addHandler(ROUTE, getHandler(service));
}
