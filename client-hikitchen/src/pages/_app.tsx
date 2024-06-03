import "@/styles/globals.css";
import type { AppProps } from "next/app";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { Howl } from "howler";
import { useRouter } from "next/router";
import axios from '@/axios'
import { useKotStore } from "@/components/store/useKot";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  const { newKotCount, setKotData, setNewKotCount } = useKotStore();

  const router = useRouter();
  const { businessId, kitchenId } = router.query as {
    businessId: string;
    kitchenId: string;
  };

  const getAllKot = async () => {
    try {
      const res = await axios(
        `/v1/kitchens/Allkots/ByKitchens?kitchenId=${kitchenId}`
      );
      setNewKotCount(res.data.length);
      if (res.data.length > newKotCount) {
        const sound = new Howl({
          src: ["/sounds/kitchen.mp3"],
          autoplay: true,
          loop: true,
        });
        sound.play();
        setTimeout(() => {
          sound.pause();
        }, 3000);
      }
      setKotData(res.data);
    } catch (error) {
      setKotData([]);
      setNewKotCount(0);
      console.log(error);
    }
  };

  useEffect(() => {
    if (kitchenId) {
      let intervalId = setInterval(() => {
        getAllKot();
      }, 15000);
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [kitchenId, businessId, newKotCount]);

  useEffect(() => {
    document.body.style.overscrollBehaviorY = "none";

    return () => {
      document.body.style.overscrollBehaviorY = "";
    };
  }, []);

  return (
    <>
      <ToastContainer className="z-[999999]" />
      <QueryClientProvider client={queryClient}>
				<Component {...pageProps} />
			</QueryClientProvider>
    </>  
  );
} 
