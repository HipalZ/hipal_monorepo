"use client"
import type { IBusinessData } from "@/components/types/businessData"
import CategoryHeader from '@/components/organisms/category/categoryHeader.client';
import PageName from '@/components/molecules/pageName';
import Footer from '@/components/molecules/footer';
import DishesList from '@/components/organisms/category/dishesList';
import { BUSINESS_ID } from "@/components/utils/constants";
import CategoryPageBtn from "@/components/molecules/bottomButton/categoryPageBtn";
import TopBackground from "@/components/molecules/topBackground";
import { useRoutingFlow } from "@/components/store/useRoutingFlow";

export default function Category({ data }: { data: IBusinessData }) {
	const { getPreviousPath } = useRoutingFlow()
	const businessId = data?.business?._id
	return (
		<div className="relative flex flex-col w-full pb-14">
			<TopBackground onBackURL={`${getPreviousPath()}`} miniBanner={data?.settings?.themes?.miniBanner} />

			<CategoryHeader categories={data?.categories}
				allCategoriesTypes={data?.allCategoriesTypes}
			/>

			<div>
				<div className="!mt-0 !scroll-smooth ">
					<DishesList
						allCategoriesTypes={data?.allCategoriesTypes}
						categories={data?.categories}
					/>
				</div>

				<PageName />

				<Footer />
			</div>
			{businessId !== BUSINESS_ID.KOI_AND_CO && <CategoryPageBtn />}
		</div>
	)
}
