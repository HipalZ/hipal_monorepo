import axios from '@/axios';
import LoadingSpinner from '@/components/atom/loadingSpinner';
import ErrorComponent from '@/components/errorComponent';
import { useSelectedIcon } from '@/components/store/useSelectedIcon';
import { useZoneStore } from '@/components/store/useZoneStore';
import AddZone from '@/components/templates/zone';
import type { IZones } from '@/components/types/businessData';
import { downloadURI } from '@/components/utils/helper';
import { useQuery } from '@tanstack/react-query';
import { memo, startTransition, useState } from 'react';
import { GoDownload } from 'react-icons/go';
import { MdOutlineTableBar } from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';

const classCard = {
  text: 'text-xl',
  font: 'text-4xl',
  bg: 'bg-[#2F80ED]/10',
};

const Zones = memo(() => {
  const { data, setData } = useZoneStore();
  const { zones, tables } = data;
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { businessId } = useParams<{ businessId: string }>();
  const { setSelectedSubIcon, selectedSubIcon } = useSelectedIcon();
  const handleEditButton = (id: string) => {
    startTransition(() => {
      navigate(`/app/business/${businessId}/zone/${id}`);
    });
  };
  const handleAddZone = () => {
    setSelectedSubIcon('addZones');
  };
  const getTablesData = async (businessId: string) => {
    try {
      const tables = await axios.get(`/v1/zones/all/tables?businessId=${businessId}`);
      setData({
        tables: tables.data.data,
      });
      return tables.data.data;
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getZonesData = async (businessId: string) => {
    try {
      const zones = await axios.get(`/v1/zones?businessId=${businessId}`);
      setData({ zones: zones?.data.data });
      return zones.data.data;
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const {
    isLoading: isTableDataPending,
    error: TableErrorData,
    data: tableData,
    refetch: refetchTableData,
  } = useQuery({
    queryKey: ['tablesData', businessId],
    queryFn: () => getTablesData(businessId),
    enabled: !!businessId,
  });

  const {
    isLoading: isZoneDataPending,
    error: ZoneErrorData,
    data: zoneData,
    refetch: refetchZoneData,
  } = useQuery({
    queryKey: ['zonesData', businessId],
    queryFn: () => getZonesData(businessId),
    enabled: !!businessId,
  });

  if (TableErrorData) return <ErrorComponent refetch={refetchTableData} />;
  if (ZoneErrorData) return <ErrorComponent refetch={refetchZoneData} />;

  const ZonesData = () => {
    return (
      <div className="mb-[10rem]">
        {zones?.map((zone) => {
          return (
            <div key={zone?._id}>
              <div className="p-3 mx-6 mt-6 border border-gray-200 rounded-lg border-1">
                <div className="flex items-center justify-between pb-3">
                  <h1 className="text-base font-semibold capitalize text-[#000000]">{zone.zoneName}</h1>
                  <div onClick={() => handleEditButton(zone)}>
                    <button type="button" className="text-[#2F80ED] hover:underline">
                      Edit
                    </button>
                  </div>
                </div>
                {zone?.tables && zone?.tables?.length > 0 ? (
                  <>
                    <hr className="h-0.5 bg-[#cacaca]" />
                    <div className="flex items-center justify-between pb-3 mb-2 border-b-1">
                      <h1 className="mt-3 text-[#000000]/70">Tables in this zone</h1>
                      <p>{zone?.tables?.length}</p>
                    </div>
                  </>
                ) : null}
                <div className="grid grid-cols-1 md:grid-cols-2 md:gap-2 lg:grid-cols-4">
                  {tables?.map(
                    (table) =>
                      table?.zoneId === zone?._id && (
                        <div key={table?._id} className="my-1">
                          <div className="flex w-full items-center rounded-lg border border-[#CACACA] p-2">
                            <div className="flex justify-between">
                              <MdOutlineTableBar className={` ${classCard.font} ${classCard.bg} rounded-full px-2`} />
                            </div>
                            <div className="px-2 text-base font-medium">{table.name}</div>
                            <div
                              onClick={async () => {
                                setIsLoading(true);
                                await downloadURI(table?._id, table?.name, table?.zoneId, businessId || '');
                                setIsLoading(false);
                              }}
                              className="on_active_bounce ml-auto flex items-center justify-self-end rounded-md border border-[#000000] px-2 py-1"
                            >
                              <GoDownload />
                              <span>Qr</span>
                            </div>
                          </div>
                        </div>
                      ),
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div className="fixed w-full px-6 bottom-5">
          <button type="button" onClick={handleAddZone} className="on_active_bounce w-full rounded-md bg-[#000000] py-2.5 text-white">
            Add Zone
          </button>
        </div>
        {isLoading && <LoadingSpinner />}
        {isZoneDataPending && <LoadingSpinner />}
        {isTableDataPending && <LoadingSpinner />}
      </div>
    );
  };
  const renderData = () => {
    switch (selectedSubIcon) {
      case 'addZones':
        return <AddZone refetchZoneData={refetchZoneData} />;

      default:
        return <ZonesData />;
    }
  };
  return <>{renderData()}</>;
});

export default Zones;
