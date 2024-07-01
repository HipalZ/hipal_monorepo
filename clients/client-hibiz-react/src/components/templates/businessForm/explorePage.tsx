import { IphoneExplore } from "@/components/atom/svgtheme";
import useBusinessCtrl from "@/components/store/useBusinessCtrl";
import { useCallback, useEffect, useState } from "react";

const ExplorePage = () => {
	const { step, setStep, exploreLayout, setExploreLayout,primaryColor,secondaryColor } = useBusinessCtrl();
	
	const [dimensions, setDimensions] = useState({ width: 350, height: 400 });

	const updateDimensions = () => {
		if (window.innerWidth >= 1028) {
			setDimensions({ width: 450, height: 600 });
		} else {
			setDimensions({ width: 350, height: 400 });
		}
	};
	
	const handleLayoutSelection = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		setExploreLayout(event.target.value);
	};

	const handleNextStep = useCallback(() => {
		if (exploreLayout) {
			setStep(step + 1);
		}
	}, [exploreLayout, step, setStep]);

	useEffect(() => {
		updateDimensions();
		window.addEventListener('resize', updateDimensions);
		return () => {
			window.removeEventListener('resize', updateDimensions);
		};
	}, []);

	return (
		<>
			<section className="explore_page_container">
				<section>
					<center className="mt-4 opacity-50">
					<IphoneExplore primary={primaryColor} secondary={secondaryColor} width={dimensions.width} height={dimensions.height} />
					</center>
					<figcaption className="explore_page">
						<h5 className="text-[#7266FF]">
							Choose your <br /> website layout
						</h5>
					</figcaption>
				</section>

				<section className="space-y-4 explore_page_selection">
					<label className="p-4 mx-4  bg-[#F4F4F4] rounded-xl">
						<article className="flex items-center space-x-2">
							<input
								type="radio"
								value="Butter"
								checked={exploreLayout === "Butter"}
								onChange={handleLayoutSelection}
								className="form-radio"
							/>
							<span>Butter</span>
						</article>
						<small className="opacity-50">
							A simple layout that focus on a quick navigation between Cover
							image , static stories, banners, must try and footer{" "}
						</small>
					</label>
					<label className="p-4 mx-4 rounded-xl bg-[#F4F4F4]">
						<article className="flex items-center space-x-2">
							<input
								type="radio"
								value="Sunflower"
								checked={exploreLayout === "Sunflower"}
								onChange={handleLayoutSelection}
								className="form-radio"
							/>
							<span>Sunflower</span>
						</article>
						<small className="opacity-50">This layout is not avaliable</small>
					</label>
				</section>
			</section>
			<button
				className={`bottom_btn mt-4 px-4 py-2 rounded ${
					!exploreLayout
						? "bg-gray-300 text-gray-600 cursor-not-allowed"
						: "bg-blue-500 text-white cursor-pointer"
				}`}
				onClick={handleNextStep}
				disabled={!exploreLayout}
			>
				Save & Next
			</button>
		</>
	);
};

export default ExplorePage;
