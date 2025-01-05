import { FaArrowLeft } from "react-icons/fa";
import MemoizedHeader from "@/components/molecules/header";
import { useNavigate } from "react-router-dom";
import Hi from "@/assets/svg/hi.svg";
import useBusinessData from "@/components/store/useBusinessData";
import { useQuery } from "@tanstack/react-query";
import { apiRpc } from "@hi/common";
import { memo, useCallback } from "react";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import useTempStore from "@/components/store/useTempStore";
import PosForm from "@/components/templates/posForm";
import MiddlePopUp from "@/components/atom/middlePopUp";
import type { IListPos } from "@/components/types/businessData";

interface PosData {
    _id: string;
    name: string;
}

const MemoPOS = () => {
    const businessData = useBusinessData((s) => s.businessData);
    const { setPosId, selectedPos, setSelectedPos } = useTempStore((s) => ({
        setPosId: s.setPosId,
        selectedPos: s.selectedPos,
        setSelectedPos: s.setSelectedPos,
    }));

    const navigate = useNavigate();

    // Back Button Handler
    const handleBack = useCallback(() => {
        navigate(`/app/business/${businessData?._id}`);
    }, [businessData, navigate]);

    // ✅ POS Selection Handler
    const selectPos = useCallback((posName: string) => {
        setSelectedPos(posName);
    }, [setSelectedPos]);

    const handlePosSelection = useCallback((pos: IListPos) => {
        selectPos(pos.name)
        setPosId(pos._id)
    }, [selectPos, setPosId]);

    // Fetch All POS
    const fetchAllPos = async (businessId: string) => {
        try {
            const response = await apiRpc.pos.all_pos.$get({
                businessId,
            });
            const res = await response.json();
            return res.data as PosData[];
        } catch (e) {
            console.error(e);
            throw new Error("Failed to fetch POS data");
        }
    };

    // Query to Fetch POS Data
    const { data: posList, isLoading } = useQuery({
        queryKey: ["fetchAllPos", businessData?._id],
        queryFn: () => fetchAllPos(businessData?._id || ""),
        enabled: !!businessData?._id,
    });

    return (
        <main className="min-h-screen bg-gray-50">
            <header className="linear_gradient_background">
                <MemoizedHeader
                    title="POS"
                    leftIcon={<FaArrowLeft />}
                    rightImage={Hi}
                    onBack={handleBack}
                />
            </header>

            {/* POS List Section */}
            <section className="p-4 md:p-6">
                {isLoading ? (
                    <LoadingSpinner />
                ) : (
                    <div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                        role="list"
                        aria-label="POS software list"
                    >
                        {posList?.map((pos) => (
                            <article
                                key={pos._id}
                                role="listitem"
                            >
                                <button
                                    type="button"
                                    onClick={() => handlePosSelection(pos)}
                                    className="bg-white w-full h-24 overflow-hidden p-4 text-left border rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
                                    aria-label={`View details for ${pos.name}`}
                                >
                                    {pos.name === "petPooja" ? (
                                        <img
                                            alt="petPooja"
                                            src="https://gdm-catalog-fmapi-prod.imgix.net/ProductLogo/5ee5d327-b1e8-44ae-a2c6-6c9e358f3ec7.png"
                                            className="h-16 object-contain"
                                        />
                                    ) : (
                                        pos.name
                                    )}
                                </button>
                                <center className="text-xl mt-1 capitalize">{pos.name}</center>
                            </article>
                        ))}
                    </div>
                )}
            </section>
            {selectedPos?.length > 0 ? <>
                <MiddlePopUp show={selectedPos?.length > 0} onlyPopUp onClose={() => setSelectedPos("")}>
                    <PosForm />
                </MiddlePopUp>
            </> : null}
        </main>
    );
};

const POS = memo(MemoPOS);
export default POS;
