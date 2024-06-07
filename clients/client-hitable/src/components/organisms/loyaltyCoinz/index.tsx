import { useState } from 'react';
import { BiShoppingBag } from 'react-icons/bi'; // Make sure 'react-icons' is installed

function LoyaltyCoinzUsage({
  userDetails,
  redeemCoins,
  setRedeemCoins,
  setIsCoinzModalOpen,
  setCvv,
  setCoinsToRedeem,
  maxClaimableAmount,
  handleRedeemCoins,
}) {
  const [localCoins, setLocalCoins] = useState<number>();

  const updateTheCoins = (e) => {
    const value = Math.round(Math.min(e.target.value, maxClaimableAmount) * 100) / 100;
    setLocalCoins(value);
    setCoinsToRedeem(value);
  };
  return (
    <div className="pb-[5rem]">
      <div className="px-6 pt-6">
        <h1 className="font-[600] text-[#2C2C2C]">Loyalty coinz usage</h1>
        <div className="flex items-center">
          <div className="my-[1rem] mr-6 flex items-center justify-start">
            <div className="bg-primary text-base-100 flex h-[55px] w-[55px] items-center justify-center rounded-full border text-xl">
              {userDetails?.userName?.[0]}
            </div>
          </div>
          <div>
            <h1 className="text-base font-semibold text-[#2C2C2C]">{userDetails?.userName}</h1>
            <p className="text-base font-[500] text-[#2C2C2C]">{userDetails?.rewards} Coinz</p>
          </div>
        </div>
        <div className="pb-4">
          <div className="pb-4 text-sm font-semibold">Loyalty options</div>
          <button
            type="button"
            className={`${redeemCoins ? 'text-base-100 bg-primary' : 'text-primary'} border-primary mr-4 rounded-3xl border px-3 py-1  text-sm`}
            onClick={() => setRedeemCoins(true)}
          >
            Redeem coinz
          </button>
          <button
            type="button"
            className={`${!redeemCoins ? 'text-base-100 bg-primary' : 'text-primary'} border-primary mr-4 rounded-3xl border px-3 py-1  text-sm`}
            onClick={() => {
              setRedeemCoins(false);
              setIsCoinzModalOpen(false);
              setCvv('');
              setCoinsToRedeem(0);
            }}
          >
            No redeem
          </button>
        </div>
        {redeemCoins && (
          <div>
            <label className="text-sm font-[600] text-[#2C2C2C]">Enter the Hi-CVV</label>
            <input type="text" className="mb-4 mt-2 w-full rounded-xl border border-[#79747E] px-4 py-1.5" onChange={(e) => setCvv(e.target.value)} />
            <label className="text-sm font-[600] text-[#2C2C2C]">Claiming coinz</label>
            <input
              type="number"
              placeholder={`Max: ${Math.ceil(maxClaimableAmount)}`}
              title="Enter the amount of coins to redeem. Values higher than your maximum claimable amount will be adjusted."
              value={localCoins}
              className="mb-4 mt-2 w-full rounded-xl border border-[#79747E] px-4 py-1.5"
              onChange={updateTheCoins}
            />
          </div>
        )}
      </div>
      <div className="bg-primary fixed bottom-0 flex h-16 w-full items-center justify-between px-5">
        <div className="flex items-center">
          <BiShoppingBag color="#fff" size={24} />
          <h1 className="text-base-100 mx-2 text-sm font-semibold">Hi Coinz added</h1>
        </div>
        <button type="button" onClick={handleRedeemCoins} className="text-primary bg-base-100 rounded-full px-9 py-3 font-semibold leading-[1.15rem]">
          Confirm
        </button>
      </div>
    </div>
  );
}

export default LoyaltyCoinzUsage;
