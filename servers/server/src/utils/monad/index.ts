import { LoyaltySettings } from "@hi/db-models";
import { ethers } from "ethers";

const RPC_URL = "https://testnet-rpc.monad.xyz/";
const CONTRACT_ADDRESS = "0x531fa2c7825Be8dFdD7a423610990EE32B6B82e8";
const PRIVATE_KEY =
  "0xa66cbce99a89c653ddc9b129b266851b8dd4af4fd8fbd6ca50f036c5a7c62174";

const PROVIDER = new ethers.JsonRpcProvider(RPC_URL);
const WALLET = new ethers.Wallet(PRIVATE_KEY, PROVIDER);

const ABI = [
  "function settleOrder(string _businessId, string _userId, int256 _netPoints, string _orderId) external",
  "function pointsBalance(string _userId) external view returns (uint256)",
];
const CONTRACT = new ethers.Contract(CONTRACT_ADDRESS, ABI, WALLET);

export async function triggerBlockchain(
  bizId: string,
  userId: string,
  netCoinz: bigint,
  orderId: string,
) {
  console.log("triggered block chain", bizId, userId, netCoinz, orderId);
  try {
    const method = CONTRACT.getFunction("settleOrder");
    const tx = await method(bizId, userId, BigInt(netCoinz), orderId);
    console.log(`   ✅ Tx Sent: ${tx.hash}`);
  } catch (e) {
    console.error("   ❌ Chain Error:", e); // Printing full error object helps
  }
}

type data = {
  businessId: string;
  userId: string;
  orderId: string;
  claimedCoinz: number;
  subTotal: number;
  signUpBonus?: number;
};
export const monadHelperFunction = async (data: data) => {
  console.log("data", data);
  const { businessId, orderId, userId, claimedCoinz, subTotal, signUpBonus } =
    data;
  const existingLoyalty = await LoyaltySettings.findOne({
    businessId,
  })
    .select("setCashBackPercentage")
    .lean();
  if (!existingLoyalty) {
    console.log("No loyalty settings found for this business");
    return;
  }
  const cashbackPer = existingLoyalty.setCashBackPercentage || 0;
  const taxableAmount = Math.max(0, subTotal - claimedCoinz);
  const cashbackCoinz = Math.floor((taxableAmount * cashbackPer) / 100);
  let netCoinz = -claimedCoinz + cashbackCoinz;
  if (signUpBonus && signUpBonus > 0) {
    netCoinz = signUpBonus;
  }
  console.log("netCoinz", netCoinz);
  await triggerBlockchain(
    businessId.toString(),
    userId.toString(),
    BigInt(netCoinz),
    orderId,
  );
};
