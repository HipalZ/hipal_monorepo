import { memo, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input"
import SpinnerMemo from '../atoms/loadingSpinner';
import { useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../store/useCart';
import CommonBottomButton from '../atoms/bottomButton';
import { useZonesAndTablesStore, type TableData } from '../store/useZonesAndTable';
import { useTableData, useTableTransfer } from '../hooks/useTableData';
import { useOrderStore } from '../store/useOrderData';

interface EmptyTableListProps {
    transfer?: boolean;
}

const MemoEmptyTableList = ({ transfer }: EmptyTableListProps) => {
    const navigate = useNavigate();
    const { businessId } = useParams();
    const { setIsPlacingNewOrder } = useCart();
    const { selectedTable, selectedItems } = useOrderStore();
    const { isLoading, filteredTables, searchTerm, setSearchTerm } = useTableData();
    const {
        toTable,
        setToTable,
        isConfirming,
        setIsConfirming,
        isPending,
        closeTransferModal,
        confirmTransfer,
    } = useTableTransfer(businessId || '');

    const tables = useZonesAndTablesStore((s) => s.tables);

    const allTables = useMemo(() => {
        if (!transfer) {
            return filteredTables;
        }
        if (transfer && selectedItems.length > 0) {
            return [...new Map([...tables, ...filteredTables].map(item => [item._id, item])).values()];
        }
        if (transfer && selectedItems.length === 0) {
            return filteredTables;
        }
        return filteredTables;
    }, [transfer, selectedItems, tables, filteredTables]);

    const handleTableClick = (table: TableData) => {
        if (transfer) {
            setToTable(table);
            return;
        }
        setIsPlacingNewOrder(true);
        return navigate(`/${businessId}/alerts/${table._id}`);
    };

    if (isLoading || isPending) return <SpinnerMemo />;

    // const allTables = searchTerm.length > 0 && !transfer ? filteredTables : [...tables, ...filteredTables];

    return (
        <>
            {!isConfirming ? (
                <div className="relative pb-8 mx-auto h-[100dvh] lg:h-[80dvh] overflow-y-auto hide-scrollbar">
                    <section className="sticky top-0 z-10 px-4 pt-4 pb-2 bg-white shadow-md rounded-t-2xl">
                        <h2 className="mb-2 text-xl font-bold md:text-xl lg:text-2xl">
                            {transfer ? 'Transfer Table' : 'Tables'}
                        </h2>
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
                        {allTables?.length === 0 ? (
                            <p className="text-center text-gray-500">No tables found.</p>
                        ) : (
                            <div className="grid grid-cols-3 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                                {allTables?.map((table) => (
                                    <button
                                        type="button"
                                        onClick={() => handleTableClick(table)}
                                        key={table._id}
                                        className={`p-4 text-center transition-shadow duration-300 rounded-lg border ${toTable?._id === table._id
                                            ? 'bg-blue-100 border-blue-500 shadow-lg'
                                            : 'bg-white border-gray-200 hover:shadow-md'
                                            }`}
                                    >
                                        <h3 className="font-semibold">{table?.name}</h3>
                                    </button>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            ) : (
                <section className="flex flex-col items-center justify-center h-[80dvh] text-center px-4">
                    <h2 className="mb-4 text-xl font-bold text-red-600">
                        Warning: Please Confirm the Transfer!
                    </h2>
                    <p className="mb-6 text-gray-700">
                        Ensure that the items for table <strong>{toTable?.name}</strong> have been transferred in your desktop application before proceeding.
                    </p>
                    <p className="mb-6 text-gray-600">
                        This action cannot be undone. Please double-check before confirming.
                    </p>
                    <section>
                        Table is transferring from <strong>{selectedTable?.name}</strong> to <strong>{toTable?.name}</strong>
                    </section>
                </section>
            )}

            {transfer && (
                <CommonBottomButton
                    fixed
                    maxWidth="48rem"
                    buttons={[
                        {
                            text: 'Cancel',
                            onClick: isConfirming ? () => setIsConfirming(false) : closeTransferModal,
                            type: 'button',
                            className: 'pl-3 rounded-md',
                            isBackButton: true,
                        },
                        {
                            text: isConfirming ? 'Confirm' : 'Transfer Table',
                            onClick: isConfirming ? confirmTransfer : () => setIsConfirming(true),
                            type: 'button',
                            className: 'rounded-full',
                            swipe: true,
                            isLoading: isPending,
                            disable: !toTable,
                        },
                    ]}
                />
            )}
        </>
    );
};

const EmptyTableList = memo(MemoEmptyTableList);
export default EmptyTableList;


