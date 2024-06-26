import { cn } from "@/components/utils/helpers";

interface ICouponzLoyalty {

}

const CouponzLoyalty = ({ cardColor, textColor, textContent }) => {
    const defaultCardColor = "text-white h-[11rem] w-[10rem] p-3 rounded-2xl shrink-0 flex flex-col justify-between"
    const defaultButtonColor = "bg-white rounded-3xl font-normal px-2 mt-auto mb-2"

    return (
        <>
            <article className={cn(defaultCardColor, `bg-[${cardColor}]`)}>
                <div>
                    <span className="bg-white p-2 rounded-2xl">🎁</span>&nbsp;&nbsp;&nbsp;<span className="text-3xl">50%</span>
                    <p className={cn("my-4", `text-[${textColor}]`)}>{textContent}</p>
                </div>
                <button className={cn(defaultButtonColor, `text-[${cardColor}]`)}>Coming Soon</button>
            </article>
        </>
    )
};

export default CouponzLoyalty;