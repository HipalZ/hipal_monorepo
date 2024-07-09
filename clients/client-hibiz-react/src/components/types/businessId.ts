import { FaUser } from 'react-icons/fa';
import { GiCampCookingPot } from 'react-icons/gi';
import { GoGraph } from 'react-icons/go';
import { IoReceiptOutline } from 'react-icons/io5';
import { LuConciergeBell, LuSettings } from 'react-icons/lu';
import { MdCardMembership, MdReviews } from 'react-icons/md';
import { PiBookOpenText } from 'react-icons/pi';
import { SiSwiggy, SiZomato } from 'react-icons/si';
import { TbReportAnalytics } from 'react-icons/tb';
import { BsCurrencyRupee, BsFillPersonFill } from 'react-icons/bs';
import { AiFillHeart } from 'react-icons/ai';
import { toast } from 'react-toastify';
import { User } from '../store/useOwnerLogin';
import Love from "@/assets/made_love.png"
import React from 'react';

export interface ICardButton {
    Icon: React.ElementType;
    text: string;
    class: {
        background: string;
        text: string;
        font: string;
        bg: string;
        color: string;
        opacity?: string;
    };
    visible: boolean;
}

export interface ILiteVersionCardButton {
    image: string,
    text: string;
    description: string;
    navigateTo?: string;
}

export const cardButtons: ICardButton[] = [
    {
        Icon: BsCurrencyRupee,
        text: 'Sales',
        class: {
            text: 'text-xl',
            background: 'bg-white',
            font: 'text-4xl',
            bg: 'bg-[#2F80ED]/10',
            color: 'text-[#2F80ED]',
        },
        visible: true,
    },
    {
        Icon: AiFillHeart,
        text: 'Loyalty',
        class: {
            text: 'text-xl',
            background: 'bg-white',
            font: 'text-4xl',
            bg: 'bg-[#000000]/10',
            color: 'text-[#000000]',
        },
        visible: true,
    },
    {
        Icon: IoReceiptOutline,
        text: 'Items',
        class: {
            text: 'text-xl',
            background: 'bg-white',
            font: 'text-4xl',
            bg: 'bg-[#000000]/10',
            color: 'text-[#000000]',
        },
        visible: true,
    },
    {
        Icon: BsFillPersonFill,
        text: 'Staff',
        class: {
            text: 'text-xl',
            background: 'bg-white',
            font: 'text-4xl',
            bg: 'bg-[#7879F1]/10',
            color: 'text-[#7879F1]',
        },
        visible: true,
    },
    {
        Icon: GoGraph,
        text: 'Analytics',
        class: {
            text: 'text-xl',
            background: 'bg-white',
            font: 'text-4xl',
            bg: 'bg-[#7879F1]/10',
            color: 'text-[#7879F1]',
        },
        visible: true,
    },
    {
        Icon: TbReportAnalytics,
        text: 'Reports',
        class: {
            text: 'text-xl',
            background: 'bg-white',
            font: 'text-4xl',
            bg: 'bg-[#000000]/10',
            color: 'text-[#000000]',
        },
        visible: true,
    },
    {
        Icon: MdCardMembership,
        text: 'Taxes and charges',
        class: {
            text: 'text-xl',
            background: 'bg-white',
            font: 'text-4xl',
            bg: 'bg-[#FEA844]/10',
            color: 'text-[#FEA844]',
        },
        visible: true,
    },

    {
        Icon: LuSettings,
        text: 'Settings',
        class: {
            text: 'text-xl',

            background: 'bg-white',
            font: 'text-4xl',
            bg: 'bg-[#000000]/10',
            color: 'text-[#000000]',
        },
        visible: true,
    },
    {
        Icon: SiSwiggy,
        text: 'Swiggy',
        class: {
            text: 'text-xl',
            background: 'bg-white',
            font: 'text-4xl',
            bg: 'bg-[#fc8019]/10',
            color: 'text-[#fc8019]',
        },
        visible: false,
    },
    {
        Icon: SiZomato,
        text: 'Zomato',
        class: {
            text: 'text-xl',
            background: 'bg-white',
            font: 'text-5xl',
            bg: 'bg-[#cb202d]/10',
            color: 'text-[#cb202d]',
        },
        visible: false,
    },
    {
        Icon: LuConciergeBell,
        text: 'Dine-In',
        class: {
            text: 'text-xl',
            background: 'bg-zinc-300',
            font: 'text-4xl',
            bg: 'bg-[#F2994A]/10',
            color: 'text-[#F2994A]',
            opacity: 'opacity-50',
        },
        visible: false,
    },
    {
        Icon: GiCampCookingPot,
        text: 'Kitchen',
        class: {
            text: 'text-xl',
            background: 'bg-zinc-300',
            font: 'text-4xl',
            bg: 'bg-[#000000]/10',
            color: 'text-[#000000]',
            opacity: 'opacity-50',
        },
        visible: false,
    },
    {
        Icon: PiBookOpenText,
        text: 'Zones And Tables',
        class: {
            text: 'text-xl',
            background: 'bg-white',
            font: 'text-4xl',
            bg: 'bg-[#000000]/10',
            color: 'text-[#000000]',
        },
        visible: true,
    },
    {
        Icon: TbReportAnalytics,
        text: 'Kitchen',
        class: {
            text: 'text-xl',
            background: 'bg-white',
            font: 'text-4xl',
            bg: 'bg-[#000000]/10',
            color: 'text-[#000000]',
        },
        visible: true,
    },
    {
        Icon: FaUser,
        text: 'Customerz',
        class: {
            text: 'text-xl',
            background: 'bg-white',
            font: 'text-4xl',
            bg: 'bg-[#F2994A]/10',
            color: 'text-[#000000]',
        },
        visible: true,
    },
    {
        Icon: MdReviews,
        text: 'Reviewz',
        class: {
            text: 'text-xl',
            background: 'bg-white',
            font: 'text-4xl',
            bg: 'bg-[#000000]/10',
            color: 'text-[#000000]',
        },
        visible: true,
    },
];

