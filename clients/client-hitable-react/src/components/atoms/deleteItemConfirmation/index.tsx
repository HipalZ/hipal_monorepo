import type React from "react";
import { useEffect, useRef } from "react";

const DeleteConfirmationModal = () => {
	const inputRef = useRef<HTMLInputElement>(null);

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
		<div ref={inputRef} className="bg-secondary p-6 rounded-t-[1.5rem] ">
			<h3 className="text-xl mb-2 font-medium text-[#2B354D]">
				Do you want to delete ?
			</h3>
			<p className="text-sm mb-4 opacity-80 text-[#2B354D] pb-12">
				This action cannot be undone.
			</p>
		</div>
	);
};

export default DeleteConfirmationModal;
