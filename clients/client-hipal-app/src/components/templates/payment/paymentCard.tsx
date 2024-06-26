import PlaceholderImg from "@/components/atoms/placeholder";
import { getRandomBlurImg } from "@/components/utils/images";
import { isEmpty } from "lodash-es";
import Image from "next/image";

interface IPaymentCard {
    claimedCoinz: number,
    billValue: number,
    logo: string | undefined
}

const PaymentCard = (props: IPaymentCard) => {
    const { claimedCoinz, billValue, logo} = props;
    return (
        <>
            <article className='relative h-[10rem] flex flex-col items-center justify-center mx-4 mt-10 space-y-2 text-xl rounded-3xl bg-primary text-base-100'>
                <div
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: '0',
                        transform: 'translate(-50%, -50%)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        aspectRatio: '1',
                    }}
                >
                    {!isEmpty(logo) ? (
                        <Image
                            src={logo || ''}
                            height={100}
                            width={100}
                            quality={95}
                            objectFit='cover'
                            alt='logo-business'
                            className='object-center w-1/2 border rounded-lg shadow-sm aspect-square'
                            placeholder='blur'
                            blurDataURL={getRandomBlurImg(100, 100)}
                        />
                    ) : (
                            <PlaceholderImg />
                        )}
                </div>
                <br />
                {claimedCoinz > 0 ? <h4 className='text-4xl'>₹ {billValue - claimedCoinz}</h4> : null}
                <h4 className={`${claimedCoinz > 0 ? 'line-through' : ''}`}>₹ {billValue}</h4>
            </article>
        </>
    )
};

export default PaymentCard;