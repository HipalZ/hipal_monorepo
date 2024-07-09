import { memo, useCallback, useRef, useState } from 'react';
import Header from '@/components/molecules/header';
import ReactCropper, { cropImage } from '@/components/cropper';
import MiddlePopUp from '@/components/atom/middlePopUp';
import { useNavigate, useParams } from 'react-router-dom';
import { IoMdArrowUp } from "react-icons/io";
import PopUp from '@/components/atom/popUp';
import { basicInfos, Paragraph, PlusButton, RightButton, socialMediaLinks, SubHeader } from '@/components/templates/explorePage/explorePageStore';

const MemoExplorePage = () => {
    const navigate = useNavigate();
    const businessId = useParams()?.businessId
    const cropperRef = useRef(null);
    const [selectedSocialMedia, setSelectedSocialMedia] = useState('');
    const handleIconClick = (socialMediaName: string) => {
        setSelectedSocialMedia(socialMediaName);
    };
    const [fssai, setFssai] = useState('');
    const [gst, setGst] = useState('');
    const [img, setImg] = useState({ banner: '', logo: '' });
    const [imageFiles, setImageFiles] = useState({ banner: null, logo: null });
    const [uniquelyFiles, setUniquelyFiles] = useState([{ id: 1, src: '', file: null }]);
    const [showCropper, setShowCropper] = useState(false);
    const [cropping, setCropping] = useState({ image: null, type: null });
    const [selectedDish, setSelectedDish] = useState({ id: null, src: '' });

    const handleDishSelect = (dish) => {
        setSelectedDish(dish);
    };
    const handleOpenPopUp = (id) => {
        setSelectedDish({ id, src: '' });
        setShowUniquePopUp(true);
    };
    const handleSaveDish = () => {
        setUniquelyFiles(prev => {
            const newFiles = prev.map(fileItem => {
                if (fileItem.id === selectedDish.id) {
                    return { ...fileItem, src: selectedDish.src };
                }
                return fileItem;
            });

            if (newFiles.length < 7 && !newFiles.find(fileItem => fileItem.id === newFiles.length + 1)) {
                newFiles.push({ id: newFiles.length + 1, src: '', file: null });
            }

            return newFiles;
        });
        setShowUniquePopUp(false);
    };
    const [showUniquePopUp, setShowUniquePopUp] = useState(false);

    const handleImageChange = (event: Event) => {
        const type = event?.target?.dataset?.type;
        const id = event?.target?.dataset?.id;
        const file = event?.target?.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                if (type === 'uniquelyYours') {
                    setUniquelyFiles(prev => {
                        const newFiles = prev.map(fileItem => {
                            if (fileItem.id === Number(id)) {
                                return { ...fileItem, src: reader.result, file };
                            }
                            return fileItem;
                        });

                        if (newFiles.length < 7 && !newFiles.find(fileItem => fileItem.id === newFiles.length + 1)) {
                            newFiles.push({ id: newFiles.length + 1, src: '', file: null });
                        }

                        return newFiles;
                    });
                } else {
                    setCropping({ image: reader.result, type });
                    setShowCropper(true);
                }
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
        navigate(`/app/business/${businessId}/bizInfo`)
    },[businessId])

    const handleFssaiNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFssai(e.target.value)
    }

    const handlegst = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGst(e.target.value)
    }

    return (
        <main className='px-4'>
            <Header title='Explore Page' rightButton={<RightButton />} isIconBusinessShow={false} />
            <section className='mb-4'>
                <SubHeader text="Banner" />
                <article className='relative rounded-xl h-[20rem] w-full border-dashed border-2 inline-block border-[#8C63FF]' onClick={() => document.getElementById('bannerInput').click()}>
                    <input type='file' id='bannerInput' style={{ display: 'none' }} onChange={handleImageChange} data-type="banner" />
                    <label htmlFor='bannerInput' className='w-full h-full flex justify-center items-center cursor-pointer overflow-hidden rounded-xl'>
                        {img.banner ? <img src={img.banner} alt="Banner" /> : <PlusButton />}
                    </label>
                </article>
            </section>
            <SubHeader text="Basic Info" />
            <section className='mt-4 flex justify-between items-center space-x-4'>
                <article className='shrink-0 relative rounded-xl h-[8rem] w-[8rem] border-dashed border-2 inline-block border-[#8C63FF]' onClick={() => document.getElementById('logoInput').click()}>
                    <input type='file' id='logoInput' style={{ display: 'none' }} onChange={handleImageChange} data-type="logo" />
                    <label htmlFor='logoInput' className='w-full h-full flex justify-center items-center cursor-pointer  overflow-hidden rounded-xl'>
                        {img.logo ? <img src={img.logo} alt="Logo" /> : <PlusButton />}
                    </label>
                </article>
                <input type="text" className='w-full rounded-2xl' placeholder='Business Name' />
            </section>
            <br />
            <br />
            <section className='mb-4'>
                <SubHeader text="Basic Information" />
                <article onKeyDown={handleBizInfo} onClick={handleBizInfo} className='bg-white p-4 flex flex-wrap gap-4 rounded-xl mt-4'>
                    {basicInfos.map((info) => {
                        return (
                            <div key={info._id} className='border border-1 border-black border-dashed bg-gray-50 p-2 rounded-lg'>
                                <span>{info.text}</span>
                            </div>
                        )
                    })}
                </article>
            </section>
            <section className='mb-4'>
                <SubHeader text="Uniquely Yours" />
                <Paragraph text="select your best dishes on explore page" />
                &nbsp;
                <article className='bg-white flex flex-wrap gap-3 p-4'>
                    {uniquelyFiles.map((file) => (
                        <article key={file.id} className='shrink-0 relative rounded-xl h-[5rem] w-[5rem] border-dashed border-2 inline-block border-[#8C63FF]' >
                            <input type='file' id={`uniquelyYours${file.id}`} style={{ display: 'none' }} onChange={handleImageChange} data-type="uniquelyYours" data-id={file.id} />
                            <label htmlFor={`uniquelyYours${file.id}`} className='w-full h-full flex justify-center items-center cursor-pointer overflow-hidden rounded-xl'>
                                {file.src ? <img src={file.src} alt="Logo" /> : <PlusButton />}
                            </label>
                        </article>
                    ))}
                </article>
            </section>
            <section>
                <SubHeader text="Footer Banner" />
                <article className='relative rounded-xl h-[20rem] w-full border-dashed border-2 inline-block border-[#8C63FF]' onClick={() => document.getElementById('footerInput').click()}>
                    <input type='file' id='footerInput' style={{ display: 'none' }} onChange={handleImageChange} data-type="footer" />
                    <label htmlFor='footerInput' className='w-full h-full flex justify-center items-center cursor-pointer overflow-hidden rounded-xl'>
                        {img.banner ? <img src={img.banner} alt="Banner" /> : <PlusButton />}
                    </label>
                </article>
            </section>
            &nbsp;
            <section>
                <SubHeader text="Footer Section" />
                <article className='bg-white p-4 rounded-2xl'>
                    <textarea className='resize-none h-22 w-full rounded-2xl' placeholder='Add Footer comment' />
                    <br /><br />
                    <Paragraph text="Optional Sections" />
                    <br />
                    <article className='rounded-2xl space-y-4'>
                        <input placeholder='FSSAI number' type="text" value={fssai} className='rounded-2xl w-full' onChange={handleFssaiNumber} />
                        <input placeholder='GST number' type="text" value={gst} className='rounded-2xl w-full' onChange={handlegst} />
                    </article>
                </article>
                <br />
            </section>
            <SubHeader text='Social Media Links' />
            <section className='bg-white rounded-2xl'>
                <article className='flex justify-between items-center p-6 '>
                    {
                        socialMediaLinks.map((link) => {
                            return (
                                <div onClick={() => handleIconClick(link.title)} key={link._id} className={`${selectedSocialMedia === link.title ? 'border-2 border-[#FFD700]' : 'bg-gray-100'} h-10 w-10 rounded-full flex justify-center items-center`}>
                                    {link.icon}
                                </div>
                            )
                        })
                    }
                </article>
                {
                    selectedSocialMedia.length === 0 ? null : (
                        <article className='rounded-2xl space-y-4 mx-6 pb-4'>
                            <input placeholder={`Enter ${selectedSocialMedia} link`} type="text" value={fssai} className='rounded-2xl w-full' onChange={handleFssaiNumber} />
                        </article>
                    )
                }
            </section>
            <section className='mt-4'>
                <SubHeader text="Terms & Condition" />
                <article className='flex items-center justify-between bg-white p-4 rounded-2xl'>
                    <Paragraph text="Add your terms and conditions here" />
                    <IoMdArrowUp size={20} className='rotate-45' />
                </article>
            </section>
            <MiddlePopUp show={showCropper} onSave={handleCrop} onClose={() => setShowCropper(false)}>
                <ReactCropper image={cropping.image} ref={cropperRef} width={250} height={250} />
            </MiddlePopUp>
            {showUniquePopUp && (
                <PopUp show={showUniquePopUp} onClose={() => setShowUniquePopUp(false)}>
                    <div className='p-4'>
                        <h2>Select a Dish</h2>
                        <div className='grid grid-cols-3 gap-4'>
                            {dishImages.map(dish => (
                                <div key={dish.id} className='cursor-pointer' onClick={() => handleDishSelect(dish)}>
                                    <img src={dish.src} alt={`Dish ${dish.id}`} className={`border-2 ${selectedDish.id === dish.id ? 'border-blue-500' : 'border-transparent'}`} />
                                </div>
                            ))}
                        </div>
                        <button className='mt-4' onClick={handleSaveDish}>Save</button>
                    </div>
                </PopUp>
            )}
            <section className='fixed bottom-4 left-6 right-6'>
                <button type="button" className="action_btn" >
                    Save
                </button>
            </section>
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
        </main>
    );
};

const ExplorePage = memo(MemoExplorePage);
export default ExplorePage;
