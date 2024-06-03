import axios from "@/axios";
import React, { memo, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

interface AddPersonInDueProps {
	closeModal: () => void;
}

const CollectionModeComponent: React.FC<AddPersonInDueProps> = memo(({
	closeModal,
}) => {
	const [inputValue, setInputValue] = useState("");
	const [commission, setCommission] = useState<number | 0>(0);
	const [isLoading, setIsLoading] = useState(false);
	const predefinedSuggestions = [
		"zomato",
		"swiggy",
		"phonepe",
		"split payment",
		"cash",
		"google pay",
		"dues"
	];
	const { businessId } = useParams<{ businessId: string }>();
	const inputRef = useRef<HTMLInputElement>(null);
	const handleSuggestionClick = (suggestion: string) => {
		setInputValue(suggestion.toLowerCase());
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

	const addMode = async () => {
		setIsLoading(true);
		if (inputValue.trim() === "") {
			toast.error("Please enter a mode");
			return;
		}
		try {
			await axios.post("/v1/payments/Create/Mode", {
				businessId: businessId,
				mode: inputValue,
				commission: commission,
			});
			toast.success("Mode added successfully!");
			setInputValue("");
			setCommission(0);
			closeModal();
		} catch (error: any) {
			if (error.response && error.response.status === 400) {
				toast.error("This mode already exists");
			} else {
				toast.error("An error occurred while adding the mode");
			}
		}
		setIsLoading(false);
	};

	return (
		<div className="bg-[#f5f5f5] p-6 rounded-t-[1.5rem]">
			<h3 className="text-xl mb-4 font-medium text-[#2B354D]">
				Add a new collection mode
			</h3>
			<input
				ref={inputRef}
				maxLength={50}
				type="text"
				value={inputValue}
				onChange={(e) => setInputValue(e.target.value.toLowerCase())}
				className="border px-3 py-2 rounded mb-4 w-full focus:border focus:border-[#2B354D] focus:outline-none"
				placeholder="Enter mode..."
				required
			/>
			<h3 className="text-md mb-2 font-medium text-[#2B354D]">
				If Commission rate available:
			</h3>
			<div className="relative">
				<input
					type="number"
					value={
						commission !== null && commission !== 0 ? commission.toString() : ""
					}
					onChange={(e) => setCommission(Math.min(Number(e.target.value), 100))}
					className="border px-3 py-2 rounded mb-4 w-full focus:border focus:border-[#2B354D] focus:outline-none"
					placeholder="Enter commission..."
					max={100}
				/>
				<span className="absolute inset-y-0 right-0 flex items-center pr-3 bottom-3 text-md">
					%
				</span>
			</div>
			<span>Suggestion:</span>
			<div className="flex items-center gap-2 mt-4 flex-wrap">
				{predefinedSuggestions.map((suggestion) => (
					<button
						type="button"
						key={suggestion}
						onClick={() => handleSuggestionClick(suggestion)}
						className="px-3 py-2 text-sm font-medium capitalize bg-white rounded-lg on_active_bounce"
					>
						{suggestion}
					</button>
				))}
			</div>
			<button
				type="button"
				onClick={addMode}
				className={`${
					isLoading ? "pointer-events-none opacity-50" : ""
				} w-full mt-6 mx-auto on_active_bounce text-white bg-[#2B354D] px-4 py-2 rounded-lg`}
			>
				{isLoading ? "Loading..." : "Add"}
			</button>
		</div>
	);
});

export default CollectionModeComponent
