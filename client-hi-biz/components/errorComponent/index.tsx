import Image from "next/image";
import Hi from "@/assets/svg/hi.svg";
import { useSelectedIcon } from "../store/useSelectedIcon";
import { useRouter } from "next/router";
import { memo } from "react";

const ErrorComponent = ({refetch}:any) => {
    const router = useRouter();
    const setSelectedSubIcon = useSelectedIcon((s) => s.setSelectedSubIcon);
	const setSelectedIcon = useSelectedIcon((s) => s.setSelectedIcon);
    const navigateToHome = () => {
		setSelectedSubIcon("")
		setSelectedIcon("")
	}
    return (
        <div className="absolute w-[80%] h-[15rem] max-h-full border border-[#000] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center bg-white p-5 rounded shadow-md">
            <Image src={Hi} alt="Hi" height={30} width={30} />
            &nbsp;
            &nbsp;
            <p className="text-2xl">Something went wrong...</p>
            &nbsp;
            <section className="flex justify-between space-x-6">
                <button type="button" className="bg-red-500 text-white py-2 px-4 rounded mt-2 focus:outline-none" onClick={() => refetch()}>Retry</button>
                <button type="button" className="bg-blue-500 text-white py-2 px-4 rounded mt-2 focus:outline-none" onClick={navigateToHome}>Go to Home</button>
            </section>
            <br />
        </div>
    )
};

export default memo(ErrorComponent);