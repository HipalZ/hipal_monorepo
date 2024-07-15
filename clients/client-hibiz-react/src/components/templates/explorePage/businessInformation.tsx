import { type ChangeEvent, memo, useCallback, useEffect, useState } from 'react';
import { FaGlassMartiniAlt } from 'react-icons/fa';
import { MdOutlineSmokingRooms, MdOutlineStroller, MdOutlineWatchLater } from 'react-icons/md';
import { IoBeerOutline, IoWifiOutline } from 'react-icons/io5';
import SubHeader from '@/components/atom/subHeader';
import Paragraph from '@/components/atom/paragraph';
import { apiRpc } from '@hi/common';
import { useUserToken } from '@/components/store/useUserToken';
import { useParams } from 'react-router-dom';
import type { IBizPayload } from '@/components/templates/explorePage/explorePageStore';
import { useExploreStore } from '@/components/store/useExploreStore';
import BottomButton from '@/components/atom/bottomButton';
import toast from 'react-hot-toast';
import PopUp from '@/components/atom/popUp';
import { convertTo12HourFormat } from '@/components/templates/settingsForm/outletForm';
import { Switch } from '@headlessui/react';

const amenitiesArr = [
    { _id: 1, text: 'SMOKING SECTION', image: <MdOutlineSmokingRooms /> },
    { _id: 2, text: 'BUFFET', image: <FaGlassMartiniAlt /> },
    { _id: 3, text: 'HI SPEED WIFI', image: <IoWifiOutline /> },
    { _id: 4, text: 'CHILD FRIENDLY', image: <MdOutlineStroller /> },
    { _id: 5, text: 'ALCOHOL', image: <IoBeerOutline /> }
];

