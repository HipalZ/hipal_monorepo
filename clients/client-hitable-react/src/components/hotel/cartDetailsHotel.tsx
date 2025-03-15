import { motion } from "framer-motion";
import { cn } from "../utils/helpers";

const CartDetailsHotel = ({ cart }: { cart }) => {
    return (
        <div>
            {cart.map((item, index) => (
                <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                        "flex items-start gap-4 p-2 bg-gray-50 shadow-sm",
                        index !== cart.length - 1 && "border-b border-gray-100"
                    )}
                >
                    <div className="flex-1 min-w-0">
                        <h4 className="text-base font-medium text-gray-900 truncate">
                            {item?.dish?.name}
                        </h4>

                        {item.portion && (
                            <p className="italic mt-0.5 text-sm text-gray-500">
                                Portion: {item?.portion?.name}
                            </p>
                        )}

                        {item.extras.length > 0 && (
                            <p className="italic mt-1 text-sm text-gray-500">
                                Extras: {item.extras.map(extra => extra.name).join(", ")}
                            </p>
                        )}

                        {item?.dish?.description && (
                            <p className="inline-flex italic mt-1 gap-1 text-sm text-gray-500">
                                <span>⚠</span> {item?.dish?.description}
                            </p>
                        )}
                    </div>

                    <div className="text-right flex-shrink-0">
                        <div className="px-2 py-1 text-sm font-medium text-gray-600 bg-gray-50 rounded">
                            × {item.quantity}
                        </div>
                        <p className="mt-1 text-base font-semibold text-gray-900">
                            ₹{(item?.dish?.price * item?.quantity).toFixed(2)}
                        </p>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default CartDetailsHotel;
