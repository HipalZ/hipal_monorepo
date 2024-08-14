import { memo, useState } from "react";
import { useLoyalty } from "@/components/store/useLoyalty";

const MemoMaxRedemption = () => {
  const { setMaxRedemption, maxRedemption } = useLoyalty();
  const [error, setError] = useState<string>("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value > 100) {
      setError("Maximum you can apply is 100%");
    } else {
      setError("");
      setMaxRedemption(value); 
    }
  };

  return (
    <section className="px-4">
      <h5 className="mx-4 opacity-60">
        What is the maximum redemption percentage?
      </h5>
      <div className="relative">
        <input
          type="number"
          value={maxRedemption || ""}
          onChange={handleInputChange}
         className="w-[92%] px-10 mx-4 py-3 mt-8 border rounded-xl"
          placeholder="Enter max redemption"
          max={100}
        />
        <small className="absolute text-lg top-11 left-8">%</small>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </section>
  );
};

const MaxRedemption = memo(MemoMaxRedemption);
export default MaxRedemption;
