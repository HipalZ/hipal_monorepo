import HipalLogo from "@/assets/hipal.png";
import Background from "@/assets/login/background.png";
import useLoginStore from "@/components/store/useLogin";
import { LuMoveRight } from "react-icons/lu";



const Hipal = () => {
	const { setStep } = useLoginStore();
	
	return (
		<main>
			<center className="pt-6">
				<img className="hipalz_logo" src={HipalLogo} alt="Hipal Logo" />
			</center>
			<section
				className="mx-auto mt-4"
				style={{
					backgroundImage: `url(${Background})`,
					backgroundRepeat: "no-repeat",
					backgroundPosition: "center",
					width: "90%",
					maxWidth: "30rem",
					height: "70vh",
					borderRadius: "2rem",
					backgroundSize: "cover",
				}}
			>
				<article className="pt-12 pl-4">
					<h3 className="text-xl font-semibold leading-10">
						Grow your restaurant
					</h3>
					<p className="mb-4">Hi Pal, Let’s get started Growing our Biz !</p>
					<button
						onClick={() => setStep(2)}
						className="px-4 text-sm py-2 bg-[#1C4EFF] text-white rounded-3xl"
					>
						Create account
					</button>
				</article>
			</section>
			<button className="bottom_btn">
				<div className="flex items-center justify-between px-4">
					<span>Get Started</span>
					<LuMoveRight size={24} />
				</div>
			</button>
		</main>
	);
};

export default Hipal;
