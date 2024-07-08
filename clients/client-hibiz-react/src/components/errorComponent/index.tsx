import Hi from '@/assets/svg/hi.svg';
import { memo, startTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelectedIcon } from '../store/useSelectedIcon';

const ErrorComponent = ({ refetch }:{refetch: ()=>void}) => {
  const navigate = useNavigate();
  const setSelectedSubIcon = useSelectedIcon((s) => s.setSelectedSubIcon);
  const setSelectedIcon = useSelectedIcon((s) => s.setSelectedIcon);
  const navigateToHome = () => {
    startTransition(() => {
      navigate(-1);
    });
    setSelectedSubIcon('');
    setSelectedIcon('');
  };
  return (
    <div className="absolute left-1/2 top-1/2 flex h-[15rem] max-h-full w-[80%] -translate-x-1/2 -translate-y-1/2 transform flex-col items-center justify-center rounded border border-[#000] bg-white p-5 shadow-md">
      <img src={Hi} alt="Hi" height={30} width={30} loading="lazy" />
      &nbsp; &nbsp;
      <p className="text-2xl">Something went wrong...</p>
      &nbsp;
      <section className="flex justify-between space-x-6">
        <button type="button" className="px-4 py-2 mt-2 text-white bg-red-500 rounded focus:outline-none" onClick={() => refetch()}>
          Retry
        </button>
        <button type="button" className="px-4 py-2 mt-2 text-white bg-blue-500 rounded focus:outline-none" onClick={navigateToHome}>
          Go to Home
        </button>
      </section>
      <br />
    </div>
  );
};

const MemoizedErrorComponent = memo(ErrorComponent);

export default MemoizedErrorComponent;
