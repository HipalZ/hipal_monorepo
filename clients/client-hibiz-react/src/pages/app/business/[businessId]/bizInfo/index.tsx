import Header from '@/components/molecules/header';
import { useState } from 'react';
import { FaGlassMartiniAlt, FaPhoneAlt } from 'react-icons/fa';
import { MdOutlineSmokingRooms, MdOutlineStroller, MdOutlineWatchLater } from 'react-icons/md';
import { IoBeerOutline, IoWifiOutline } from 'react-icons/io5';
import { Paragraph, SubHeader } from '@/components/templates/explorePage/explorePageStore';

const BizInfo = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [map, setMap] = useState('');
    const [tags, setTags] = useState([
        {
            _id: '1',
            text: ''
        }, {
            _id: '2',
            text: ''
        }, {
            _id: '3',
            text: ''
        }
    ])

    const handleTag = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
        const value = e.target.value;
        setTags((prev) => {
            return prev.map((tag) => {
                if (tag?._id === id) {
                    return {
                        ...tag,
                        text: value
                    }
                }
                return tag
            })
        })
    }

    const handlePhoneNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhoneNumber(e.target.value)
    }

    const handleMap = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMap(e.target.value)
    }

    const amenities = [
        {
            _id: 1,
            text: 'Smoking Section',
            image: <MdOutlineSmokingRooms />
        }, {
            _id: 2,
            text: 'Buffet',
            image: <FaGlassMartiniAlt />
        }, {
            _id: 3,
            text: 'Hi Speed Internet',
            image: <IoWifiOutline />
        }, {
            _id: 4,
            text: 'Child Friendly',
            image: <MdOutlineStroller />
        }, {
            _id: 5,
            text: 'Alcohol',
            image: <IoBeerOutline />
        }
    ]

    return (
        <main className='mb-[20rem]'>
            <Header isIconBusinessShow={false} title='Business Info' />
            <section className='mx-6'>
                <SubHeader text="Basic Information" />
                <article className='bg-white p-4 rounded-2xl'>
                    <textarea className='resize-none h-28 w-full rounded-2xl' placeholder='Add description' />
                    &nbsp;
                    <Paragraph text="Describe Your business with 3 words" />
                    {tags.map((tag) => {
                        return (
                            <section key={tag?._id} className='flex items-center space-x-4 my-4'>
                                <h1>{tag?._id}</h1>
                                <input placeholder={`Tag ${tag?._id}`} type="text" className='w-full rounded-xl' value={tag?.text} onChange={(e) => handleTag(e, tag?._id)} />
                            </section>
                        )
                    })}
                </article>
            </section>
            <section className='m-6'>
                <SubHeader text="Contact" />
                <article className='bg-white p-4 rounded-2xl space-y-4'>
                    <input placeholder='Add Phone Number' type="text" value={phoneNumber} className='rounded-2xl w-full' onChange={handlePhoneNumber} />
                    <input placeholder='Add Location on map' type="text" value={map} className='rounded-2xl w-full' onChange={handleMap} />
                </article>
            </section>
            <article className='mx-6'>
                <SubHeader text='Info' />
            </article>
            <section>
                <article className='m-4 bg-white rounded-2xl p-4'>
                    <section className='border border-1  p-4 rounded-2xl'>
                        <input className='w-full rounded-2xl outline-none mb-2' placeholder='Add Average Pricing For Two' />
                        <SubHeader text="Add Amenities" />
                        <section className='flex flex-wrap gap-4'>
                            {
                                amenities.map((amenity) => {
                                    return (
                                        <article key={amenity._id} className='flex items-center space-x-4 rounded-full border border-1 bg-gray-100 px-2 py-1'>
                                            {amenity?.image}
                                            <h1>{amenity.text}</h1>
                                        </article>
                                    )
                                })
                            }
                        </section>
                    </section>
                    <br />
                    <section className='flex gap-6'>
                        <article className='flex items-center space-x-4 rounded-full border border-1 bg-gray-100 px-2 py-1 w-full'>
                            <FaPhoneAlt />
                            <h1>Add Number</h1>
                        </article>
                        <article className='flex items-center space-x-4 rounded-full border border-1 bg-gray-100 px-2 py-1 w-full'>
                            <MdOutlineWatchLater />
                            <h1>Add Timings</h1>
                        </article>
                    </section>
                    <br />
                </article>
            </section>
            <section className='mx-6'>
            <button type="button" className="action_btn" >
                Save
            </button>
            </section>
            <br/>
        </main>
    )
}

export default BizInfo