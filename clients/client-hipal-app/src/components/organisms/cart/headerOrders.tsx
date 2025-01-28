import { memo } from 'react';
import { useCartStore } from '@/components/store/useCartStore';
import dynamic from 'next/dynamic';
import glassTable from "@/assets/cart/glassTable.png";
import Image from 'next/image'

const MemoOrdersHeader = () => {
    const { cartHistory } = useCartStore();
    return (
        <header className="flex items-start justify-between px-4 pt-4 poppins-regular sticky top-0 flex-none bg-white border-b shadow-lg">
            <section className="gap-2 text-gray-600">
                <h1 className="text-2xl font-medium">Final Cart</h1>
                {cartHistory[0]?.tableName && (
                    <article className="text-base text-gray-500 inline-flex items-center gap-1">
                        <Image src={glassTable} alt="Table" className="pb-1 -ml-2" />
                        Table <span className="font-semibold text-black">{cartHistory[0]?.tableName}</span>
                    </article>
                )}
            </section>
        </header>
    )
}

const OrdersHeader = memo(MemoOrdersHeader)
export default OrdersHeader