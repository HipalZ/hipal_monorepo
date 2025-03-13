import type { IBannerPayload } from '../types/businessData';
import EmblaCarousel2 from "@/components/atoms/emblaCarousel/emblaCarousel2"
import BannerLayouts from "@/components/organisms/explore/bannerNewCards"
import { cn } from "@/lib/utils"


const BannerSectionHotels = ({banners}:{
    banners: IBannerPayload[]
}) => {
    return (
        <>
            {banners?.some(
                (banner: IBannerPayload) => banner?.isPublished,
            ) && (
                    <section className="w-full rounded-3xl">
                        <article className="relative bg-h-base-100 md:bg-[#ffffff50] rounded-3xl">
                            <h2 className="pb-8 md:pt-4 text-3xl text-center font-play text-h-primary bg-h-base-100 md:bg-[#ffffff50] rounded-t-3xl">
                                Spotlight
                            </h2>
                            <article
                                className={cn(
                                    banners?.length === 1 ? "justify-center" : "",
                                    "h-[26rem] flex gap-4 bg-h-base-100 md:bg-[#ffffff50] rounded-b-3xl flex-nowrap w-full",
                                )}
                            >
                                <EmblaCarousel2 customCarousel={banners?.length === 1}>
                                    {banners?.map((banner, index) => {
                                        if (!banner?.isPublished) return null;
                                        return (
                                            <div
                                                key={index.toString()}
                                                className={cn(
                                                    "embla__slide",
                                                    banners?.length === 1
                                                        ? "justify-start embla__container"
                                                        : "",
                                                )}
                                            >
                                                <div className="embla-_parallax">
                                                    <div className={cn("embla-_parallax__layer")}>
                                                        <BannerLayouts
                                                            redirectionId={banner?.redirectionId || ""}
                                                            redirectionName={banner?.redirectionName || ""}
                                                            selectedLayout={banner?.layout || ""}
                                                            heading={banner?.heading || ""}
                                                            paragraph={banner?.paragraph || ""}
                                                            callToAction={banner?.callToAction || ""}
                                                            img={{ logo: banner?.bannerImage || "" }}
                                                            selectedColor={{
                                                                bgColor: banner?.backgroundColor || "",
                                                                textColor: banner?.backgroundColor || "",
                                                            }}
                                                            paragraphStyle={{
                                                                color: banner?.paragraphColor || "",
                                                            }}
                                                            buttonStyle={{
                                                                color: banner?.buttonColor || "",
                                                                buttonColor: banner?.buttonTextColor || "",
                                                            }}
                                                            redirectionType={banner?.redirectionType || ""}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </EmblaCarousel2>
                            </article>
                        </article>
                    </section>
                )}
        </>
    )
}

export default BannerSectionHotels
