import { memo, useState } from "react";
import { useLoyalty } from "@/components/store/useLoyalty";

const MemoSignupBonus = () => {
  const { signupBonus, setSignupBonus } = useLoyalty();
  const [error, setError] = useState<string>("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value > 4999) {
      setError("Maximum you can apply is 4999");
    } else {
      setError("");
      setSignupBonus(value);
    }
  };

  return (
    <section className="px-4">
      <h5 className="mx-4 text-sm opacity-60">
        How much coinz do your customers get at the very first timeHow much
        coinz do your{" "}
      </h5>
      <div className="relative">
        <input
          type="number"
          value={signupBonus}
          onChange={handleInputChange}
          className="w-[92%] px-8 py-3 mx-4 mt-8 border rounded-xl"
          placeholder="Enter signup bonus"
          max={4999}
          maxLength={4}
        />
        <small className="absolute text-xl top-11 left-8">₹</small>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </section>
  );
};

const SignupBonus = memo(MemoSignupBonus);

export default SignupBonus;
