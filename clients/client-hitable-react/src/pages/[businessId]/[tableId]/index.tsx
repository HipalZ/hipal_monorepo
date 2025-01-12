import { useState, useCallback, Suspense, lazy } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { MdRestaurantMenu, MdReceipt } from 'react-icons/md';
import { motion } from 'framer-motion';
import { apiRpc } from '@hi/common';
import { Button } from '@/components/ui/button';
import { type orderModal, useOrderStore } from '@/components/store/useOrderData';
import { ScrollArea } from '@/components/ui/scroll-area';
import SpinnerMemo from '@/components/atoms/loadingSpinner';
import CustomerInformation from '@/components/atoms/placeOrders/customerInformation';
import ForceSettle from '@/components/atoms/placeOrders/forceSettle';
import BillPopUp from '@/components/atoms/billPopUp';

// Lazy loaded components
const PlaceOrders = lazy(() => import('@/components/atoms/placeOrders'));
const BottomPopUp = lazy(() => import('@/components/atoms/universalPopup'));
const CommonBottomButton = lazy(() => import('@/components/atoms/bottomButton'));
const OrdersHeader = lazy(() => import('@/components/atoms/placeOrders/header'));
const TableOptions = lazy(() => import('@/components/atoms/placeOrders/tableOptions'));
const AddTableCount = lazy(() => import('@/components/atoms/placeOrders/addTableCount'));
const Category = lazy(() => import('@/components/atoms/placeOrders/category'));
const CartItem = lazy(() => import('@/components/atoms/placeOrders/cartItem'));
const Bill = lazy(() => import('@/components/atoms/placeOrders/bill'));
// cosnt CustomerInformation = lazy(() => import('@/components/atoms/placeOrders/customerInformation'));

const TablePos = () => {
    const { tableId, businessId } = useParams();
    const navigate = useNavigate();
    const {
        setSelectedTable,
        setModalType,
        selectedTable,
        openOrderModal,
        modalType,
        setOpenOrderModal,
        setPaymentSteps,
    } = useOrderStore();

    const [activeTab, setActiveTab] = useState('orders');

    const goToAlerts = useCallback(() => {
        navigate(`/${businessId}/alerts`);
    }, [businessId, navigate]);

    const openOrderModalHandler = useCallback(
        (type: orderModal) => {
            if (type === "bill") {
                setPaymentSteps(0);
            }
            setModalType(type);
            setOpenOrderModal(true);
        },
        [setModalType, setOpenOrderModal]
    );

    const closeOrderModalHandler = useCallback(() => {
        setOpenOrderModal(false);
    }, [setOpenOrderModal]);

    const fetchIndividualTable = async () => {
        const response = await apiRpc.table[':tableId'].$get({
            param: { tableId },
        });
        const res = await response.json();
        setSelectedTable(res?.data);
        return res?.data;
    };

    useQuery({
        queryKey: ['fetchIndividualTable', tableId],
        queryFn: fetchIndividualTable,
        enabled: !!tableId,
    });

    return (
        <div className="relative w-full max-w-[30rem] mx-auto min-h-[100dvh] bg-gray-50">
            <OrdersHeader />

            {/* Tabs */}
            <section className="sticky z-10 top-[4.25rem] py-2 bg-white shadow-sm">

                {
                    selectedTable?.status !== "EMPTY" && (

                        <div className="flex">
                            <Button
                                variant={activeTab === 'orders' ? 'default' : 'ghost'}
                                className="flex-1 border border-black rounded-none"
                                onClick={() => setActiveTab('orders')}
                            >
                                <MdRestaurantMenu className="w-5 h-5 mr-2" />
                                Orders
                            </Button>
                            <Button
                                variant={activeTab === 'bill' ? 'default' : 'ghost'}
                                className="flex-1 border border-black rounded-none"
                                onClick={() => openOrderModalHandler('bill')}
                            >
                                <MdReceipt className="w-5 h-5 mr-2" />
                                Bill
                            </Button>
                        </div>
                    )
                }

            </section>

            {/* Content Area */}
            <ScrollArea className="flex-grow min-h-[100dvh]">
                {activeTab === 'orders' && (
                    <Suspense fallback={<SpinnerMemo />}>
                        <PlaceOrders />
                    </Suspense>
                )}
            </ScrollArea>

            {/* Bottom Navigation */}
            <Suspense fallback={<SpinnerMemo />}>
                <CommonBottomButton
                    position="mid"
                    maxWidth="30rem"
                    buttons={[
                        {
                            text: '',
                            onClick: goToAlerts,
                            isBackButton: true,
                            className: 'rounded-md pl-3',
                        },
                        {
                            text: 'Add items',
                            onClick: () => openOrderModalHandler('addItem'),
                            className: 'w-1/2 ml-4 rounded-md',
                        },
                    ]}
                />
            </Suspense>


            {/* Pop-Up Modal */}
            {openOrderModal && (
                <Suspense fallback={<SpinnerMemo />}>
                    <BottomPopUp
                        height="h-[100dvh]"
                        hide
                        bottomCross={
                            modalType !== 'addItem'
                            && modalType !== 'liveCart'

                        }
                        show={openOrderModal}
                        onClose={closeOrderModalHandler}
                    >
                        <OrdersHeader width='48rem' />
                        <ScrollArea className="lg:h-[100dvh] min-h-[100dvh]">
                            {modalType === 'guest' && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="p-4"
                                >
                                    <Suspense fallback={<SpinnerMemo />}>
                                        <AddTableCount key={selectedTable?.capacity} selectedTable={selectedTable} />
                                    </Suspense>
                                </motion.div>
                            )}
                            {modalType === 'options' && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="p-4"
                                >
                                    <Suspense fallback={<SpinnerMemo />}>
                                        <TableOptions />
                                    </Suspense>
                                </motion.div>
                            )}
                            {modalType === 'addItem' && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                >
                                    <Suspense fallback={<SpinnerMemo />}>
                                        <Category />
                                    </Suspense>
                                </motion.div>
                            )}
                            {modalType === 'liveCart' && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                >
                                    <Suspense fallback={<SpinnerMemo />}>
                                        <CartItem />
                                    </Suspense>
                                </motion.div>
                            )}
                            {modalType === 'bill' && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                >
                                    <Suspense fallback={<SpinnerMemo />}>
                                        <Bill />
                                    </Suspense>
                                </motion.div>
                            )}
                            {
                                modalType === "customer" && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                    >
                                        <Suspense fallback={<SpinnerMemo />}>
                                            <CustomerInformation />
                                        </Suspense>
                                    </motion.div>
                                )
                            }
                            {
                                modalType === "free" && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                    >
                                        <ForceSettle />
                                    </motion.div>
                                )
                            }
                        </ScrollArea>
                    </BottomPopUp>
                </Suspense>
            )}
        </div>
    );
};

export default TablePos;
