import BackButton from "@components/atoms/backButton";
import PlaceholderImg from "@components/atoms/placeholder/img";
import TableDetails from "@components/organisms/hicode/tableDetails";
import { _useAllBusiness } from "@components/store/useAllBusiness";
import useIdDetails from "@components/store/useIdDetails";
import { useLogin } from "@components/store/useLogin";
import { useRoutingFlow } from "@components/store/useRoutingFlow";
import { getRandomBlurImg } from "@components/utils/images";
import Image from "next/legacy/image";
import { memo, useState } from "react";
import { BiDish } from "react-icons/bi";

function TopBackground({ showWaiterIcon }: { showWaiterIcon?: boolean }) {
	const data = _useAllBusiness((s) => s.data);
	const { getPreviousPath } = useRoutingFlow();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const { hiCode } = useLogin();

	const modalOpen = () => {
		setIsModalOpen(true);
	};
	const modalClose = () => {
		setIsModalOpen(false);
	};

	return (
		<div className="relative h-[20vh] w-full overflow-hidden ">
			{data?.settings?.themes?.miniBanner ? (
				<Image
					src={data?.settings?.themes?.miniBanner || ""}
					width={700}
					height={300}
					quality={95}
					objectFit="cover"
					className="mx-auto"
					alt={"miniBanner Image"}
					placeholder="blur"
					blurDataURL={getRandomBlurImg(700, 700)}
				/>
			) : (
				<>
					<PlaceholderImg className="w-full h-full" />
				</>
			)}
			<div className="top-4  w-full absolute z-[60] flex flex-row px-4">
				<BackButton onBackURL={getPreviousPath()} />
			</div>
			{hiCode && (
				<div
					onClick={modalOpen}
					className="absolute top-4 rounded-lg py-1 bg-base-100 right-4 z-[60] flex flex-row px-4"
				>
					<div className="text-sm font-[550] text-primary">
						{" "}
						{"HiCode - " + hiCode}
					</div>
				</div>
			)}
			{showWaiterIcon && (
				<div className="  absolute  bg-gray-50  right-4 top-4 h-7 w-10  rounded-[1rem]">
					<BiDish className="w-6 h-6 ml-2 text-primary" />
				</div>
			)}

			<TableDetails isOpen={isModalOpen} onModalClose={modalClose} />
		</div>
	);
}

export default memo(TopBackground);
