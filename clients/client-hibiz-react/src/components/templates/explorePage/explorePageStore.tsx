
import { FaXTwitter } from 'react-icons/fa6';
import { BsInstagram } from 'react-icons/bs';
import { CiFacebook } from 'react-icons/ci';
import { TbBrandTelegram } from 'react-icons/tb';
import { RiDiscordLine } from "react-icons/ri";
export const basicInfos = [
    {
        _id: 1,
        text: 'Description',
    }, {
        _id: 2,
        text: 'Contact',
    }, {
        _id: 3,
        text: 'Store basics',
    }, {
        _id: 4,
        text: 'Amenities',
    }
]

export const socialMediaLinks = [
    {
        _id: 1,
        title: 'Instagram',
        icon: <BsInstagram size={30} />,
        link: ''
    }, {
        _id: 2,
        title: 'Facebook',
        icon: <CiFacebook size={36} />,
        link: ''
    }, {
        _id: 3,
        title: 'Twitter',
        icon: <FaXTwitter size={30} />,
        link: ''
    }, {
        _id: 4,
        title: 'Telegram',
        icon: <TbBrandTelegram size={30} />,
        link: ''
    }, {
        _id: 5,
        title: 'Discord',
        icon: <RiDiscordLine size={36} />,
        link: ''
    }
]

export const RightButton = () => (
    <button type="button" style={{ background: "linear-gradient(259.68deg, #7F66FE 9.06%, #4D6FF9 104.24%)" }} className='px-4 py-1 rounded-full text-white'>
        Preview
    </button>
);

export const PlusButton = () => (
    <span className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl'>+</span>
);

export const SubHeader = ({ text }: { text: string }) => (
    <h1 className='text-[#807C83] text-xl mb-4'>{text}</h1>
);

export const Paragraph = ({ text }: { text: string }) => (
    <p className='text-[#807C83]'>{text}</p>
)