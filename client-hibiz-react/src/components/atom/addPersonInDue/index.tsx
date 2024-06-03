import axios from '@/axios';
import type React from "react";
import { memo, useEffect, useRef, useState } from "react";
import { useParams } from 'react-router-dom';
import { toast } from "react-toastify";

interface AddPersonInDueProps {
  closeModal: () => void;
}

const AddPersonInDue: React.FC<AddPersonInDueProps> = memo(({ closeModal }) => {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const {businessId} = useParams<{businessId:string}>();
  const [isLoading, setIsLoading] = useState(false);
  const addPerson = async () => {
    if (inputValue.trim() === "") {
      toast.error("Please enter a name");
      return;
    }
    setIsLoading(true);

    const config = {
      method: "POST",
      url: `/v1/payments/Create/Dues`,
      data: {
        businessId: businessId,
        duesPersonNames: inputValue,
      },
    };

    try {
      const response = await axios(config);
      if(response){
        setInputValue("");
        toast.success("Person added successfully");
        closeModal();
      }
    } catch (error) {
      console.error("Error adding person:", error);
      toast.error("Error adding person. Please try again later.");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const handleFocus = () => {
      if (inputRef.current) {
        inputRef.current.scrollIntoView({ behavior: "smooth" });
      }
    };

    inputRef.current?.addEventListener("focus", handleFocus);

    return () => {
      inputRef.current?.removeEventListener("focus", handleFocus);
    };
  }, []);

  return (
    <div className="bg-[#f5f5f5] p-6 rounded-t-[1.5rem]">
      <h3 className="text-xl mb-4 font-medium text-[#2B354D]">
        Add a new person
      </h3>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value.toLowerCase())}
        className="border px-3 py-2 rounded mb-2 w-full focus:border focus:border-[#2B354D] focus:outline-none"
        placeholder="Enter Name"
        maxLength={50}
      />
      <button
        type='button'
        onClick={addPerson}
        className={`${isLoading ? 'pointer-events-none opacity-50' : ''} w-full mt-6 mx-auto on_active_bounce text-white bg-[#2B354D] px-4 py-2 rounded-lg`}
      >
        {isLoading ? 'Loading...' : 'Add'}
      </button>
    </div>
  );
});

export default AddPersonInDue;
