import { memo, useState, useEffect } from "react";
import { useLoyalty } from "@/components/store/useLoyalty";

const MemoResetExpiry = () => {
  const { resetExpiry, setResetExpiry, loyaltyStartDate, setLoyaltyStartDate } = useLoyalty();
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  console.log("resetExpiry", resetExpiry, "loyaltyStartDate", loyaltyStartDate);

  useEffect(() => {
    if (resetExpiry && loyaltyStartDate) {
      const expiryDate = new Date(resetExpiry ); // Convert resetExpiry to milliseconds
      const currentDate = new Date();
      const timeDifference = expiryDate.getTime() - currentDate.getTime();
      const daysLeft = Math.ceil(timeDifference / ( 1000 *3600 * 24)); // Convert milliseconds to days
      setDaysRemaining(daysLeft);

      // Determine the closest predefined option based on the difference in years or months
      const yearsDiff = expiryDate.getFullYear() - currentDate.getFullYear();
      const monthsDiff = expiryDate.getMonth() - currentDate.getMonth() + yearsDiff * 12;

      if (monthsDiff === 6) setSelectedOption("6 months");
      else if (yearsDiff === 1) setSelectedOption("1 year");
      else if (yearsDiff === 2) setSelectedOption("2 years");
      else if (yearsDiff === 3) setSelectedOption("3 years");
      else if (yearsDiff === 5) setSelectedOption("5 years");
    }
  }, [resetExpiry, loyaltyStartDate]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedOption(value);

    const currentDate = new Date();
    if (!loyaltyStartDate) {
      setLoyaltyStartDate(Math.floor(currentDate.getTime())); // Save start date as Unix timestamp in seconds
    }

    let futureDate = new Date(currentDate); // Clone the current date
    switch (value) {
      case "6 months":
        futureDate.setMonth(currentDate.getMonth() + 6);
        if (futureDate.getMonth() < (currentDate.getMonth() + 6) % 12) {
          futureDate.setDate(0); // Adjust if the new month has fewer days
        }
        break;
      case "1 year":
        futureDate.setFullYear(currentDate.getFullYear() + 1);
        break;
      case "2 years":
        futureDate.setFullYear(currentDate.getFullYear() + 2);
        break;
      case "3 years":
        futureDate.setFullYear(currentDate.getFullYear() + 3);
        break;
      case "5 years":
        futureDate.setFullYear(currentDate.getFullYear() + 5);
        break;
      default:
        futureDate = currentDate;
    }

    setResetExpiry(Math.floor(futureDate.getTime())); // Save expiry date as Unix timestamp in seconds
  };

  return (
    <section className="px-4">
      <h5 className="mx-4 opacity-60">
        Select how many years ahead should the coinz expiry reset?
      </h5>
      <div className="relative mx-4 mt-8">
        <select
          value={selectedOption}
          onChange={handleSelectChange}
          className="w-full p-3 border rounded-xl"
        >
          <option value="" disabled>Select duration</option>
          <option value="6 months">6 months</option>
          <option value="1 year">1 year</option>
          <option value="2 years">2 years</option>
          <option value="3 years">3 years</option>
          <option value="5 years">5 years</option>
        </select>
      </div>
      {daysRemaining !== null && (
        <p className="mx-4 mt-4 text-sm">
          {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining until expiry
        </p>
      )}
    </section>
  );
};

const ResetExpiry = memo(MemoResetExpiry);

export default ResetExpiry;
