import { memo } from 'react';
import { useCartStore } from '@/components/store/useCartStore';
import dynamic from 'next/dynamic';
import glassTable from "@/assets/cart/glassTable.png";
import Image from 'next/image'
const ScannerButton = dynamic(() => import('./scannerButton'));

const MemoOrdersHeader = () => {
    const { cartHistory } = useCartStore();
    return (
        <header className="flex items-center justify-between p-4 poppins-regular sticky top-0 flex-none bg-white border-b">
            <h1 className="text-2xl font-medium">Final Cart</h1>
            <section className="flex items-center gap-2 text-gray-600">
                {cartHistory[0]?.tableName && (
                    <article className="text-sm text-gray-500 inline-flex items-center gap-1">
                        <Image src={glassTable} alt="Table" className="pb-1" />
                        <span className="text-base">Table {cartHistory[0]?.tableName}</span>
                    </article>
                )}
            </section>
            <ScannerButton />
        </header>
    )
}

const OrdersHeader = memo(MemoOrdersHeader)
export default OrdersHeader