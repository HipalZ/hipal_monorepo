import { memo, useEffect, useState } from 'react';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';
import { useSwipeable } from 'react-swipeable';

const Dot = ({ isActive }: { isActive: boolean }) => {
  return <span className={`mx-1 inline-block h-1 w-1 rounded-full transition duration-300 ${isActive ? 'bg-blue-500' : 'bg-gray-300'}`} />;
};

const Carousel = ({ images }: { images: any }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
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
    <div className="relative mx-6 h-[10vh]" {...handlers}>
      <div className="rounded-xl">
        {images.map((image: any, index: any) => (
          <div key={index.toString()} className="rounded-xl">
            <img
              src={image}
              alt=""
              className={`absolute h-full w-full rounded-xl object-cover transition-opacity duration-300 md:h-[7rem] lg:h-[7rem] xl:h-[10rem] ${
                index === currentIndex ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
            />
          </div>
        ))}
      </div>
      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 transform">
        {images.map((el: any, index: any) => (
          <Dot key={index.toString()} isActive={index === currentIndex} />
        ))}
      </div>

      <button type="button" className="absolute left-0 top-1/2 -translate-y-1/2 transform rounded-r p-4 text-transparent " onClick={prevSlide}>
        <BsChevronLeft className="h-6 w-6" />
      </button>

      <button type="button" className="absolute right-0 top-1/2 -translate-y-1/2 transform rounded-l p-4 text-transparent " onClick={nextSlide}>
        <BsChevronRight className="h-6 w-6" />
      </button>
    </div>
  );
};

export default memo(Carousel);
