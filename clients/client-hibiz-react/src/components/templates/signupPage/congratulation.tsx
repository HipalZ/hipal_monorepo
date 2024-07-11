import Hand from "@/assets/login/hand.png";
import { Link } from "react-router-dom";

const Congratulation = () => {
	return (
		<>
			{" "}
			<img
				className="absolute left-0 right-0 m-auto -top-[6.5rem]"
				width={63}
				height={73}
				src={Hand}
				alt="Hipal_hand"
			/>
			<h3 className="mt-2 text-xl font-semibold leading-8">
				🥳Congratulationz !!!
			</h3>
			<h3 className="flex mb-6 leading-8"> We are your partnerz in growth</h3>
			<Link to={"/app/business"}>
            <button type="button" className="action_btn">
				Register my biz
			</button>
			</Link>
        </>
	);
};

export default Congratulation;
