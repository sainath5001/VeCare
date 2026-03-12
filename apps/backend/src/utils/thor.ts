import { ADMIN_PRIVATE_KEY, NETWORK_URL } from '../config';
import { HttpClient, ThorClient, VeChainPrivateKeySigner, VeChainProvider } from '@vechain/sdk-network';
import { VECARE_SOL_ABI, config } from '@repo/config-contract';

export const thor = new ThorClient(new HttpClient(NETWORK_URL), {
  isPollingEnabled: false,
});

// Support Buffer (mnemonic), Uint8Array, or hex string (.env)
const raw = ADMIN_PRIVATE_KEY;
const keyBuf =
  Buffer.isBuffer(raw)
    ? raw
    : typeof raw === 'string'
      ? Buffer.from(raw.replace(/^0x/, ''), 'hex')
      : Buffer.from(raw as Uint8Array);
const signer = new VeChainPrivateKeySigner(keyBuf, new VeChainProvider(thor));

/** For transactions (create campaign, verify, etc.) - requires signer */
export const veCareContract = thor.contracts.load(config.VECARE_CONTRACT_ADDRESS, VECARE_SOL_ABI, signer);

/** For read-only calls (campaign list, getCampaign) - no signer; avoids 0x response on some RPCs */
export const veCareContractReadOnly = thor.contracts.load(config.VECARE_CONTRACT_ADDRESS, VECARE_SOL_ABI);
