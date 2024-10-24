import { memo, useCallback } from "react";
import { useReview } from "@/components/store/useReview";
import BottomButton from "@/components/atom/bottomButton";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import toast from "react-hot-toast";

const MemoAddCoinzReview = () => {
  const {
    coinz,
    password,
    showPassword,
    setCoinz,
    setPassword,
    toggleShowPassword,
  } = useReview();

  const next = useCallback(() => {
    if (!coinz) {
      toast.error("Please enter the amount");
      return;
    }
    if (!password) {
      toast.error("Please enter the password");
      return;
    }

    useReview.getState().setOpen(false);
  }, [password, coinz]);

  return (
    <>
      <section className="px-4 pt-6 pb-[5rem]">
        <h1 className="mb-4 text-2xl font-semibold text-center">Add Coinz</h1>
        <div className="mb-4">
          <h3 className="mb-2 font-semibold opacity-60">Enter coinz</h3>

          <input
            type="tel"
            value={coinz}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              setCoinz(value);
            }}
            placeholder="Insert Coinz"
            min={1}
            max={100000}
            maxLength={6}
            className="w-full px-4 py-2 border rounded-2xl focus:outline-none focus:border-[#7A69FE50] border-gray-300"
          />
        </div>

        <div className="relative mb-4">
          <h3 className="mb-2 font-semibold opacity-60">Enter Password</h3>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            maxLength={20}
            className="w-full px-4 py-2 border rounded-2xl focus:outline-none focus:border-[#7A69FE50] border-gray-300"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center px-4 cursor-pointer top-8"
            onClick={toggleShowPassword}
          >
            {showPassword ? (
              <AiFillEyeInvisible size={20} />
            ) : (
              <AiFillEye size={20} />
            )}
          </button>
        </div>
      </section>
      <BottomButton
        buttons={[
          {
            text: "Apply",
            onClick: next,
          },
        ]}
      />
    </>
  );
};

const AddCoinzReview = memo(MemoAddCoinzReview);
export default AddCoinzReview;
