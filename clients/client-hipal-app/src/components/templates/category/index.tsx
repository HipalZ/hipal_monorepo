"use client"
import { IBusinessData } from '@/components/types/businessData'
import { memo } from 'react'
import { useCart } from '@/components/store/useCart'
import dynamic from 'next/dynamic'
import SkeletonLoader from '@/components/atoms/loader/skeletonLoader'

const CategoryHeader = dynamic(() => import('@/components/organisms/category/categoryHeader.client'), {
    ssr: false,
    loading: () => <SkeletonLoader height={200} />,
  });
  const PageName = dynamic(() => import('@/components/molecules/pageName'), {
    ssr: false,
    loading: () => <SkeletonLoader height={200} />,
  });
  const Footer = dynamic(() => import('@/components/molecules/footer'), {
    ssr: false,
    loading: () => <SkeletonLoader height={200} />,
  });
  const DishesList = dynamic(() => import('@/components/organisms/category/dishesList'), {
    ssr: false,
    loading: () => <SkeletonLoader height={200} />,
  });
  const CategoryPageBtn = dynamic(() => import('@/components/molecules/bottomButton/categoryPageBtn'), {
    ssr: false,
    loading: () => <SkeletonLoader height={200} />,
  });
  const TopBackground = dynamic(() => import('@/components/molecules/topBackground'), {
    ssr: false,
    loading: () => <SkeletonLoader height={200} />,
  });

const Cart = dynamic(() => import('@/components/organisms/cart'), {
    ssr: false,
    loading: () => <SkeletonLoader height={200} />,
  });

const Category = memo(({ data }: { data: IBusinessData }) => {
    const { showCart } = useCart();
    console.log('dda',data);
    return (
        <>
            {
                !showCart &&
                <div className="relative flex flex-col w-full pb-14">
                    <TopBackground themes={data?.settings?.themes} />
                    <CategoryHeader categories={data?.categories} allCategoriesTypes={data?.allCategoriesTypes} primaryColor={data?.settings?.themes?.primaryColor || ''} />
                    <div>
                        <div className="!mt-0 !scroll-smooth">
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
                </div>
            }
            <CategoryPageBtn />

            {showCart && <Cart data={data} />}
        </>
    );
});

export default Category;
