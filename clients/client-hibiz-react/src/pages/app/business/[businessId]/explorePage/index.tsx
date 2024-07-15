import { type ChangeEvent, type FormEvent, memo, startTransition, useCallback, useRef, useState, Suspense, lazy, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IoMdArrowUp } from "react-icons/io";
import { basicInfos, combineAllDishes, type IBizPayload } from '@/components/templates/explorePage/explorePageStore';
import { apiRpc } from '@hi/common';
import { useQuery } from '@tanstack/react-query';
import type { IBizInfo, IDish } from '@/components/types/businessData';
import { useUserToken } from '@/components/store/useUserToken';
import { useExploreStore } from '@/components/store/useExploreStore';
import { filterPayload, storeImageAfterSave } from '@/components/utils/helper';
import toast from 'react-hot-toast';
import { BsInstagram } from 'react-icons/bs';
import { CiFacebook } from 'react-icons/ci';
import { FaXTwitter } from 'react-icons/fa6';
import { TbBrandTelegram } from 'react-icons/tb';
import { RiDiscordLine } from 'react-icons/ri';
import { cropImage } from '@/components/cropper';
import PopUp from "@/components/atom/popUp";
import BizInformation from '@/components/templates/explorePage/businessInformation';
import useShowErrorToasts from '@/components/atom/errorToasts';

// Lazy loading components
const Header = lazy(() => import('@/components/molecules/header'));
const ReactCropper = lazy(() => import('@/components/cropper'));
const MiddlePopUp = lazy(() => import('@/components/atom/middlePopUp'));
const UniquelyYoursPopUp = lazy(() => import('@/components/templates/explorePage/uniquelyYoursPopUp'));
const ExplorePageTopSection = lazy(() => import('@/components/templates/explorePage/explorePageTopSection'));
const BizInfo = lazy(() => import('@/components/templates/explorePage/bizInfo'));
const BannerSection = lazy(() => import('@/components/templates/explorePage/bannerSection'));
const UniquelyYoursSection = lazy(() => import('@/components/templates/explorePage/uniquelyYoursSection'));
const FooterSection = lazy(() => import('@/components/templates/explorePage/footerSection'));
const SocialMediaLinks = lazy(() => import('@/components/templates/explorePage/socialMediaLinks'));
const BottomButton = lazy(() => import('@/components/atom/bottomButton'));
const RightButton = lazy(() => import('@/components/atom/rightButton'));
const SubHeader = lazy(() => import('@/components/atom/subHeader'));
const Paragraph = lazy(() => import('@/components/atom/paragraph'));