export const liteVersionCardButtons: ILiteVersionCardButton[] = [
    {
        image: Love,
        text: "Themes",
        description: "Activate after Hi-site",
        navigateTo:"businessControl"
    },
    // {
    //     image: Love,
    //     text: "Loyalty",
    //     description: "Activate after Hi-site",
    //     navigateTo:"loyalty"

    // },
    {
        image: Love,
        text: "Payments",
        description: "Activate after Hi-site",
        navigateTo:"payments"
    },
    {
        image: Love,
        text: "Staff",
        description: "Activate after Hi-site",
        navigateTo:"staff"
    },
    {
        image: Love,
        text: "Hi-site",
        description: "Activate after Hi-site",
        navigateTo:"hiSite"
    },
    // {
    //     image: Love,
    //     text: "Settings",
    //     description: "Activate after Hi-site"
    // },
    // {
    //     image: Love,
    //     text: "Customerz",
    //     description: "Activate after Hi-site"
    // },
    // {
    //     image: Love,
    //     text: "Reviewz",
    //     description: "Activate after Hi-site"
    // },
    // {
    //     image: Love,
    //     text: "Analytics",
    //     description: "Activate after Hi-site",
    //     navigateTo:"analytics"
    // },
]
export interface AccessControlMapping {
    [key: string]: string;
}
export const accessControlMapping: AccessControlMapping = {
    dish: 'Items',
    staff: 'Staff',
    loyalty: 'Loyalty',
    sale: 'Sales',
    reports: 'Reports',
    zones_tables: 'Zones And Tables',
};

export const getUpdatedCardButtons = (
    cards: ICardButton[],
    user: User,
    handleNoAccess: () => void
) => {
    if (user.role !== 'RESTAURANT_MANAGER') {
        return cards.map((card: ICardButton) => ({ ...card }));
    }

    if (user.accessControl === undefined || Object.keys(user.accessControl).length === 0) {
        toast.error('You do not have access to this business');
        localStorage.removeItem('ownerLogin');
        handleNoAccess();
        return [];
    }

    return cards.map((card: ICardButton) => {
        const hasAccess =
            user.accessControl &&
            Object.entries(user.accessControl).some(([key, value]) => {
                const permissionName = accessControlMapping[key];
                return permissionName === card.text && value;
            });
        return {
            ...card,
            visible: hasAccess,
        };
    });
};