import { Button } from "@/components/ui/button";
import { useState } from "react";

const SalesFiltes = () => {

    const [selectedPaymentModes, setSelectedPaymentModes] = useState<string[]>([]);
    const [selectedDiscountTypes, setSelectedDiscountTypes] = useState<string[]>([]);
    const [selectedWarnings, setSelectedWarnings] = useState<string[]>([]);
  
     const toggleSelection = (
        value: string,
        selected: string[],
        setSelected: React.Dispatch<React.SetStateAction<string[]>>
      ) => {
        if (selected.includes(value)) {
          setSelected(selected.filter((item) => item !== value));
        } else {
          setSelected([...selected, value]);
        }
      };
  
    const handleApplyFilters = () => {
      console.log("selectedPaymentModes", selectedPaymentModes);
      console.log("selectedDiscountTypes", selectedDiscountTypes);
      console.log("selectedWarnings", selectedWarnings);
    };
  return (
        <div className="p-4 space-y-6">
          <div>
            <h2 className="mb-2 text-lg font-semibold">Payment Mode</h2>
            <div className="flex flex-col space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedPaymentModes.includes("online")}
                  onChange={() =>
                    toggleSelection("online", selectedPaymentModes, setSelectedPaymentModes)
                  }
                />
                <span>Online</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedPaymentModes.includes("offline")}
                  onChange={() =>
                    toggleSelection("offline", selectedPaymentModes, setSelectedPaymentModes)
                  }
                />
                <span>Offline</span>
              </label>
            </div>
          </div>
    
          <div>
            <h2 className="mb-2 text-lg font-semibold">Discount Type</h2>
            <div className="flex flex-col space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedDiscountTypes.includes("Coinz")}
                  onChange={() =>
                    toggleSelection("Coinz", selectedDiscountTypes, setSelectedDiscountTypes)
                  }
                />
                <span>Coinz</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedDiscountTypes.includes("Couponz")}
                  onChange={() =>
                    toggleSelection("Couponz", selectedDiscountTypes, setSelectedDiscountTypes)
                  }
                />
                <span>Couponz</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedDiscountTypes.includes("No Rewardz")}
                  onChange={() =>
                    toggleSelection("No Rewardz", selectedDiscountTypes, setSelectedDiscountTypes)
                  }
                />
                <span>No Rewardz</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedDiscountTypes.includes("Disscount")}
                  onChange={() =>
                    toggleSelection("Disscount", selectedDiscountTypes, setSelectedDiscountTypes)
                  }
                />
                <span>Disscount</span>
              </label>
            </div>
          </div>
    
          <div>
            <h2 className="mb-2 text-lg font-semibold">Warnings</h2>
            <div className="flex flex-col space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedWarnings.includes("Force Settle")}
                  onChange={() =>
                    toggleSelection("Force Settle", selectedWarnings, setSelectedWarnings)
                  }
                />
                <span>Force Settle</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedWarnings.includes("Free Tables")}
                  onChange={() =>
                    toggleSelection("Free Tables", selectedWarnings, setSelectedWarnings)
                  }
                />
                <span>Free Tables</span>
              </label>
            </div>
          </div>
    
          <div className="flex justify-end">
            <Button onClick={handleApplyFilters}>Apply Filters</Button>
          </div>
        </div>
      );
}

export default SalesFiltes
