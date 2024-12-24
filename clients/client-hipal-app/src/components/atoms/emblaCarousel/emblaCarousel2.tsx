"use client";
import type React from "react";
import { memo, useCallback, useEffect, useRef } from "react";
import type { EmblaCarouselType, EmblaEventType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import { useDotButton } from "./emblaCarouselDotButtons";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import Autoplay from "embla-carousel-autoplay";
import { cn } from "@/components/utils/helpers";

const TWEEN_FACTOR_BASE = 0.52;

const numberWithinRange = (number: number, min: number, max: number): number =>
  Math.min(Math.max(number, min), max);
interface IProps {
  children: React.ReactNode;
  customCarousel?: boolean;
}

const MemoEmblaCarouel2 = ({ children, customCarousel }: IProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ dragFree: true }, [
    Autoplay({
      active: true,
      delay: 5000,
    }),
  ]);
  const tweenFactor = useRef(0);
  const tweenNodes = useRef<HTMLElement[]>([]);
  const { selectedIndex, scrollSnaps, setSelectedIndex } =
    useDotButton(emblaApi);

  const setTweenNodes = useCallback((emblaApi: EmblaCarouselType): void => {
    tweenNodes.current = emblaApi.slideNodes().map((slideNode) => {
      return slideNode.querySelector(".embla__slide__number") as HTMLElement;
    });
  }, []);

  const setTweenFactor = useCallback((emblaApi: EmblaCarouselType) => {
    tweenFactor.current = TWEEN_FACTOR_BASE * emblaApi.scrollSnapList().length;
  }, []);

  const tweenScale = useCallback(
    (emblaApi: EmblaCarouselType, eventName?: EmblaEventType) => {
      const engine = emblaApi.internalEngine();
      const scrollProgress = emblaApi.scrollProgress();
      const slidesInView = emblaApi.slidesInView();
      const isScrollEvent = eventName === "scroll";

      emblaApi.scrollSnapList().forEach((scrollSnap, snapIndex) => {
        let diffToTarget = scrollSnap - scrollProgress;
        const slidesInSnap = engine.slideRegistry[snapIndex];

        for (const slideIndex of slidesInSnap) {
          if (isScrollEvent && !slidesInView.includes(slideIndex)) continue;

          if (engine.options.loop) {
            for (const loopItem of engine.slideLooper.loopPoints) {
              const target = loopItem.target();

              if (slideIndex === loopItem.index && target !== 0) {
                const sign = Math.sign(target);

                if (sign === -1) {
                  diffToTarget = scrollSnap - (1 + scrollProgress);
                }
                if (sign === 1) {
                  diffToTarget = scrollSnap + (1 - scrollProgress);
                }
              }
            }
          }

          const tweenValue = 1 - Math.abs(diffToTarget * tweenFactor.current);
          const scale = numberWithinRange(tweenValue, 0, 1).toString();
          const tweenNode = tweenNodes.current[slideIndex];
          if (tweenNode?.style) {
            tweenNode.style.transform = `scale(${scale})`;
          }
        }
      });
    },
    [tweenFactor.current, selectedIndex],
  );

  const onPrevClick = useCallback(() => {
    if (!emblaApi) return;

    if (selectedIndex === 0) {
      emblaApi.scrollTo(scrollSnaps.length - 1);
    } else {
      emblaApi.scrollPrev();
    }
  }, [emblaApi, selectedIndex, scrollSnaps]);

  const onNextClick = useCallback(() => {
    if (!emblaApi) return;

    if (selectedIndex === scrollSnaps.length - 1) {
      emblaApi.scrollTo(0);
    } else {
      emblaApi.scrollNext();
    }
  }, [emblaApi, selectedIndex, scrollSnaps]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    const slides = emblaApi.slideNodes();
    slides.forEach((slide, index) => {
      const scale = index === emblaApi.selectedScrollSnap() ? 1 : 0.92;
      slide.style.transform = `scale(${scale})`;
      slide.style.transition = "transform 0.3s ease";
    });
  }, [emblaApi, selectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setTweenNodes(emblaApi);
    setTweenFactor(emblaApi);
    tweenScale(emblaApi);

    emblaApi
      .on("reInit", setTweenNodes)
      .on("reInit", setTweenFactor)
      .on("reInit", tweenScale)
      .on("scroll", tweenScale)
      .on("slideFocus", tweenScale);
  }, [emblaApi, tweenScale]);
  return (
    <div className={cn("embla")}>
      <div
        className={cn(customCarousel ? "" : "embla__viewport")}
        ref={emblaRef}
      >
        <center
          className={cn(customCarousel ? "ml-6" : "", "embla__container")}
        >
          {children}
        </center>
      </div>
      <div
        className={cn(
          "pt-4 mt-3 embla__button-container flex items-center",
          customCarousel ? "!justify-center" : "justify-between",
        )}
      >
        {!customCarousel && (
          <button
            type="button"
            className="border rounded-full !border-primary embla__button embla__button--prev "
            onClick={onPrevClick}
          >
            <FaAngleLeft
              className="p-2 border rounded-full text-primary border-primary"
              size={36}
            />
          </button>
        )}
        <div className="embla__dots !space-x-2">
          {scrollSnaps.map((_, index) => (
            <button
              key={index.toString()}
              type="button"
              className={`transition-all duration-500 ease-in-out ${
                index === selectedIndex
                  ? "bg-primary w-[1rem] h-[0.5rem] rounded-xl transition-all delay-200"
                  : "bg-[#ffffff50] rounded-full w-[0.5rem] h-[0.5rem]"
              }`}
              onClick={() => emblaApi?.scrollTo(index)}
            />
          ))}
        </div>
        {!customCarousel && (
          <button
            type="button"
            className="border rounded-full !border-primary embla__button embla__button--next "
            onClick={onNextClick}
          >
            <FaAngleRight
              className="p-2 border rounded-full text-primary border-primary"
              size={36}
            />
          </button>
        )}
      </div>
    </div>
  );
};

const EmblaCarousel2 = memo(MemoEmblaCarouel2);
export default EmblaCarousel2;
