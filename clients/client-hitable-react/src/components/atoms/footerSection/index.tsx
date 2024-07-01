import Cracker from "@/assets/img/cracker.png";
import { FaFacebook } from "react-icons/fa";
import { IoLogoInstagram } from "react-icons/io5";
import { SiTelegram } from "react-icons/si";
import HipalLogo from "@/assets/img/HipalFooterLogo.png";
import './index.css'

const social = [
    {
        name: 'Instagram',
        icon: <IoLogoInstagram size={28} />,
        url: 'https://www.instagram.com/paltribe/'
    },
    {
        name: 'Facebook',
        icon: <FaFacebook size={28} />,
        url: 'https://www.google.com/'
    },
    {
        name: 'Telegram',
        icon: <SiTelegram size={28} />,
        url: 'https://www.google.com/'
    }
]

export const FooterSection = () => {
    return (
        <article className='footer-home-section'>
            <section className="text-white">
                <div className="flex space-x-6 items-center">
                    {social.map((item) => {
                        return (
                            <a aria-label="redirection" key={item.name} href={item.url} target='_blank' rel='noopener noreferrer'>
                                {item?.icon}
                            </a>
                        )
                    })}
                </div>
                <br />
                <div className="flex">
                    <img src={HipalLogo} alt="HipalLogo" width={25} height={25} />&nbsp;&nbsp;
                    <span className="text-xl">HiClientZ</span>
                </div>
                <br />
                <small>Copyright © 2023 Paltribe. All rights reserved</small>
            </section>
            <img src={Cracker} alt="cracker" />
        </article>
    )
}