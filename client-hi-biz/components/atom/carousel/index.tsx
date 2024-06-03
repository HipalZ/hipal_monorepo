import Image from "next/image";
import React, { memo, useEffect, useState } from "react";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { useSwipeable } from "react-swipeable";

const Dot = ({ isActive }: { isActive: boolean }) => {
  return (
    <span
      className={`inline-block mx-1 w-1 h-1 rounded-full transition duration-300 ${
        isActive ? "bg-blue-500" : "bg-gray-300"
      }`}
    />
  );
};

const Carousel = ({ images }: { images: any }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };

  const handlers = useSwipeable({
    onSwipedLeft: nextSlide, 
    onSwipedRight: prevSlide, 
    preventScrollOnSwipe: false,  
  });
  useEffect(() => {
    const timer = setTimeout(() => {
      nextSlide();
    }, 10000);

    return () => clearTimeout(timer); // This will clear the timer when the component is unmounted.
  }, [currentIndex]);

  return (
    <div className="relative h-[10vh] mx-6" {...handlers}>
      <div className="rounded-xl">
        {images.map((image: any, index: any) => (
      <div key={index.toString()} className="rounded-xl"> 
            <Image
            
            src={image}
            alt=""
            className={`absolute w-full h-full lg:h-[7rem] md:h-[7rem] xl:h-[10rem] rounded-xl object-cover transition-opacity duration-300 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          />
      </div>
        ))}
      </div>
      <div className="absolute flex transform -translate-x-1/2 bottom-2 left-1/2">
        {images.map((el:any, index:any) => (
          <Dot key={index.toString()} isActive={index === currentIndex} />
        ))}
      </div>

      <button
        type="button"
        className="absolute left-0 p-4 text-transparent transform -translate-y-1/2 rounded-r top-1/2 "
        onClick={prevSlide}
      >
        <BsChevronLeft className="w-6 h-6" />
      </button>

      <button
        type="button"
        className="absolute right-0 p-4 text-transparent transform -translate-y-1/2 rounded-l top-1/2 "
        onClick={nextSlide}
      >
        <BsChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
};

export default memo(Carousel);
