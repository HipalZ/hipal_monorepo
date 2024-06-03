import Hi from "@/assets/svg/hi.svg";
import { useSelectedIcon } from "../store/useSelectedIcon";
import { memo, startTransition } from "react";
import { useNavigate } from "react-router-dom";

const ErrorComponent = memo(({refetch}:any) => {
    const navigate = useNavigate();
    const setSelectedSubIcon = useSelectedIcon((s) => s.setSelectedSubIcon);
	const setSelectedIcon = useSelectedIcon((s) => s.setSelectedIcon);
    const navigateToHome = () => {
        startTransition(()=>{
            navigate(-1)
        })
		setSelectedSubIcon("")
		setSelectedIcon("")
	}
    return (
        <div className="absolute w-[80%] h-[15rem] max-h-full border border-[#000] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center bg-white p-5 rounded shadow-md">
            <img src={Hi} alt="Hi" height={30} width={30} loading="lazy"/>
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
});

export default ErrorComponent