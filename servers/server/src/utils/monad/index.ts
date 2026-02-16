import { LoyaltySettings } from "@hi/db-models";
import { ethers } from "ethers";

// 1. CONFIG: Use Env Vars (Don't hardcode keys!)
const RPC_URL = process.env.MONAD_RPC_URL || "https://testnet-rpc.monad.xyz/";
const CONTRACT_ADDRESS = "0x531fa2c7825Be8dFdD7a423610990EE32B6B82e8";
const PRIVATE_KEY =
  "0xa66cbce99a89c653ddc9b129b266851b8dd4af4fd8fbd6ca50f036c5a7c62174";

if (!CONTRACT_ADDRESS || !PRIVATE_KEY) {
  console.error("❌ MONAD: Missing ENV variables.");
}

const PROVIDER = new ethers.JsonRpcProvider(RPC_URL);
const WALLET = new ethers.Wallet(PRIVATE_KEY, PROVIDER);

const ABI = [
  "function settleOrder(string _businessId, string _userId, int256 _netPoints, string _orderId) external",
  "function pointsBalance(string _userId) external view returns (uint256)",
];
const CONTRACT = new ethers.Contract(CONTRACT_ADDRESS, ABI, WALLET);

// ==========================================
// 2. QUEUE SYSTEM (Prevents Nonce Errors)
// ==========================================
type TxJob = {
  bizId: string;
  userId: string;
  netCoinz: number; // Float (e.g. 12.26)
  orderId: string;
};

const TX_QUEUE: TxJob[] = [];
let isProcessingQueue = false;
let localNonce: number | null = null;

export async function triggerBlockchain(
  bizId: string,
  userId: string,
  netCoinz: number, // Changed to number to accept floats
  orderId: string,
) {
  // Push float value to queue
  TX_QUEUE.push({ bizId, userId, netCoinz, orderId });
  console.log(`📥 [Monad] Queued Order ${orderId} (Pos: ${TX_QUEUE.length})`);

  if (!isProcessingQueue) {
    processQueue();
  }
}

async function processQueue() {
  if (isProcessingQueue) return;
  isProcessingQueue = true;

  // Sync Nonce if missing
  if (localNonce === null) {
    try {
      localNonce = await PROVIDER.getTransactionCount(
        WALLET.address,
        "pending",
      );
      console.log(`🔄 [Monad] Worker Started. Nonce: ${localNonce}`);
    } catch (e) {
      console.error("❌ [Monad] Failed to sync nonce. Retrying...");
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

      // const pointsInWei = ethers.parseUnits(netCoinz.toFixed(2), 2);
      const pointsInWei = BigInt(netCoinz);

      const method = CONTRACT.getFunction("settleOrder");

      // Send Transaction
      const tx = await method(bizId, userId, pointsInWei, orderId, {
        nonce: localNonce,
      });

      console.log(`   ✅ Sent: ${tx.hash}`);

      TX_QUEUE.shift(); // Remove job
      localNonce++; // Increment nonce

      // Wait for confirmation (Optional: removing this makes it faster but riskier)
      await tx.wait();
    } catch (e: any) {
      console.error(`   ❌ [Monad] Error on ${orderId}:`, e.message);

      if (e.message.includes("nonce") || e.message.includes("replacement")) {
        console.warn("   ⚠️ Nonce desync! Re-fetching...");
        localNonce = await PROVIDER.getTransactionCount(
          WALLET.address,
          "pending",
        );
      } else {
        // Fatal error (e.g. revert), discard job to unblock queue
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
  businessId: string;
  userId: string;
  orderId: string;
  claimedCoinz: number;
  subTotal: number;
  signUpBonus?: number;
};

export const monadHelperFunction = async (data: MonadData) => {
  const { businessId, orderId, userId, claimedCoinz, subTotal, signUpBonus } =
    data;

  // 1. Fetch Loyalty Settings
  const loyalty = await LoyaltySettings.findOne({ businessId })
    .select("setCashBackPercentage")
    .lean();

  if (!loyalty) {
    console.error(
      `[Monad] No loyalty settings found for business: ${businessId}`,
    );
    return;
  }

  const cashbackPer = loyalty.setCashBackPercentage || 0;
  const subTotalInCents = Math.round(subTotal * 100);
  const claimedInCents = Math.round(claimedCoinz * 100);
  // 2. Calculate earned cashback in cents
  const taxableCents = Math.max(0, subTotalInCents - claimedInCents);
  const earnedCents = Math.round((taxableCents * cashbackPer) / 100);

  // 3. Net Change in Cents
  let netCentsChange = -claimedInCents + earnedCents;
  if (signUpBonus) netCentsChange += Math.round(signUpBonus * 100);

  console.log(
    `[Monad] Order: ${orderId} | Net: ${netCentsChange} (Spent: ${claimedCoinz})`,
  );

  // 5. Trigger Blockchain (Pass the FLOAT, conversion happens in queue)
  triggerBlockchain(
    businessId.toString(),
    userId.toString(),
    netCentsChange,
    orderId,
  );
};
