import { memo, useState } from "react";
import { useLoyalty } from "@/components/store/useLoyalty";

const MemoCoinzBack = () => {
  const { coinzBack, setCoinzBack } = useLoyalty();
  const [error, setError] = useState<string>("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value > 100) {
      setError("Maximum you can apply is 100%");
    } else {
      setError("");
      setCoinzBack(value);
    }
  };

  return (
    <section className="px-4">
      <h5 className="mx-4 opacity-60">
        How many coinz back do your customers get on each purchase?
      </h5>
      <div className="relative">
        <input
          type="number"
          value={coinzBack}
          onChange={handleInputChange}
          className="w-[92%] px-10 py-3 mx-4 mt-8 border rounded-xl"
          placeholder="Enter coinz back percentage"
          max={100}
        />
        <small className="absolute text-lg top-11 left-8">%</small>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </section>
  );
};

const CoinzBack = memo(MemoCoinzBack);

export default CoinzBack;
