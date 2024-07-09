import { useCroppedImage } from '@/components/store/useCroppedImage';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { FixedCropper, type FixedCropperRef, ImageRestriction } from 'react-advanced-cropper';
import 'react-advanced-cropper/dist/style.css';

export const cropImage = (imageSrc:string, coordinates:any) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = coordinates.width;
      canvas.height = coordinates.height;
      ctx?.drawImage(img, coordinates.left, coordinates.top, coordinates.width, coordinates.height, 0, 0, coordinates.width, coordinates.height);
      resolve(canvas.toDataURL());
    };
    img.onerror = (err) => {
      reject(err);
    };
  });
};

const ReactCropper = forwardRef(({ image, width, height }, ref) => {
  const setCroppedImage = useCroppedImage((s) => s.setCroppedImage);
  const cropperRef = useRef<FixedCropperRef>(null);

  useImperativeHandle(ref, () => ({
    getCoordinates: () => cropperRef.current?.getCoordinates(),
  }));

  const onChange = async (cropper) => {
    const coordinates = cropper.getCoordinates();
    try {
      const croppedDataUrl = await cropImage(image, coordinates);
      if (typeof croppedDataUrl === 'string') {
        setCroppedImage(croppedDataUrl);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <FixedCropper
      ref={cropperRef}
      src={image}
      onChange={onChange}
      stencilProps={{
        movable: false,
        resizable: false,
      }}
      stencilSize={{
        width: width ? width : 100,
        height: height ? height : 100,
      }}
      imageRestriction={ImageRestriction.stencil}
    />
  );
});

ReactCropper.displayName = 'ReactCropper';

export default ReactCropper;
