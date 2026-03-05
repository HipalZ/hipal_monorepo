import { LoyaltySettings, Order, OutLetInfo } from "@hi/db-models";
import { ethers } from "ethers";

// 1. CONFIG
const RPC_URL =
  process.env.MONAD_RPC_URL ||
  "https://monad-testnet.g.alchemy.com/v2/RkaEGbTvpOeoXdFIB9yoP";
const CONTRACT_ADDRESS =
  process.env.MONAD_CONTRACT_ADDRESS ||
  "0xDA768CCA70903c60471CdEAbC40293d021E3DfE9"; //@change - new address for V3 deployment
const PRIVATE_KEY =
  process.env.MONAD_PRIVATE_KEY ||
  "0xa66cbce99a89c653ddc9b129b266851b8dd4af4fd8fbd6ca50f036c5a7c62174";

if (!CONTRACT_ADDRESS || !PRIVATE_KEY) {
  console.error("❌ MONAD: Missing ENV variables.");
}

const PROVIDER = new ethers.JsonRpcProvider(RPC_URL);
const WALLET = new ethers.Wallet(PRIVATE_KEY, PROVIDER);

//@change
const ABI = [
  "function settleOrder(string _businessId, string _loyaltyId, string _userId, int256 _netPoints, string _orderId) external",
  "function pointsBalance(string arg0, string arg1) external view returns (uint256)",
  "event OrderSettled(string businessId, string loyaltyId, string userId, string orderId, int256 netCoinz, uint256 newBalance)",
];
const CONTRACT = new ethers.Contract(CONTRACT_ADDRESS, ABI, WALLET);

// ==========================================
// 2. QUEUE SYSTEM
// ==========================================
type TxJob = {
  bizId: string;
  loyaltyId: string; // @change
  userId: string;
  netCoinz: number;
  orderId: string;
};

const TX_QUEUE: TxJob[] = [];
let isProcessingQueue = false;
let localNonce: number | null = null;

export async function triggerBlockchain(
  bizId: string,
  loyaltyId: string, //@change
  userId: string,
  netCoinz: number,
  orderId: string,
) {
  //@change
  const outlet = await OutLetInfo.findOne({
    businessId: bizId,
  });

  console.log("web3Ledger", outlet?.web3Ledger);
  if (!outlet?.web3Ledger) return;

  TX_QUEUE.push({ bizId, loyaltyId, userId, netCoinz, orderId });
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
    const { bizId, loyaltyId, userId, netCoinz, orderId } = job;

    try {
      console.log(`⚙️ [Monad] Processing ${orderId} | Points: ${netCoinz}`);

      const safeBizId = bizId.toString();
      const safeLoyaltyId = loyaltyId.toString();
      const safeUserId = userId.toString();

      // V3 utilizes 2 decimal places
      const pointsInWei = ethers.parseUnits(netCoinz.toFixed(2), 2);

      const method = CONTRACT.getFunction("settleOrder");

      // @change - added loyaltyId to the method call
      const tx = await method(
        safeBizId,
        safeLoyaltyId,
        safeUserId,
        pointsInWei,
        orderId,
        {
          nonce: localNonce,
        },
      );

      console.log(`   ✅ Sent: ${tx.hash}`);

      TX_QUEUE.shift();
      localNonce++;

      await tx.wait();
    } catch (e: any) {
      //@change
      if (
        e.message.includes("0x26083180") ||
        e.message.includes("unknown custom error")
      ) {
        console.error(
          `   ❌ DENIED: Insufficient Points for User '${userId}' at Brand '${loyaltyId}'`,
        );
        TX_QUEUE.shift();
      } else {
        const cleanError =
          e.shortMessage ||
          e.info?.error?.message ||
          e.message ||
          "RPC connection failed";
        console.error(`   ❌ Network Error on ${orderId}:`, cleanError);

        if (
          e.message.includes("nonce") ||
          e.message.includes("replacement") ||
          e.message.includes("priority")
        ) {
          console.warn("   ⚠️ Mempool jam! Re-fetching nonce...");
          localNonce = await PROVIDER.getTransactionCount(
            WALLET.address,
            "pending",
          );
        } else {
          TX_QUEUE.shift();
        }
      }
    }
  }

  isProcessingQueue = false;
}

// ==========================================
// 3. HELPER FUNCTION
// ==========================================
type MonadData = {
  businessId: string | any;
  loyaltyId?: string | any; // @change - made optional for V3 fallback logic
  userId: string | any;
  orderId: string;
  claimedCoinz: number;
  signUpBonus?: number;
  earnedCoinz?: number;
};

//@change
const getBlockchainBalance = async (
  userId: string,
  loyaltyId: string,
): Promise<number> => {
  try {
    const rawBalance = await CONTRACT.pointsBalance(
      userId.toString(),
      loyaltyId.toString(),
    );
    return Number.parseFloat(ethers.formatUnits(rawBalance, 2));
  } catch (e) {
    console.error("⚠️ Failed to fetch balance, assuming 0:", e);
    return 0;
  }
};

export const monadHelperFunction = async (data: MonadData) => {
  let {
    businessId,
    loyaltyId,
    orderId,
    userId,
    claimedCoinz,
    earnedCoinz,
    signUpBonus,
  } = data;

  const outlet = await OutLetInfo.findOne({
    businessId,
  });
  console.log("web3Ledger", outlet?.web3Ledger);
  if (!outlet?.web3Ledger) return;

  businessId = businessId.toString();
  userId = userId.toString();

  const loyalty = await LoyaltySettings.findOne({ businessId })
    .select("setCashBackPercentage")
    .lean();

  if (!loyalty) {
    console.error(`[Monad] No loyalty settings for: ${businessId}`);
    return;
  }

  let netChangeRaw = -claimedCoinz + (earnedCoinz || 0) + (signUpBonus || 0);

  // 2. Smart Rounding against the Brand ledger
  const currentBalance = await getBlockchainBalance(userId, loyaltyId);
  const targetBalance = Math.round(currentBalance + netChangeRaw);
  const finalAdjustment = targetBalance - currentBalance;

  console.log(
    `[Monad] Syncing: ${userId} at ${loyaltyId} | Adjustment: ${finalAdjustment}`,
  );

  // 3. Update the Order record
  await Order.findOneAndUpdate(
    { order_id: orderId },
    { $set: { net_points: finalAdjustment, status: "PAID" } },
  );

  // E. Trigger V3 Blockchain Queue
  triggerBlockchain(businessId, loyaltyId, userId, finalAdjustment, orderId);
};
