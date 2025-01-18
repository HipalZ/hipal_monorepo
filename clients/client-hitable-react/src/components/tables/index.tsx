import { memo } from 'react';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input"
import SpinnerMemo from '../atoms/loadingSpinner';
import { useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../store/useCart';
import CommonBottomButton from '../atoms/bottomButton';
import type { TableData } from '../store/useZonesAndTable';
import { useTableData, useTableTransfer } from '../hooks/useTableData';

interface EmptyTableListProps {
    transfer?: boolean;
}

const MemoEmptyTableList = ({ transfer }: EmptyTableListProps) => {
    const navigate = useNavigate();
    const { businessId } = useParams();
    const { setIsPlacingNewOrder } = useCart();
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

    const handleTableClick = (table: TableData) => {
        if (transfer) {
            setToTable(table);
            return;
        }
        setIsPlacingNewOrder(true);
        return navigate(`/${businessId}/alerts/${table._id}`);
    };

    if (isLoading || isPending) return <SpinnerMemo />;

    return (
        <>
            <div className="relative pb-8 mx-auto h-[100dvh] lg:h-[80dvh] overflow-y-auto hide-scrollbar">
                <section className="sticky top-0 z-10 px-4 pt-4 pb-2 bg-white shadow-md rounded-t-2xl">
                    <h2 className="mb-2 text-xl font-bold md:text-2xl lg:text-3xl">
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
                    {filteredTables.length === 0 ? (
                        <p className="text-center text-gray-500">No tables found.</p>
                    ) : (
                        <div className="grid grid-cols-3 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                            {filteredTables.map((table) => (
                                <button
                                    type="button"
                                    onClick={() => handleTableClick(table)}
                                    key={table._id}
                                    className="p-4 text-center transition-shadow duration-300 bg-white border border-gray-200 rounded-lg hover:shadow-md"
                                >
                                    <h3 className="font-semibold">{table?.name}</h3>
                                </button>
                            ))}
                        </div>
                    )}
                </section>
            </div>

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
                            text: isConfirming ? "Confirm" : 'Transfer Table',
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