const MemoExplorePage = () => {
    const navigate = useNavigate();
    const showErrorToasts = useShowErrorToasts()
    const businessId = useParams()?.businessId
    const { accessToken, refreshToken } = useUserToken(s => ({
        accessToken: s.accessToken,
        refreshToken: s.refreshToken
    }))
    const { bizInfo, setBizInfo, originalDishes, uniquelyDishes, setUniquelyDishes, setOriginalDishes, setSelectedDishes, selectedDishes, clearOriginalDishes } = useExploreStore(
        (state) => ({
            bizInfo: state.bizInfo,
            setBizInfo: state.setBizInfo,
            originalDishes: state.originalDishes,
            setOriginalDishes: state.setOriginalDishes,
            selectedDishes: state.selectedDishes,
            setSelectedDishes: state.setSelectedDishes,
            uniquelyDishes: state.uniquelyDishes,
            setUniquelyDishes: state.setUniquelyDishes,
            clearOriginalDishes: state.clearOriginalDishes
        }),
    );
    const cropperRef = useRef(null);
    const hasFetchedCategoriesRef = useRef(false);
    const [toggleBizInfo, setToggleBizInfo] = useState(false);
    const [socialMediaLinks, setSocialMediaLinks] = useState([
        { _id: 1, icon: 'instagram', logo: <BsInstagram size={30} />, link: '' },
        { _id: 2, icon: 'facebook', logo: <CiFacebook size={36} />, link: '' },
        { _id: 3, icon: 'twitter', logo: <FaXTwitter size={30} />, link: '' },
        { _id: 4, icon: 'telegram', logo: <TbBrandTelegram size={30} />, link: '' },
        { _id: 5, icon: 'discord', logo: <RiDiscordLine size={36} />, link: '' },
    ]);
    const [uploadsPopUp, setUploadsPopUp] = useState(false)
    const [showUniquePopUp, setShowUniquePopUp] = useState(false);
    const [img, setImg] = useState({ banner: bizInfo?.specialBannerUrl, logo: bizInfo?.logoUrl, footer: bizInfo?.endBannerUrl });
    const [imageFiles, setImageFiles] = useState({ banner: null, logo: null });
    const [selectedSocialMedia, setSelectedSocialMedia] = useState('');
    const [showCropper, setShowCropper] = useState(false);
    const [cropping, setCropping] = useState({ image: null, type: null });
    const [dishes, setDishes] = useState<IDish[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const handleDishSelect = useCallback((selectedDish: IDish) => {
        const isAlreadySelected = selectedDishes.some(dish => dish._id === selectedDish._id);

        let updatedSelectedDishes: IDish[];
        if (isAlreadySelected) {
            updatedSelectedDishes = selectedDishes.filter(dish => dish._id !== selectedDish._id);
        } else {
            updatedSelectedDishes = [...selectedDishes, selectedDish];
        }

        setSelectedDishes(updatedSelectedDishes);
    }, [selectedDishes]);

    const handleOpenPopUp = useCallback(() => {
        setShowUniquePopUp(true);
    }, []);

    const handleSaveDish = async () => {
        setUniquelyDishes(selectedDishes);
        await handleUniquelyYours(selectedDishes)
        setShowUniquePopUp(false);
    };

    const handleUniquelyYours = async (selectedDishes: IDish[]) => {
        apiRpc.dishes.uniquelyYours.$post({
            header: {
                x_access_token: accessToken,
                x_refresh_token: refreshToken
            }, json: {
                dishArray: selectedDishes.map(dish => {
                    return {
                        dishId: dish._id,
                        name: dish.name,
                        images: dish.images,
                        dishType: dish?.dishType,
                        businessId
                    }
                }),
            }
        })
    }

    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        const type = event?.target?.dataset?.type;
        const file = event?.target?.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                setCropping({ image: reader.result, type });
                setShowCropper(true);
            };

            setImageFiles(prev => ({ ...prev, [type]: file }));
        }
    };

    const handleCrop = async () => {
        const { image, type } = cropping;
        const cropper = cropperRef.current;
        if (cropper && image && type) {
            const coordinates = cropper?.getCoordinates();
            if (coordinates) {
                try {
                    const croppedDataUrl = await cropImage(image, coordinates);
                    if (typeof croppedDataUrl === 'string') {
                        const blob = await (await fetch(croppedDataUrl)).blob();
                        const croppedFile = new File([blob], imageFiles[type]?.name, { type: 'image/png' });
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            setImg(prev => ({ ...prev, [type]: reader.result }));
                            setImageFiles(prev => ({ ...prev, [type]: croppedFile }));
                            setShowCropper(false);
                        };
                        reader.readAsDataURL(croppedFile);
                    }
                } catch (err) {
                    console.error(err);
                }
            }
        }
    };

    const handleBizInfo = useCallback(() => {
        setToggleBizInfo(!toggleBizInfo);
    }, [toggleBizInfo]);

    const handleNavigate = useCallback(() => {
        setToggleBizInfo(!toggleBizInfo);
        if (!toggleBizInfo) {
            startTransition(() => {
                clearOriginalDishes()
                navigate(`/app/business/${businessId}/hisite`)
            })
        }
    }, [businessId, toggleBizInfo, clearOriginalDishes, originalDishes]);

    const handleNavigation = useCallback(() => {
        startTransition(() => {
            navigate(`/app/business/${businessId}/banners`)
        })
    }, [businessId])

    const handleFssaiNumber = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.value.length >= 50) return toast.error('FSSAI number should be less than 50 characters')
        setBizInfo({ ...bizInfo, fssai: e.target.value });
    }

    const handlegst = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.value.length >= 26) return toast.error('GST number should be less than 26 characters')
        setBizInfo({ ...bizInfo, gst: e.target.value });
    }
    const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
        const search = e.target.value;
        setSearchQuery(search);
        const filteredDishes = dishes.filter(dish => dish.name.toLowerCase().includes(search.toLowerCase()));
        setDishes(filteredDishes);
        if (search.trim() === '') {
            setDishes(originalDishes);
        }
    }

    const handleBizName = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setBizInfo({ ...bizInfo, name: e.target.value });
    }, [bizInfo])

    const handleFooterComment = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
        setBizInfo({ ...bizInfo, footerDescription: e.target.value });
    }, [bizInfo])

    const handleSaveSocialMediaLink = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const newLink = e.target.value;
        setSocialMediaLinks((prev) =>
            prev.map((link) =>
                link.icon === selectedSocialMedia ? { ...link, link: newLink } : link
            )
        );

    }, [socialMediaLinks, selectedSocialMedia]);

    const getAllCategoryData = async (businessId: string) => {
        const categoryResponse = await apiRpc.categories.$get({
            query: {
                businessId: businessId
            },
        });
        const data = await categoryResponse.json();
        const categories = data?.data;
        const allDishes = await combineAllDishes(categories);
        return allDishes;
    };

    const getAllBizInfo = async () => {
        return await apiRpc.businesses.outletInfo[':businessId'].$get({
            param: {
                businessId
            },
            header: {
                x_access_token: accessToken,
                x_refresh_token: refreshToken
            }
        })
    }

    const handleSaveExplorePage = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!businessId) return;
        const bannerExplore = await storeImageAfterSave(imageFiles?.banner);
        const logoExplore = await storeImageAfterSave(imageFiles?.logo);
        const footerExplore = await storeImageAfterSave(imageFiles?.footer);

        const filteredSocialMedia = socialMediaLinks
            .filter((item) => item.link && item.link.length > 0)
            .map((item) => ({ icon: item.icon, link: item.link }));
        // Initialize payload with properties that are always present   
        console.log('fil', filteredSocialMedia)

        const payload: IBizPayload = {
            businessId,
            logoUrl: logoExplore,
            specialBannerUrl: bannerExplore,
            endBannerUrl: footerExplore,
            socialMediaLinks: filteredSocialMedia,
            name: bizInfo?.name,
            fssai: bizInfo?.fssai,
            gst: bizInfo?.gst,
            footerDescription: bizInfo?.footerDescription,
        };

        const filteredPayload = filterPayload(payload);

        const config = {
            x_access_token: accessToken,
            x_refresh_token: refreshToken
        }

        // Conditionally add keys if they have a length greater than 0

        let res: {
            status: number
        };
        if (bizInfo?._id === '') {
            res = await apiRpc.businesses.outletInfo.$post({
                header: config,
                json: filteredPayload
            });
        }

        if (bizInfo?._id !== '' || res && res.status === 409) {
            const outletInfo = await apiRpc.businesses.outletInfo.update[':businessId'].$put({
                header: config,
                json: filteredPayload,
                param: {
                    businessId: businessId
                },
            })
            const outletInfoData = await outletInfo.json();
            console.log('outletInfo', outletInfoData?.error)
            if (outletInfo.status === 200) {
                setUploadsPopUp(false)
                toast.success('Data saved successfully')
            }
            else if(outletInfo.status === 400){
                showErrorToasts(outletInfoData?.error)
            }
        }
    };

    useQuery({
        queryKey: ['bizInfo', businessId],
        queryFn: async () => {
            const res = await getAllBizInfo();
            const response = await res.json();
            setBizInfo(response?.data as IBizInfo);
            setSocialMediaLinks((prevLinks) =>
                prevLinks.map(link => {
                    const matchingLink = response?.data?.socialMediaLinks && response?.data?.socialMediaLinks.find(media => media.icon === link.icon);
                    return matchingLink ? { ...link, link: matchingLink.link } : link;
                })
            );
            return response;
        },
        enabled: !!businessId,
    });

    const fetchCategories = useCallback(async () => {
        if (originalDishes && originalDishes.length > 0) {
            return originalDishes;
        }
        const res = await getAllCategoryData(businessId as string);
        setDishes(res);
        setOriginalDishes(res);
    }, [businessId, originalDishes])

    useEffect(() => {
        if (originalDishes.length > 0 || hasFetchedCategoriesRef.current) return;
        fetchCategories();
        hasFetchedCategoriesRef.current = true;
    }, [businessId]);

    const handleUploads = () => {
        setUploadsPopUp(!uploadsPopUp)
    }

    const handleIconClick = (icon: string) => {
        setSelectedSocialMedia(icon);
    }

    return (
        <Suspense fallback={<div>Loading....</div>}>
            <main>
                <Header onBack={handleNavigate} title={`${toggleBizInfo ? 'Business Info' : 'Explore Page'} `} rightButton={<RightButton />} isIconBusinessShow={false} />
                {toggleBizInfo ? <BizInformation /> : <form onSubmit={handleSaveExplorePage} className='px-4'>
                    <SubHeader text='Business Explore' />
                    <section onClick={handleUploads} className='p-4 bg-white rounded-2xl'>
                        <h1>Click and upload banners and business name here</h1>
                    </section>
                    &nbsp;
                    <PopUp show={uploadsPopUp} onClose={handleUploads}>
                        <ExplorePageTopSection
                            handleImageChange={handleImageChange}
                            img={img}
                            handleBizName={handleBizName}
                            handleSaveExplorePage={handleSaveExplorePage} />
                    </PopUp>

                    <br />
                    <br />
                    <Suspense fallback={<div>Loading Business information....</div>}>
                        <BizInfo handleBizInfo={handleBizInfo} basicInfos={basicInfos} />
                    </Suspense>
                    <Suspense fallback={<div>Loading Banner section....</div>}>
                        <BannerSection
                            handleNavigation={handleNavigation}
                        />
                    </Suspense>

                    <UniquelyYoursSection
                        handleOpenPopUp={handleOpenPopUp} />

                    <FooterSection
                        handleFooterComment={handleFooterComment}
                        handleFssaiNumber={handleFssaiNumber}
                        handlegst={handlegst} />

                    <SocialMediaLinks
                        handleSaveSocialMediaLink={handleSaveSocialMediaLink}
                        selectedSocialMedia={selectedSocialMedia}
                        handleIconClick={handleIconClick}
                        socialMediaLinks={socialMediaLinks}
                    />

                    <section className='mt-4 opacity-30'>
                        <SubHeader text="Terms & Condition" />
                        <article className='flex items-center justify-between p-4 bg-white rounded-2xl'>
                            <Paragraph text="Add your terms and conditions here" />
                            <IoMdArrowUp size={20} className='rotate-45' />
                        </article>
                    </section>

                    <MiddlePopUp show={showCropper} onSave={handleCrop} onClose={() => setShowCropper(false)}>
                        <ReactCropper image={cropping.image} ref={cropperRef} width={250} height={250} />
                    </MiddlePopUp>

                    {showUniquePopUp && (
                        <PopUp show={showUniquePopUp} onClose={() => setShowUniquePopUp(false)}>
                            <UniquelyYoursPopUp setSelectedDishes={setSelectedDishes}
                                selectedDishes={selectedDishes}
                                handleSearch={handleSearch}
                                searchQuery={searchQuery}
                                dishes={dishes}
                                uniquelyDishes={uniquelyDishes}
                                handleDishSelect={handleDishSelect}
                                handleSaveDish={handleSaveDish} />
                        </PopUp>
                    )}

                    <BottomButton text='Save' />

                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                </form>}
            </main>
        </Suspense>

    );
};

const ExplorePage = memo(MemoExplorePage);
export default ExplorePage;
