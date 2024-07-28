"use client";
import React, { memo, useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";

function MemoEmblaCarousel({ children }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false }, [Autoplay()]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  const onPrevClick = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const onNextClick = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());

    // Update the scaling classes based on the selected index
    const slides = emblaApi.slideNodes();
    slides.forEach((slide, index) => {
      if (index === emblaApi.selectedScrollSnap()) {
        slide.classList.add("embla__slide--scale-up");
        slide.classList.remove("embla__slide--scale-down");
      } else {
        slide.classList.add("embla__slide--scale-down");
        slide.classList.remove("embla__slide--scale-up");
      }
    });
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi?.scrollSnapList());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => emblaApi.off("select", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="embla">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="-space-x-8 embla__container">{children}</div>
      </div>
      <div className="py-4 mt-3 embla__button-container">
        <button
          type="button"
          className="px-2 border rounded-full border-primary embla__button embla__button--prev border-1"
          onClick={onPrevClick}
        >
          <FaAngleLeft size={24} />
        </button>
        <div className="embla__dots">
          {scrollSnaps.map((_, index) => (
            <button
              key={index.toString()}
              type="button"
              className={`embla__dot ${
                index === selectedIndex
                  ? "embla__dot--active"
                  : "embla__dot--inactive"
              }`}
              onClick={() => emblaApi?.scrollTo(index)}
            />
          ))}
        </div>
        <button
          type="button"
          className="px-2 border rounded-full border-primary embla__button embla__button--next border-1"
          onClick={onNextClick}
        >
          <FaAngleRight size={24} />
        </button>
      </div>
    </div>
  );
}

const EmblaCarousel = memo(MemoEmblaCarousel);
export default EmblaCarousel;
