import { categoryApis } from "@/apis/category";
import { fetchAllBusinessIds } from "@/apis/explore";
import type { IBusinessData } from "@/components/types/businessData";
import dynamic from 'next/dynamic';
import { BUSINESS_ID } from "@/components/utils/constants";

// Dynamic imports for client-side components
const CategoryHeader = dynamic(() => import('@/components/organisms/category/categoryHeader.client'));
const PageName = dynamic(() => import('@/components/molecules/pageName'));
const Footer = dynamic(() => import('@/components/molecules/footer'));
const DishesList = dynamic(() => import('@/components/organisms/category/dishesList'));
const CategoryPageBtn = dynamic(() => import('@/components/molecules/bottomButton/categoryPageBtn'));
const TopBackground = dynamic(() => import('@/components/molecules/topBackground'));

export async function generateStaticParams() {
    const businessIds = await fetchAllBusinessIds();
    return businessIds.map((businessId: string) => ({
        businessId: businessId,
    }));
}

async function fetchData(businessId: string) {
    const data = await categoryApis.all(businessId);
    return data;
}

export async function generateMetadata() {
    return {
        title: `Category`,
        description: "Category page for business",
    };
}

export default async function Page({ params }: { params: { businessId: string } }) {
    const data = await fetchData(params.businessId);
    return <Category data={data} />;
}

function Category({ data }: { data: IBusinessData }) {
    const businessId = data?.business?._id;
    return (
        <div className="relative flex flex-col w-full pb-14">
            <TopBackground themes={data?.settings?.themes} />
            <CategoryHeader categories={data?.categories} allCategoriesTypes={data?.allCategoriesTypes} />
            <div>
                <div className="!mt-0 !scroll-smooth ">
                    <DishesList allCategoriesTypes={data?.allCategoriesTypes} categories={data?.categories} />
                </div>
                <PageName endBanner={data?.settings?.themes?.endBanner} />
                <Footer footerText={data?.settings?.themes?.footerText}
                    instagramLink={data?.settings?.themes?.instagramLink}
                    facebookLink={data?.settings?.themes?.facebookLink}
                    youtubeLink={data?.settings?.themes?.youtubeLink}
                    linkedinLink={data?.settings?.themes?.linkedinLink}
                />
            </div>
            {businessId !== BUSINESS_ID.KOI_AND_CO && <CategoryPageBtn />}
        </div>
    );
}