const MemoBizInfo = () => {
    const businessId = useParams()?.businessId;
    const [openTimings, setOpenTimings] = useState(false);
    const [showCustomTime, setShowCustomTime] = useState(false);
    const [customTimings, setCustomTimings] = useState([
        { day: 'Monday', openTime: '', closeTime: '' },
        { day: 'Tuesday', openTime: '', closeTime: '' },
        { day: 'Wednesday', openTime: '', closeTime: '' },
        { day: 'Thursday', openTime: '', closeTime: '' },
        { day: 'Friday', openTime: '', closeTime: '' },
        { day: 'Saturday', openTime: '', closeTime: '' },
        { day: 'Sunday', openTime: '', closeTime: '' },
    ]);

    const [fixedTime, setFixedTime] = useState({
        openTime: '',
        closeTime: ''
    });
    const { accessToken, refreshToken } = useUserToken(s => ({
        accessToken: s.accessToken,
        refreshToken: s.refreshToken
    }));
    const { bizInfo, setBizInfo } = useExploreStore((s) => ({
        bizInfo: s.bizInfo,
        setBizInfo: s.setBizInfo
    }));

    // Temporary state variables
    const [tempDescription, setTempDescription] = useState('');
    const [tempPhone, setTempPhone] = useState('');
    const [tempLocation, setTempLocation] = useState('');
    const [tempAvgPricingForTwo, setTempAvgPricingForTwo] = useState('');
    const [tempTags, setTempTags] = useState(['', '', '']);
    const [tempAmenities, setTempAmenities] = useState([]);

    useEffect(() => {
        setTempDescription(bizInfo.description);
        setTempPhone(bizInfo.phone);
        setTempLocation(bizInfo.location);
        setTempAvgPricingForTwo(bizInfo.avgPricingForTwo);
        if(bizInfo?.tags && bizInfo?.tags.length>0){
            setTempTags([...bizInfo.tags]);
        }
        if(bizInfo?.amenities && bizInfo?.amenities.length>0){
            setTempAmenities([...bizInfo.amenities]);
        }
    }, [bizInfo]);

    const handleDescriptionChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
        setTempDescription(e.target.value);
    }, []);

    const handlePhoneChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setTempPhone(e.target.value);
    }, []);

    const handleLocationChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setTempLocation(e.target.value);
    }, []);

    const handlePricingChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setTempAvgPricingForTwo(e.target.value);
    }, []);

    const handleTagChange = useCallback((e: ChangeEvent<HTMLInputElement>, index: number) => {
        const value = e.target.value;
        const updatedTags = tempTags.map((tag, currentIndex) => {
            if (currentIndex === index) {
                return value;
            }
            return tag;
        });
        setTempTags(updatedTags);
    }, [tempTags]);

    const handleSelectAmenitiesChange = useCallback((selectedAmenity: string) => {
        const updatedAmenities = [...tempAmenities];
        const index = updatedAmenities.indexOf(selectedAmenity);
        if (index > -1) {
            updatedAmenities.splice(index, 1);
        } else {
            updatedAmenities.push(selectedAmenity);
        }
        setTempAmenities(updatedAmenities);
    }, [tempAmenities]);

    const handleTimings = useCallback(() => {
        setOpenTimings(!openTimings);
    }, [openTimings]);

    const handleCustomTimingChange = useCallback((index: number, key: 'openTime' | 'closeTime', value: string) => {
        setCustomTimings((prev) =>
            prev.map((timing, i) =>
                i === index ? { ...timing, [key]: value } : timing
            )
        );
    }, []);

    const handleFixedTimeChange = useCallback((key: 'openTime' | 'closeTime', value: string) => {
        setFixedTime((prev) => ({ ...prev, [key]: value }));
    }, []);

    const handleSaveChanges = () => {
        setBizInfo({
            ...bizInfo,
            description: tempDescription,
            phone: tempPhone,
            location: tempLocation,
            avgPricingForTwo: tempAvgPricingForTwo,
            tags: tempTags.filter(tag => tag.trim() !== ''),
            amenities: tempAmenities,
            fixOpenTime: fixedTime?.openTime,
            fixCloseTime: fixedTime?.closeTime,
            customTiming: customTimings
        });
        toast.success('Timings saved');
        handleTimings();
    };

    const handleCreateInfo = async () => {
        if (!businessId) return;
        const payload: IBizPayload = {
            businessId,
            isCustomTime: showCustomTime,
            description: tempDescription,
            phone: tempPhone,
            location: tempLocation,
            avgPricingForTwo: tempAvgPricingForTwo,
            tags: tempTags.filter(tag => tag.trim() !== ''),
            amenities: tempAmenities,
            fixOpenTime: fixedTime?.openTime,
            fixCloseTime: fixedTime?.closeTime,
            customTiming: customTimings.filter(timing => timing.openTime || timing.closeTime)
        };
        const filteredPayload = Object.fromEntries(
            Object.entries(payload).filter(([_, value]) => value !== null && value !== '' && value !== undefined)
        );

        const config = {
            x_access_token: accessToken,
            x_refresh_token: refreshToken
        };
        let res: { status: number };
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
            });
            if (outletInfo.status === 200) {
                toast.success('Data saved successfully');
            }
        }
    };

    return (
        <main className='px-4'>
            <section>
                <SubHeader text="Basic Information" />
                <article className='p-4 bg-white rounded-2xl'>
                    <textarea
                        minLength={30}
                        maxLength={90}
                        value={tempDescription}
                        onChange={handleDescriptionChange}
                        className='w-full resize-none h-28 rounded-2xl'
                        placeholder='Add description'
                    />
                    &nbsp;
                    <Paragraph text="Describe Your business with 3 words" />
                    {tempTags.map((tag, index) => (
                        <section key={index.toString()} className='flex items-center my-4 space-x-4'>
                            <h1>{index + 1}</h1>
                            <input
                                minLength={4}
                                maxLength={30}
                                placeholder={`Tag ${index + 1}`}
                                type="text"
                                className='w-full rounded-xl'
                                value={tag}
                                onChange={(e) => handleTagChange(e, index)}
                            />
                        </section>
                    ))}
                </article>
            </section>
            <section className='my-6'>
                <SubHeader text="Contact" />
                <article className='p-4 space-y-4 bg-white rounded-2xl'>
                    <input
                        type="tel"
                        value={tempPhone}
                        onChange={handlePhoneChange}
                        className="w-full rounded-2xl"
                        placeholder="Enter phone number"
                        maxLength={10}
                        minLength={10}
                    />
                    <input
                        minLength={10}
                        maxLength={100}
                        placeholder='Add Location on map'
                        type="text"
                        value={tempLocation}
                        className='w-full rounded-2xl'
                        onChange={handleLocationChange}
                    />
                </article>
            </section>
            <article>
                <SubHeader text='Info' />
            </article>
            <section className='mb-[5rem]'>
                <article className='p-4 bg-white rounded-2xl'>
                    <section className='p-4 border border-1 rounded-2xl'>
                        <input
                            value={tempAvgPricingForTwo}
                            type="tel"
                            maxLength={10}
                            onChange={handlePricingChange}
                            className='w-full mb-2 outline-none rounded-2xl'
                            placeholder='Add Average Pricing For Two'
                        />
                        {amenitiesArr && amenitiesArr.length>0 ? <SubHeader text="Add Amenities" /> :null}
                        <section className='flex flex-wrap gap-4'>
                            {amenitiesArr ? amenitiesArr.map((amenity) => {
                                if (tempAmenities === undefined) return null;
                                const isSelected = tempAmenities.includes(amenity?.text);
                                return (
                                    <article
                                        key={amenity._id}
                                        onClick={() => handleSelectAmenitiesChange(amenity.text)}
                                        onKeyDown={() => handleSelectAmenitiesChange(amenity.text)}
                                        className={`capitalize flex items-center space-x-4 rounded-full border border-1 px-2 py-1 cursor-pointer ${isSelected ? 'bg-indigo-100' : 'bg-gray-100'}`}
                                    >
                                        {amenity?.image}
                                        <h1>{amenity.text.toLowerCase()}</h1>
                                    </article>
                                );
                            }) : null}
                        </section>
                    </section>
                    <br />
                    <section className='flex gap-6 my-2'>
                        <article onClick={handleTimings} className='flex items-center px-2 py-1 space-x-4 bg-gray-100 border rounded-full border-1'>
                            <MdOutlineWatchLater />
                            <h1>Add Timings</h1>
                        </article>
                    </section>
                    {(fixedTime?.openTime || fixedTime?.closeTime) && (
                        <div className="w-96 px-4 py-1 text-sm text-[#8C63FF] bg-[#8C63FF20] rounded-full">
                            Business time from {convertTo12HourFormat(fixedTime?.openTime)} to{" "}
                            {convertTo12HourFormat(fixedTime?.closeTime)}
                        </div>
                    )}
                </article>
            </section>
            <BottomButton text='Save' onClick={handleCreateInfo} />
            <br />
            <PopUp show={openTimings} onClose={handleTimings}>
                <section className='p-4 h-[80vh] overflow-y-scroll bg-gray-100 rounded-2xl pb-[5rem]'>
                    <center className='my-2 text-2xl'>Business Timings</center>
                    <h1 className='my-2'>Fixed Timings:</h1>
                    <section className="p-4 my-2 space-y-4 bg-white rounded-xl">
                        <div className="flex items-center justify-between">
                            <label htmlFor="fixedOpenTime">Open Time:</label>
                            <input
                                type="time"
                                id="fixedOpenTime"
                                value={fixedTime?.openTime}
                                onChange={(e) => handleFixedTimeChange('openTime', e.target.value)}
                                className="rounded-full w-[10rem]"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="fixedCloseTime">End Time:</label>
                            <input
                                type="time"
                                id="fixedCloseTime"
                                value={fixedTime?.closeTime}
                                onChange={(e) => handleFixedTimeChange('closeTime', e.target.value)}
                                className="rounded-full w-[10rem]"
                            />
                        </div>
                        {(fixedTime?.openTime || fixedTime?.closeTime) && (
                            <div className="px-4 py-1 text-sm text-[#8C63FF] bg-[#8C63FF20] rounded-full">
                                Business time from {convertTo12HourFormat(fixedTime?.openTime)} to{" "}
                                {convertTo12HourFormat(fixedTime?.closeTime)}
                            </div>
                        )}
                    </section>
                    <section className='flex items-center justify-between p-4 my-4 bg-white rounded-xl'>
                        <label>Custom Timings</label>
                        <Switch
                            checked={showCustomTime}
                            onChange={setShowCustomTime}
                            className="group inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition data-[checked]:bg-green-400"
                        >
                            <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-[checked]:translate-x-6" />
                        </Switch>
                    </section>
                    {showCustomTime && <section className='my-4 bg-white rounded-2xl'>
                        {customTimings.map((timing, index) => (
                            <article key={`timing${index}`} className='flex items-center justify-between p-2 my-2'>
                                <h1 className='w-[3rem]'>{timing.day}</h1>
                                <input
                                    type="time"
                                    id={`customTimingOpen${index}`}
                                    value={timing.openTime}
                                    onChange={(e) => handleCustomTimingChange(index, 'openTime', e.target.value)}
                                    className="rounded-full w-[8rem]"
                                />
                                <input
                                    type="time"
                                    id={`customTimingClose${index}`}
                                    value={timing.closeTime}
                                    onChange={(e) => handleCustomTimingChange(index, 'closeTime', e.target.value)}
                                    className="rounded-full w-[8rem]"
                                />
                            </article>
                        ))}
                    </section>}
                    <BottomButton text='Save' onClick={handleSaveChanges} />
                </section>
            </PopUp>
        </main>
    );
};

const BizInformation = memo(MemoBizInfo);
export default BizInformation;
