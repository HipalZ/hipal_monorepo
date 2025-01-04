import BottomButton from "@/components/atom/bottomButton";
import useBusinessData from "@/components/store/useBusinessData";
import { useOwnerLogin } from "@/components/store/useOwnerLogin";
import useTempStore, { OrderMode, VerificationType } from "@/components/store/useTempStore";
import { cn } from "@/components/utils/helper";
import { apiRpc } from "@hi/common";
import { useMutation } from "@tanstack/react-query";
import { memo } from "react"
import toast from "react-hot-toast";

const MemoPosForm = () => {
    const { selectedPos, setSelecetdPos, posId, setPetPoojaId, petPoojaId, setRestaurantName, restaurantName, orderMode, setOrderMode, verificationType, setVerificationType } = useTempStore((s) => ({
        selectedPos: s.selectedPos,
        setSelecetdPos: s.setSelectedPos,
        posId: s.posId,
        setPetPoojaId: s.setPetPoojaId,
        petPoojaId: s.petPoojaId,
        setRestaurantName: s.setRestaurantName,
        restaurantName: s.restaurantName,
        orderMode: s.orderMode,
        setOrderMode: s.setOrderMode,
        verificationType: s.verificationType,
        setVerificationType: s.setVerificationType,
    }));
    const businessId = useBusinessData((s) => s.businessData?._id);
    const userId = useOwnerLogin((s) => s.user?._id);
    const toggleSelectedPos = () => {
        setSelecetdPos("");
    }
    const handleFormSubmit = useMutation({
        mutationFn: async (formData) => {
            // Call your API endpoint
            const response = await apiRpc.pos.setup_pos_config.$post({
                json: formData,
            });
            return response.json();
        },
        onSuccess: () => {
            toast.success("POS setup completed successfully:");
            setSelecetdPos("");
        },
        onError: (error) => {
            toast.error(error?.message || "Failed to submit POS details.");
        },
    });
    const handleForm = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = {
            businessId,
            posId,
            petPoojaId: petPoojaId,
            restName: restaurantName,
            orderMode,
            orderVerificationType: verificationType,
            userId
        }
        handleFormSubmit.mutate(formData);
    };
    return (
        <form
            onSubmit={handleForm}
            className="h-[85dvh] md:h-[70dvh] lg:h-[90dvh] 2xl:h-[75dvh] 2xl:w-full w-full overflow-y-auto bg-white p-4 lg:p-6 rounded-xl shadow-lg max-w-lg mx-auto"
        >
            <header className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 capitalize mb-2">
                    {selectedPos} POS Details
                </h1>
                <p className="text-sm text-gray-500">
                    Configure your POS system settings below
                </p>
            </header>

            {/* Restaurant Name */}
            <div className="mb-6">
                <label
                    htmlFor="Registered Name"
                    className="text-sm text-gray-700 font-semibold mb-1.5 flex items-center gap-1"
                >
                    Registered Name in Your POS
                    <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="restaurantName"
                    value={restaurantName}
                    placeholder="Enter POS registered Name"
                    onChange={(e) => setRestaurantName(e.target.value)}
                    className="mt-1 px-4 py-2.5 block w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    required
                    maxLength={100}
                    aria-required="true"
                />
                <p className="mt-2 text-sm text-gray-500 capitalize">
                    Your registered name in the {selectedPos} system
                </p>
            </div>

            {/* POS ID */}
            <div className="mb-6">
                <label
                    htmlFor="petPoojaId"
                    className="capitalize text-sm text-gray-700 font-semibold mb-1.5 flex items-center gap-1"
                >
                    {selectedPos} ID
                    <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="petPoojaId"
                    placeholder={`Enter ${selectedPos} ID`}
                    value={petPoojaId}
                    onChange={(e) => setPetPoojaId(e.target.value)}
                    className="mt-1 px-4 py-2.5 block w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    required
                    maxLength={100}
                    aria-required="true"
                />
                <p className="mt-2 text-sm text-gray-500 capitalize">
                    Your unique identifier in the {selectedPos} system
                </p>
            </div>

            {/* Order Mode */}
            <section className="mb-6">
                <fieldset>
                    <legend className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1">
                        Order Management Mode
                        <span className="text-red-500">*</span>
                    </legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label
                            className={cn(
                                "relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all",
                                orderMode === OrderMode.WITH_ORDER
                                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                                    : "border-gray-200 hover:border-blue-200"
                            )}
                        >
                            <input
                                type="radio"
                                name="orderMode"
                                value="withOrder"
                                checked={orderMode === OrderMode.WITH_ORDER}
                                onChange={() => setOrderMode(OrderMode.WITH_ORDER)}
                                className="sr-only"
                                required
                                aria-required="true"
                            />
                            <span className="font-semibold mb-2 text-gray-900">With Order Management</span>
                            <ul className="text-sm text-gray-600 list-disc list-inside">
                                <li>Full order tracking</li>
                                <li>Table management</li>
                                <li>Payment processing</li>
                            </ul>
                        </label>

                        <label
                            className={cn(
                                "relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all",
                                orderMode === OrderMode.WITHOUT_ORDER
                                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                                    : "border-gray-200 hover:border-blue-200"
                            )}
                        >
                            <input
                                type="radio"
                                name="orderMode"
                                value="withoutOrder"
                                checked={orderMode === OrderMode.WITHOUT_ORDER}
                                onChange={() => setOrderMode(OrderMode.WITHOUT_ORDER)}
                                className="sr-only"
                                required
                                aria-required="true"
                            />
                            <span className="font-semibold mb-2 text-gray-900">Without Order Management</span>
                            <span className="text-sm text-gray-600">
                                Basic customer experience management
                            </span>
                        </label>
                    </div>
                </fieldset>
            </section>

            <section className="mb-6">
                <fieldset>
                    <legend className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1">
                        Order Verification Method
                        <span className="text-red-500">*</span>
                    </legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label
                            className={`relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${verificationType === VerificationType.USER
                                ? "border-green-500 bg-green-50 ring-2 ring-green-200"
                                : "border-gray-200 hover:border-green-200"
                                }`}
                        >
                            <input
                                type="radio"
                                name="verificationType"
                                value="user"
                                checked={verificationType === VerificationType.USER}
                                onChange={() => setVerificationType(VerificationType.USER)}
                                className="sr-only"
                                required
                                aria-required="true"
                            />
                            <span className="font-semibold mb-2 text-gray-900">User Verification</span>
                            <span className="text-sm text-gray-600">
                                Orders go directly to KOT without approval
                            </span>
                        </label>

                        <label
                            className={cn(
                                "relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all",
                                verificationType === VerificationType.CAPTAIN
                                    ? "border-green-500 bg-green-50 ring-2 ring-green-200"
                                    : "border-gray-200 hover:border-green-200"
                            )}
                        >
                            <input
                                type="radio"
                                name="verificationType"
                                value="captain"
                                checked={verificationType === VerificationType.CAPTAIN}
                                onChange={() => setVerificationType(VerificationType.CAPTAIN)}
                                className="sr-only"
                                required
                                aria-required="true"
                            />
                            <span className="font-semibold mb-2 text-gray-900">Captain Verification</span>
                            <span className="text-sm text-gray-600">
                                Requires captain approval before KOT
                            </span>
                        </label>
                    </div>
                </fieldset>
            </section>
            <br />
            <br />

            {/* Action Buttons */}
            <BottomButton buttons={[
                { text: "Cancel", onClick: toggleSelectedPos, type: "button" },
                { text: "Submit", type: "submit" },
            ]} />
        </form>
    )
}

const PosForm = memo(MemoPosForm)
export default PosForm