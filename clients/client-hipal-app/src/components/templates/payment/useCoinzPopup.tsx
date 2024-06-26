import Image from "next/image";
import celebration from '@/assets/img/celebration-emoji.png'
import { IoMdCard } from "react-icons/io";
import { MdKeyboardArrowRight } from "react-icons/md";

interface IUseCoinzPopup {
    claimedCoinz: number,
    openModal: () => void,
    userCoinz: number
}

const UseCoinzPopup = (props: IUseCoinzPopup) => {
    const { claimedCoinz, openModal, userCoinz } = props;
    return (
        <>
            <div className='my-2'>
                <h6 className='flex px-4 py-1 m-auto text-sm rounded-lg w-fit bg-base-100 text-base-content'>
                    <span className='text-[2rem]'>
                        <Image src={celebration} alt='celebration' height={25} width={25} />
                    </span>{' '}
                            &nbsp;&nbsp;Special discount for Special members !!!
                        </h6>
            </div>
            <article
                onClick={openModal}
                className='animation-shake flex justify-between items-center border border-primary h-[90px] mx-4 rounded-3xl p-6 mt-4'
            >
                <div className='flex items-center'>
                    <IoMdCard size={30} className='-rotate-45 ' />
                            &nbsp; &nbsp;
                            <div>
                        <h6>Use Coinz</h6>
                        <h6>{claimedCoinz} coinz applied</h6>
                    </div>
                </div>
                <div className='flex items-center space-x-4'>
                    <h6>
                        {userCoinz - claimedCoinz}
                    </h6>
                    <MdKeyboardArrowRight size={30} />
                </div>
            </article>
        </>
    )
};

export default UseCoinzPopup;