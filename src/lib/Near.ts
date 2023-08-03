import { WalletSelector } from '@near-wallet-selector/core';
import { Account, InMemorySigner } from 'near-api-js';

export interface NearProvider {
  account: Account;
  signer: InMemorySigner;
  selector: WalletSelector;
}
