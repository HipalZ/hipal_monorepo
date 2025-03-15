import { useHotelTemp } from "../store/useHotelTemp";

export const useImageNextPrev = () => {
  const { nextImage: nextImageStore, prevImage: prevImageStore } = useHotelTemp();
  
  const nextImage = (e: React.MouseEvent, roomId: string, imagesLength: number) => {
    e.stopPropagation();
    nextImageStore(roomId, imagesLength);
  };

  const prevImage = (e: React.MouseEvent, roomId: string, imagesLength: number) => {
    e.stopPropagation();
    prevImageStore(roomId, imagesLength);
  };

  const handleImageClick = (e: React.MouseEvent, roomId: string, imagesLength: number) => {
    const { clientX, currentTarget } = e;
    const { left, width } = currentTarget.getBoundingClientRect();
    const clickPosition = clientX - left;

    if (clickPosition < width / 2) {
      prevImage(e, roomId, imagesLength);
    } else {
      nextImage(e, roomId, imagesLength);
    }
  };

  return { nextImage, prevImage, handleImageClick };
};