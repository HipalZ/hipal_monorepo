import { useCallback, useEffect, useRef, useMemo } from "react";
import type {
  EmblaCarouselType,
  EmblaEventType,
  EmblaOptionsType,
} from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import {
  NextButton,
  PrevButton,
  usePrevNextButtons,
} from "./emblaCarouselArrowButton";
import { DotButton, useDotButton } from "./emblaCarouselDotButton";
import { cn } from "@hi/common";
import { useMenuBanner } from "@/components/store/useMenuBanners";
import { useDishesStore } from "@/components/store/useDishesStore";
import LivePreview from "../menuBanner/livePreview";

const TWEEN_FACTOR_BASE = 0.2;

type PropType = {
  options?: EmblaOptionsType;
};

const numberWithinRange = (number: number, min: number, max: number): number =>
  Math.min(Math.max(number, min), max);

const EmblaCarouselPreview: React.FC<PropType> = (props) => {
  const { options } = props;
  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  const tweenFactor = useRef(0);
  const tweenNodes = useRef<HTMLElement[]>([]);

  const { selectedDishes, setMenuBannerType } = useMenuBanner((s) => ({
    selectedDishes: s.selectedDishes,
    setMenuBannerType: s.setMenuBannerType,
  }));

  // Fetch all dishes from the store
  const { dishes } = useDishesStore((s) => ({
    dishes: s.dishes,
  }));

  // Create array of selected dish objects
  const selectedDishObjects = useMemo(() => {
    return selectedDishes
      .map((dishID) => dishes.find((dish) => dish._id === dishID)) // Find dish object by ID
      .filter((dish) => dish !== undefined); // Filter out undefined dishes
  }, [selectedDishes, dishes]);

  const { selectedIndex, scrollSnaps, onDotButtonClick } =
    useDotButton(emblaApi);
  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi);

  const setTweenNodes = useCallback((emblaApi: EmblaCarouselType): void => {
    tweenNodes.current = emblaApi.slideNodes().map((slideNode) => {
      return slideNode.querySelector(".embla-_parallax__layer") as HTMLElement;
    });
  }, []);

  const setTweenFactor = useCallback((emblaApi: EmblaCarouselType) => {
    tweenFactor.current = TWEEN_FACTOR_BASE * emblaApi.scrollSnapList().length;
  }, []);

  const tweenParallax = useCallback(
    (emblaApi: EmblaCarouselType, eventName?: EmblaEventType) => {
      const engine = emblaApi.internalEngine();
      const scrollProgress = emblaApi.scrollProgress();
      const slidesInView = emblaApi.slidesInView();
      const isScrollEvent = eventName === "scroll";

      emblaApi.scrollSnapList().forEach((scrollSnap, snapIndex) => {
        let diffToTarget = scrollSnap - scrollProgress;
        const slidesInSnap = engine.slideRegistry[snapIndex];

        slidesInSnap.forEach((slideIndex) => {
          if (isScrollEvent && !slidesInView.includes(slideIndex)) return;

          if (engine.options.loop) {
            engine.slideLooper.loopPoints.forEach((loopItem) => {
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
            });
          }

          const translate = diffToTarget * (-1 * tweenFactor.current) * 100;

          // Calculate the scale based on the `diffToTarget`
          const tweenValue = 1 - Math.abs(diffToTarget * tweenFactor.current);
          const scale = numberWithinRange(tweenValue, 0.75, 1.25); // Scale between 0.75 and 1.25

          // Combine the translateX and scale transformations
          const tweenNode = tweenNodes.current[slideIndex];
          tweenNode.style.transform = `translateX(${translate}%) scale(${scale})`;
        });
      });
    },
    [],
  );

  useEffect(() => {
    if (!emblaApi) return;

    setTweenNodes(emblaApi);
    setTweenFactor(emblaApi);
    tweenParallax(emblaApi);

    emblaApi
      .on("reInit", setTweenNodes)
      .on("reInit", setTweenFactor)
      .on("reInit", tweenParallax)
      .on("scroll", tweenParallax)
      .on("slideFocus", tweenParallax);
  }, [emblaApi, tweenParallax]);

  console.log("selectedDishes", selectedDishes);

  return (
    <div className="embla">
      <div className="embla-_viewport" ref={emblaRef}>
        <div className="embla-_container">
          {selectedDishObjects.map((dish) => (
            <div className="embla-_slide" key={dish._id}>
              <div className="embla-_parallax">
                <div className={cn("embla-_parallax__layer")}>
                  {/* Pass dish object as prop */}
                  <LivePreview dish={dish} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 embla-_controls">
        <div className="embla-_buttons">
          <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
          <div className="embla-_dots">
            {scrollSnaps.map((_, index) => (
              <DotButton
                key={index}
                onClick={() => onDotButtonClick(index)}
                className={`transition-all duration-500 ease-in-out ${
                  index === selectedIndex
                    ? "bg-white w-[1rem] h-[0.5rem] rounded-xl transition-all delay-200"
                    : "bg-[#ffffff50] rounded-full w-[0.5rem] h-[0.5rem]"
                }`}
              />
            ))}
          </div>
          <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
        </div>
      </div>
    </div>
  );
};

export default EmblaCarouselPreview;
