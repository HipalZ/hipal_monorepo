import { apiRpc } from '@hi/common';
import { useQuery } from '@tanstack/react-query';
import { memo, useMemo, useState } from 'react';
import useBusinessData from '../store/useBusinessData';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input"
import SpinnerMemo from '../atoms/loadingSpinner';
import type { TableData } from '../store/useZonesAndTable';
import { useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../store/useCart';

const MemoTableIconList = () => {
    const navigate = useNavigate();
    const { businessId } = useParams();
    const outletInfo = useBusinessData(s => s.outletInfo);
    const [searchTerm, setSearchTerm] = useState('');
    const { setIsPlacingNewOrder } = useCart()

    const getAllTables = async (): Promise<TableData[]> => {
        const response = await apiRpc.table.empty_table[':businessId'].$get({
            param: {
                businessId: outletInfo?.businessId
            }
        });
        const res = await response.json();
        return res?.data || [];
    };

    const { isLoading, data } = useQuery({
        queryKey: ['getAllTables', outletInfo?.businessId],
        queryFn: getAllTables,
        enabled: !!outletInfo?.businessId
    });

    const filteredTables = useMemo(
        () => data?.filter((t) =>
            t?.name.toLowerCase().includes(searchTerm.toLowerCase())
        ) || [],
        [data, searchTerm]
    );

    const goToTable = (table: TableData) => {
        setIsPlacingNewOrder(true)
        navigate(`/${businessId}/alerts/${table._id}`);
    }


    if (isLoading) return (
        <SpinnerMemo />
    );

    return (
        <div className="relative pb-8 mx-auto h-[100dvh] lg:h-[80dvh] overflow-y-auto hide-scrollbar">
            <section className="sticky top-0 z-10 px-4 pt-4 pb-2 bg-white shadow-md rounded-t-2xl">

                <h2 className="mb-2 text-xl font-bold md:text-2xl lg:text-3xl">Restaurant Tables</h2>
                <div className="mb-2">
                    <div className="relative">
                        <Search className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                        <Input
                            type="search"
                            placeholder="Search tables..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full py-2 pl-10 pr-4"
                        />
                    </div>
                </div>
            </section>
            <section className="px-4 pt-6 pb-20 overflow-y-auto hide-scrollbar">

                {filteredTables.length === 0 ? (
                    <p className="text-center text-gray-500">No tables found.</p>
                ) : (
                    <div className="grid grid-cols-3 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                        {filteredTables.map((table) => (
                            <button type="button" onClick={() => goToTable(table)} key={table._id} className="p-4 text-center transition-shadow duration-300 bg-white border border-gray-200 rounded-lg hover:shadow-md">
                                <h3 className="font-semibold">{table?.name}</h3>
                            </button>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

const TableIconList = memo(MemoTableIconList);
export default TableIconList;

