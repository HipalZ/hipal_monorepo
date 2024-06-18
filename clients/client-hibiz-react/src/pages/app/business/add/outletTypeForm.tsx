import useBusinessCtrl from "@/components/store/useBusinessCtrl";
import { useCallback } from "react";
import { toast } from "react-toastify";

export const businessTypeArray = [
	{
		title: "🏨New outlet",
		description:
			"Store has nothing to do with my previous stores, They gave different brand names",
		gradient:
			" linear-gradient(1.7deg, #FFFFFF -11.95%, #F2F2F2 112.46%)",
	},
	{
		title: "✨Branch",
		description:
			" Add a branch to existing brand and auto link loyalty and other services",
		gradient:
			" linear-gradient(1.7deg, #FFFFFF -11.95%, #F2F2F2 112.46%)",
	},
];
const OutletType = () => {
	const { step, setStep, outletType,setOutletType } = useBusinessCtrl();

	const goNext = useCallback(() => {
		if (outletType === "") {
			return toast.error("Please select a business type");
		}
		setStep(step + 1);
	}, [setStep, step, outletType]);
	return <main>
		
			{businessTypeArray.map((ele) => (
				<section
					key={ele.title}
					className="flex flex-col w-[90%] max-w-[30rem] m-6 overflow-hidden border rounded-2xl"
				>
					<article className="flex items-center p-4">
						<input
							type="radio"
							name="businessType"
							value={ele.title}
							id={`businessType-${ele.title}`}
							onChange={() => setOutletType(ele.title)}
							checked={outletType === ele.title}
							className="mr-2"
						/>
						<h3 className="text-lg font-semibold">{ele.title}</h3>
					</article>

					<article className="p-4" style={{ background: ele.gradient }}>
						<p className="text-sm">{ele.description}</p>
						
					</article>

					<button onClick={goNext} className="bottom_btn">
						Next
					</button>
				</section>
			))}
    </main>;
};

export default OutletType;
