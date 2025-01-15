import { memo } from 'react';
import useBusinessData from '@/components/store/useBusinessData';
import { type orderModal, useOrderStore } from '@/components/store/useOrderData';
import { SlidersHorizontal, Bell } from 'lucide-react';

interface OrdersHeaderProps {
    width?: string;
}

const MemoOrdersHeader: React.FC<OrdersHeaderProps> = ({ width = "30rem" }) => {
    const outletInfo = useBusinessData(s => s.outletInfo);
    const { setModalType, selectedTable, setOpenOrderModal } = useOrderStore()

    const openOrderModalHandler = (type: orderModal) => {
        setModalType(type)
        setOpenOrderModal(true)
    }
    return (
        <div>
            <header
                className="fixed top-0 z-10 flex items-center justify-between w-full px-4 py-3 bg-white shadow-md"
                style={{ maxWidth: width }}
            >
                {/* Logo Section */}
                <section className="flex items-center space-x-2">
                    <div className="w-[46px] h-[46px] rounded-full overflow-hidden">
                        <img
                            src={outletInfo?.logoUrl}
                            alt="logo"
                            className="object-cover w-full h-full"
                        />
                    </div>
                    <h1 className="-ml-8 text-xl font-bold text-gray-800">{selectedTable?.name}</h1>
                </section>

                <section className="flex items-center space-x-4">
                    <Bell className="w-6 h-6 text-red-500" />
                    <SlidersHorizontal onClick={() => openOrderModalHandler("options")} className="w-6 h-6 text-[#8E24AA]" />
                </section>
            </header>
        </div>
    );
};

const OrdersHeader = memo(MemoOrdersHeader);
export default OrdersHeader;

