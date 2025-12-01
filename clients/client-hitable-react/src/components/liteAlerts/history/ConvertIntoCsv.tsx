import CommonBottomButton from '@/components/atoms/bottomButton';
import DateRangePicker from '@/components/atoms/dateRangePicker';
import SpinnerMemo from '@/components/atoms/loadingSpinner';
import { type Filters, useSalesStore } from '@/components/store/useSalesStore';
import useTimings from '@/components/store/useTimings';
import { Button } from '@/components/ui/button';
import { formatDateToIST } from '@/components/utils/helpers';
import { apiRpc } from '@hi/common';
import { useMutation } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import { memo, useCallback } from 'react';
import { CiFilter } from 'react-icons/ci';
import { RxCrossCircled } from 'react-icons/rx';
import { useParams } from 'react-router-dom';

const formatDate = (timestamp: number) => {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const MemoConvertIntoCsv = () => {
  const params = useParams();
  const timeStampStart = useTimings((s) => s.timeStampStart);
  const timeStampEnd = useTimings((s) => s.timeStampEnd);
  const selectedFilters = useSalesStore((s) => s.selectedFilters);
  const setSelectedFilters = useSalesStore((s) => s.setSelectedFilters);
  const setDownloadCsv = useSalesStore((s) => s.setDownloadCsv);
  const setOpenFilterModal = useSalesStore((s) => s.setOpenFilterModal);

  const removeSingleFilter = useCallback(
    (key: string, value: string) => {
      setSelectedFilters(
        selectedFilters
          .map((filter) => {
            if (filter.key === key) {
              return {
                ...filter,
                value: filter.value.filter((v) => v !== value),
              };
            }
            return filter;
          })
          .filter((filter) => filter.value.length > 0),
      );
    },
    [selectedFilters, setSelectedFilters],
  );

  interface ISalesPayloadCSV {
    businessId: string;
    from: string;
    to: string;
    appliedFilters?: Filters;
  }

  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (payload: ISalesPayloadCSV) => {
      const response = await apiRpc.payments[':id'].bills_csv.$get({
        query: {
          ...payload,
          appliedFilter: JSON.stringify(selectedFilters),
        },
        param: {
          id: payload.businessId,
        },
      });
      return response.blob();
    },
    onSuccess: async (blob, variables) => {
      const url = window.URL.createObjectURL(blob);

      const fromStr = formatDateToIST(Number(variables.from));
      const toStr = formatDateToIST(Number(variables.to));
      const fileName = `Combine reports ${fromStr} to ${toStr}.xlsx`;

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);

      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);

      window.URL.revokeObjectURL(url);
      setDownloadCsv(false);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  if (isPending) {
    return <SpinnerMemo />;
  }

  return (
    <div className="flex w-full max-w-[30rem] flex-col space-y-4 px-4 lg:max-w-[40rem]">
      <DateRangePicker />
      <Button className="w-[7rem]" variant="outline" onClick={() => setOpenFilterModal(true)}>
        <CiFilter className="mr-2" /> Filters
      </Button>
      {selectedFilters && selectedFilters.length > 0 && (
        <>
          {selectedFilters.map((filter) => (
            <div key={filter.key} className="flex flex-wrap items-center gap-4">
              {filter?.value?.map((value) => (
                <Button onClick={() => removeSingleFilter(filter.key, value)} key={value} className="whitespace-nowrap capitalize">
                  {value}
                  <RxCrossCircled className="ml-2" />
                </Button>
              ))}
            </div>
          ))}
        </>
      )}
      <CommonBottomButton
        maxWidth="24rem"
        fixed={false}
        buttons={[
          {
            text: 'Download',
            onClick: () =>
              mutateAsync({
                businessId: params.businessId,
                from: timeStampStart.toString(),
                to: timeStampEnd.toString(),
              }),
            icon: <Download />,
            className: 'px-4  w-full',
          },
        ]}
      />
    </div>
  );
};

const ConvertIntoCsv = memo(MemoConvertIntoCsv);
export default ConvertIntoCsv;
