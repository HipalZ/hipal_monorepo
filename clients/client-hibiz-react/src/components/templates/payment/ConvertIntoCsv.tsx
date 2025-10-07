import { memo, useCallback } from "react";
import AdvancedBottomButton from "@/components/atom/bottomButton/advancedBottomButton";
import { Download } from "lucide-react";
import DateRangePicker from "@/components/molecules/dateRangePicker";
import { type Filters, useSalesStore } from "@/components/store/useSalesStore";
import useTimings from "@/components/store/useTimings";
import { Button } from "@/components/ui/button";
import { RxCrossCircled } from "react-icons/rx";
import { CiFilter } from "react-icons/ci";
import { useMutation } from "@tanstack/react-query";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import useBusinessData from "@/components/store/useBusinessData";
import { fetchBillsCsvByType } from "@/api/billsQueries.ts";

const formatDate = (timestamp: number) => {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(d.getDate()).padStart(2, "0")}`;
};

interface ISalesPayloadCSV {
  businessId: string;
  from: string;
  to: string;
  appliedFilters?: Filters;
}

const MemoConvertIntoCsv = () => {
  const timeStampStart = useTimings((s) => s.timeStampStart);
  const timeStampEnd = useTimings((s) => s.timeStampEnd);
  const selectedFilters = useSalesStore((s) => s.selectedFilters);
  const setSelectedFilters = useSalesStore((s) => s.setSelectedFilters);
  const setDownloadCsv = useSalesStore((s) => s.setDownloadCsv);
  const setOpenFilterModal = useSalesStore((s) => s.setOpenFilterModal);
  const businessId = useBusinessData((s) => s.outletInfo?.businessId);
  const outletType = useBusinessData((s) => s?.outletInfo?.outLetType);

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
          .filter((f) => f.value.length > 0),
      );
    },
    [selectedFilters],
  );

  const { isPending, mutateAsync } = useMutation<Blob, Error, ISalesPayloadCSV>(
    {
      mutationFn: async (payload) =>
        fetchBillsCsvByType({
          businessId: payload.businessId,
          from: payload.from,
          to: payload.to,
          appliedFilter: selectedFilters,
          outletType,
        }),
      onSuccess: async (blob, variables) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        const fromStr = formatDate(Number(variables.from));
        const toStr = formatDate(Number(variables.to));
        const prefix = (outletType || "payments").toString();
        const fileName = `${prefix} ${fromStr} to ${toStr}.csv`;

        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
        setDownloadCsv(false);
      },
      onError: (error) => {
        console.error(error);
      },
    },
  );

  if (isPending) return <LoadingSpinner />;

  return (
    <div className="flex flex-col space-y-4 w-full max-w-[30rem] lg:max-w-[40rem] px-4">
      <DateRangePicker />
      <Button
        className="w-[7rem]"
        variant="outline"
        onClick={() => setOpenFilterModal(true)}
      >
        <CiFilter className="mr-2" /> Filters
      </Button>

      {selectedFilters && selectedFilters.length > 0 && (
        <>
          {selectedFilters.map((filter) => (
            <div key={filter.key} className="flex flex-wrap items-center gap-4">
              {filter?.value?.map((value) => (
                <Button
                  onClick={() => removeSingleFilter(filter.key, value)}
                  key={value}
                  className="capitalize whitespace-nowrap"
                >
                  {value}
                  <RxCrossCircled className="ml-2" />
                </Button>
              ))}
            </div>
          ))}
        </>
      )}

      <AdvancedBottomButton
        maxWidth="24rem"
        fixed={false}
        buttons={[
          {
            text: "Download",
            onClick: () =>
              mutateAsync({
                businessId: businessId || "",
                from: timeStampStart.toString(),
                to: timeStampEnd.toString(),
              }),
            icon: <Download />,
            className: "px-4 w-full",
          },
        ]}
      />
    </div>
  );
};

const ConvertIntoCsv = memo(MemoConvertIntoCsv);
export default ConvertIntoCsv;
