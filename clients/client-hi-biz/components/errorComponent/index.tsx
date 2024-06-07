import Hi from '@/assets/svg/hi.svg';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { memo } from 'react';
import { useSelectedIcon } from '../store/useSelectedIcon';

const ErrorComponent = ({ refetch }: any) => {
  const router = useRouter();
  const setSelectedSubIcon = useSelectedIcon((s) => s.setSelectedSubIcon);
  const setSelectedIcon = useSelectedIcon((s) => s.setSelectedIcon);
  const navigateToHome = () => {
    setSelectedSubIcon('');
    setSelectedIcon('');
  };
  return (
    <div className="absolute left-1/2 top-1/2 flex h-[15rem] max-h-full w-[80%] -translate-x-1/2 -translate-y-1/2 transform flex-col items-center justify-center rounded border border-[#000] bg-white p-5 shadow-md">
      <Image src={Hi} alt="Hi" height={30} width={30} />
      &nbsp; &nbsp;
      <p className="text-2xl">Something went wrong...</p>
      &nbsp;
      <section className="flex justify-between space-x-6">
        <button type="button" className="mt-2 rounded bg-red-500 px-4 py-2 text-white focus:outline-none" onClick={() => refetch()}>
          Retry
        </button>
        <button type="button" className="mt-2 rounded bg-blue-500 px-4 py-2 text-white focus:outline-none" onClick={navigateToHome}>
          Go to Home
        </button>
      </section>
      <br />
    </div>
  );
};

export default memo(ErrorComponent);
