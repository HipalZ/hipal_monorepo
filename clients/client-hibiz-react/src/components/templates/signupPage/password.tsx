import Hand from "@/assets/login/hand.png";
import useLoginStore from "@/components/store/useLogin";
import { cn } from "@/components/utils/helper";
import { useState } from "react";
import { LuArrowLeft } from "react-icons/lu";

const Password = () => {
	const { step, setStep } = useLoginStore();
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const goBack = () => {
		setStep(step - 1);
	};
	const handlePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    };

    const handleConfirmPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(e.target.value);
    };

    const saveThePassword = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (password.length < 8 || confirmPassword.length < 8) {
            alert("Password must be at least 8 characters long");
            return;
        }
        if (password === confirmPassword) {
                setStep(step + 1);
        } else {
            alert("Password does not match");
        }
    };

    return (
        <form onSubmit={saveThePassword}>
            <img
                className="absolute left-0 right-0 m-auto -top-[6.5rem]"
                width={63}
                height={73}
                src={Hand}
                alt="Hipal_hand"
            />
            <h3
                onClick={goBack}
                className="flex items-center font-semibold leading-8 text-[#1C4EFF]"
            >
                <LuArrowLeft size={16} />
                &nbsp; Back
            </h3>
            <h3 className="mt-2 text-xl font-semibold leading-8">
                Security comes first
            </h3>
            <h3 className="flex leading-8">Door without a lock ? !</h3>
            <section className="mt-4 space-y-4">
                <input
                    onChange={handlePassword}
                    value={password}
                    className={cn(
                        "w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent",
                        password.length < 8 ? "border-red-500 focus:ring-red-500" : "border-black focus:ring-black"
                    )}
                    type="password"
                    placeholder="Enter your password"
                    autoComplete="new-password"
                />
                <input
                    onChange={handleConfirmPassword}
                    value={confirmPassword}
                    className={cn(
                        "w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent",
                        confirmPassword.length < 8 ? "border-red-500 focus:ring-red-500" : "border-black focus:ring-black"
                    )}
                    type="password"
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                />
            </section>
            <button type="submit" className="action_btn">
                Set
            </button>
        </form>
    );
};

export default Password;