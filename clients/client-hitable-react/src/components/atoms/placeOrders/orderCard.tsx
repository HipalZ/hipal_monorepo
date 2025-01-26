import { motion } from 'framer-motion'
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { MdInfo, MdPerson, MdRestaurantMenu } from "react-icons/md"
import type { OrderData } from "@/components/types/hiClientzData"
import { Badge } from '@/components/ui/badge'

interface CompactOrderCardProps {
    order: OrderData
}

const EnhancedOrderCard: React.FC<CompactOrderCardProps> = ({ order }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="mb-3 overflow-hidden">
                <CardContent className="p-3">
                    {
                        order?.transferd && (
                            <section className='flex items-center justify-between gap-2'>
                                <Badge variant="destructive" className="mb-2">
                                    <span>Transferred by {order?.transferedBy?.name}</span>
                                </Badge>
                                <Badge variant="secondary" className="mb-2 text-base">
                                    <span>{`${order?.fromTable} => ${order?.toTable}`}</span>
                                </Badge>
                            </section>
                        )
                    }
                    <div className="flex items-center justify-between gap-1 mb-2">
                        <div className="flex items-center truncate">
                            <MdPerson className="mr-1 text-gray-500" />
                            <span className="font-semibold">{order?.name}</span>
                        </div>
                        <h3 className="text-sm font-semibold opacity-60">{new Date(order?.date).toLocaleString("en-In")}</h3>
                    </div>
                    <Separator className="my-2" />
                    <div className="space-y-4">
                        {order?.cart.map((item) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2 }}
                                className="grid grid-cols-12 gap-2 text-sm"
                            >
                                {/* Dish Name */}
                                <div className="flex items-center col-span-8">
                                    <MdRestaurantMenu className="mr-2 text-gray-500" />
                                    <span>{item?.dish?.name}</span>
                                    {item?.portion && (
                                        <span className="ml-1 text-xs text-gray-500">({item?.portion?.name})</span>
                                    )}
                                </div>

                                {/* Quantity */}
                                <div className="col-span-2 text-center">
                                    x{item?.quantity}
                                </div>

                                {/* Dish & Portion Price */}
                                <div className="col-span-2 text-right">
                                    ₹{(
                                        item?.dish?.price * item?.quantity +
                                        (item.portion ? item.portion.price * item.quantity : 0)
                                    ).toFixed(2)}
                                </div>

                                {/* Extras */}
                                {item?.extras && item.extras.length > 0 && (
                                    <div className="col-span-12 ml-8 space-y-1 text-xs text-gray-500">
                                        {item.extras.map((extra) => (
                                            <div key={extra.id} className="grid grid-cols-12 gap-2">
                                                <span className="col-span-8">{extra.name} (x{extra.quantity})</span>
                                                <span className="col-span-4 text-right">
                                                    ₹{(extra.price * extra.quantity).toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {item?.dish?.instruction && (
                                    <div className="col-span-12 mt-2">
                                        <div className="p-2 rounded-md bg-[#f7f7f7]">
                                            <p className="flex items-start text-xs">
                                                <MdInfo className="mr-1 mt-0.5 text-[#000000] flex-shrink-0" />
                                                <span className="font-medium">
                                                    <span className="font-normal">{item?.dish?.instruction}</span>
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                    <Separator className="my-2" />
                    <div className="flex items-center justify-between text-sm font-medium">
                        <span className='text-lg font-semibold'>Total</span>
                        <span className='text-lg font-semibold'>₹{order?.cart?.reduce((total, item) => {
                            const itemTotal = item.dish.price * item.quantity;
                            const portionTotal = item.portion ? item.portion.price * item.quantity : 0;
                            const extrasTotal = item.extras?.reduce((sum, extra) => sum + (extra.price * extra.quantity), 0) || 0;
                            return total + itemTotal + portionTotal + extrasTotal;
                        }, 0).toFixed(2)}</span>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

export default EnhancedOrderCard
