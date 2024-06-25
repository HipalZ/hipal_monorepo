import CategoryHeader from '@/components/organisms/category/categoryHeader.client'
import PageName from '@/components/molecules/pageName'
import Footer from '@/components/molecules/footer'
import DishesList from '@/components/organisms/category/dishesList'
import CategoryPageBtn from '@/components/molecules/bottomButton/categoryPageBtn'
import TopBackground from '@/components/molecules/topBackground'
import { IBusinessData } from '@/components/types/businessData'
import { memo } from 'react'

 const  Category =  memo(({ data }: { data: IBusinessData }) => {
    return (
        <div className="relative flex flex-col w-full pb-14">
            <TopBackground themes={data?.settings?.themes} />
            <CategoryHeader categories={data?.categories} allCategoriesTypes={data?.allCategoriesTypes} primaryColor={data?.settings?.themes?.primaryColor || ''} />
            <div>
                <div className="!mt-0 !scroll-smooth ">
                    <DishesList allCategoriesTypes={data?.allCategoriesTypes} categories={data?.categories || []} />
                </div>
                <Footer
                    footerText={data?.settings?.themes?.footerText || ''}
                    instagramLink={data?.settings?.themes?.instagramLink || ''}
                    facebookLink={data?.settings?.themes?.facebookLink || ''}
                    youtubeLink={data?.settings?.themes?.youtubeLink || ''}
                    linkedinLink={data?.settings?.themes?.linkedinLink || ''}
                />
                <PageName />
            </div>
            <CategoryPageBtn />
        </div>
    );
})

export default Category