import { LoyaltySettings, Order } from '@hi/db-models';
import { ethers } from 'ethers';

// 1. CONFIG
const RPC_URL = process.env.MONAD_RPC_URL || 'https://monad-testnet.g.alchemy.com/v2/RkaEGbTvpOeoXdFIB9yoP';
const CONTRACT_ADDRESS = '0xa579bd570Ce455a1f90EB9af25e26A6740E88101';
const PRIVATE_KEY = '0xa66cbce99a89c653ddc9b129b266851b8dd4af4fd8fbd6ca50f036c5a7c62174';

if (!CONTRACT_ADDRESS || !PRIVATE_KEY) {
  console.error('❌ MONAD: Missing ENV variables.');
}

const PROVIDER = new ethers.JsonRpcProvider(RPC_URL);
const WALLET = new ethers.Wallet(PRIVATE_KEY, PROVIDER);

const ABI = [
  'function settleOrder(string _businessId, string _userId, int256 _netPoints, string _orderId) external',
  'function pointsBalance(string _userId) external view returns (uint256)',
];
const CONTRACT = new ethers.Contract(CONTRACT_ADDRESS, ABI, WALLET);

// ==========================================
// 2. QUEUE SYSTEM
// ==========================================
type TxJob = {
  bizId: string;
  userId: string;
  netCoinz: number;
  orderId: string;
};

const TX_QUEUE: TxJob[] = [];
let isProcessingQueue = false;
let localNonce: number | null = null;

export async function triggerBlockchain(bizId: string, userId: string, netCoinz: number, orderId: string) {
  if (bizId !== '66a7fcb5d1afb0385308ba63') return null;

  TX_QUEUE.push({ bizId, userId, netCoinz, orderId });
  console.log(`📥 [Monad] Queued Order ${orderId} (Pos: ${TX_QUEUE.length})`);

  if (!isProcessingQueue) {
    processQueue();
  }
}

async function processQueue() {
  if (isProcessingQueue) return;
  isProcessingQueue = true;

  if (localNonce === null) {
    try {
      localNonce = await PROVIDER.getTransactionCount(WALLET.address, 'pending');
      console.log(`🔄 [Monad] Worker Started. Nonce: ${localNonce}`);
    } catch (e) {
      console.error('❌ [Monad] Failed to sync nonce. Retrying...');
      isProcessingQueue = false;
      setTimeout(processQueue, 2000);
      return;
    }
  }

  while (TX_QUEUE.length > 0) {
    const job = TX_QUEUE[0];
    const { bizId, userId, netCoinz, orderId } = job;

    try {
      console.log(`⚙️ [Monad] Processing ${orderId} | Points: ${netCoinz}`);

      const safeBizId = bizId.toString();
      const safeUserId = userId.toString();

      const pointsInWei = ethers.parseUnits(netCoinz.toFixed(2), 2);

      const method = CONTRACT.getFunction('settleOrder');

      const tx = await method(safeBizId, safeUserId, pointsInWei, orderId, {
        nonce: localNonce,
      });

      console.log(`   ✅ Sent: ${tx.hash}`);

      TX_QUEUE.shift();
      localNonce++;

      await tx.wait();
    } catch (e: any) {
      console.error(`   ❌ [Monad] Error on ${orderId}:`, e.message);

      if (e.message.includes('nonce') || e.message.includes('replacement')) {
        console.warn('   ⚠️ Nonce desync! Re-fetching...');
        localNonce = await PROVIDER.getTransactionCount(WALLET.address, 'pending');
      } else {
        TX_QUEUE.shift();
      }
    }
  }

  isProcessingQueue = false;
}

// ==========================================
// 3. HELPER FUNCTION
// ==========================================
type MonadData = {
  businessId: string | any; // Allow 'any' to accept ObjectId without TS error
  userId: string | any;
  orderId: string;
  claimedCoinz: number;
  signUpBonus?: number;
  earnedCoinz?: number;
};

// Helper to read balance
const getBlockchainBalance = async (userId: string): Promise<number> => {
  try {
    const rawBalance = await CONTRACT.pointsBalance(userId.toString());
    return Number.parseFloat(ethers.formatUnits(rawBalance, 2));
  } catch (e) {
    console.error('⚠️ Failed to fetch balance, assuming 0:', e);
    return 0;
  }
};

export const monadHelperFunction = async (data: MonadData) => {
  let { businessId, orderId, userId, claimedCoinz, earnedCoinz, signUpBonus } = data;
  if (businessId !== '66a7fcb5d1afb0385308ba63') return null;
  businessId = businessId.toString();
  userId = userId.toString();

  const loyalty = await LoyaltySettings.findOne({ businessId }).select('setCashBackPercentage').lean();

  if (!loyalty) {
    console.error(`[Monad] No loyalty settings for: ${businessId}`);
    return;
  }

  let netChangeRaw = -claimedCoinz + (earnedCoinz || 0) + (signUpBonus || 0);

  // 2. Smart Rounding (Safety check against blockchain state)
  const currentBalance = await getBlockchainBalance(userId);
  const targetBalance = Math.round(currentBalance + netChangeRaw);
  const finalAdjustment = targetBalance - currentBalance;

  console.log(`[Monad] Syncing: ${userId} | Adjustment: ${finalAdjustment}`);

  // 3. Update the Order record with the integer
  await Order.findOneAndUpdate({ order_id: orderId }, { $set: { net_points: finalAdjustment, status: 'PAID' } });

  // E. Trigger Blockchain
  triggerBlockchain(businessId, userId, finalAdjustment, orderId);
};
