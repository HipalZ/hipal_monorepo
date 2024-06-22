import axios from '@/axios';
import ErrorComponent from '@/components/errorComponent';
import type { SaleDuesResponse } from '@/components/types/businessData';
import { PAGE_TYPES, routePathsWithIds } from '@/components/utils/routes';
import { useQuery } from '@tanstack/react-query';
import { memo, startTransition, useEffect, useState } from 'react';
import { MdAdd, MdPerson } from 'react-icons/md'; // Assuming you are using 'react-icons/md'
import { useNavigate, useParams } from 'react-router-dom';
import AddPersonInDue from '../addPersonInDue';
import LoadingSpinner from '../loadingSpinner';
import PopUp from '../popUp';

interface IDuesPersons {
  businessId: string;
  duesPersonNames: string;
  id: string;
}

const SalesDues = memo(({ initialData, isLoadingDues }: { initialData: SaleDuesResponse; isLoadingDues: boolean }) => {
  const navigate = useNavigate();
  const { businessId } = useParams<{ businessId: string }>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [duesPersons, setDuesPersons] = useState<IDuesPersons[]>();
  const openModal = () => {
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    getDues();
  };

  const handleClick = (str: string) => {
    startTransition(() => {
      navigate(routePathsWithIds[PAGE_TYPES.DUES](businessId || '', str));
    });
  };
  const getDues = async () => {
    try {
      const res = await axios.get(`/v1/payments/Get/Dues?businessId=${businessId}`);
      setDuesPersons(res.data.data);
      return res.data.data;
    } catch (error) {
      console.log(error);
    }
  };

  const {
    isLoading,
    error,
    data: duesPData,
    refetch,
  } = useQuery<IDuesPersons[]>({
    queryKey: ['dues', businessId],
    queryFn: getDues,
    refetchOnWindowFocus: false,
    enabled: !!businessId,
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    params.set('tab', 'Dues');
    startTransition(() => {
      navigate({ search: params.toString() }, { replace: true });
    });
  }, [location, navigate]);

  if (error) return <ErrorComponent refetch={refetch} />;

  return (
    <div>
      {initialData && (
        <div className="mx-6 mt-6 rounded-lg bg-[#204D42] p-4 text-white">
          <div className="pb-2 text-xs">Total Dues</div>
          <div className="text-3xl font-normal">₹ {initialData.totalDues}</div>
        </div>
      )}
      <div className="masonry-layout mx-6 mt-6 pb-[6rem]">
        {duesPersons
          ? duesPersons?.map((due) => (
              <div
                key={due?._id}
                onClick={() => handleClick(due?._id)}
                className=" on_active_bounce masonry-item rounded-lg border border-[#cacaca] bg-white font-medium capitalize text-[#000000]"
              >
                <div className="flex items-center px-4 py-2">
                  <MdPerson className="mr-2" />
                  <span>{due?.duesPersonNames}</span>
                </div>
                <div className="flex items-center justify-end px-4 py-2">
                  <span>view</span>
                </div>
              </div>
            ))
          : null}
      </div>
      <div onClick={openModal} className="fixed flex items-center justify-center w-full px-6 bottom-6">
        <button
          type="button"
          className="on_active_bounce mt-4 w-full rounded-lg border border-[#000000] bg-white px-4 py-2 font-semibold text-[#000000]"
        >
          <div className="flex items-center justify-center">
            <MdAdd className="mr-2" />
            Add a person
          </div>
        </button>
      </div>
      {isModalOpen && (
        <PopUp show={isModalOpen} onClose={closeModal}>
          <AddPersonInDue closeModal={closeModal} />
        </PopUp>
      )}
      {(isLoadingDues || isLoading) && <LoadingSpinner />}
    </div>
  );
});

export default SalesDues;
