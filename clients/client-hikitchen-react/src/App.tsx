import axios from '@/axios';
import { Howl } from 'howler';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useKotStore } from './components/store/useKot';
import MainRouter from './routes';

function App() {
  const { newKotCount, setKotData, setNewKotCount } = useKotStore();

  const { businessId, kitchenId } = useParams<{
    businessId: string;
    kitchenId: string;
  }>();

  const getAllKot = async () => {
    try {
      const res = await axios(`/v1/kitchens/Allkots/ByKitchens?kitchenId=${kitchenId}`);
      setNewKotCount(res.data.data.length);
      if (res.data.length > newKotCount) {
        const sound = new Howl({
          src: ['/sounds/kitchen.mp3'],
          autoplay: true,
          loop: true,
        });
        sound.play();
        setTimeout(() => {
          sound.pause();
        }, 3000);
      }
      setKotData(res.data.data);
    } catch (error) {
      setKotData([]);
      setNewKotCount(0);
      console.log(error);
    }
  };

  useEffect(() => {
    if (kitchenId) {
      const intervalId = setInterval(() => {
        getAllKot();
      }, 15000);
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [kitchenId, businessId, newKotCount]);

  useEffect(() => {
    document.body.style.overscrollBehaviorY = 'none';

    return () => {
      document.body.style.overscrollBehaviorY = '';
    };
  }, []);

  return <MainRouter />;
}

export default App;
