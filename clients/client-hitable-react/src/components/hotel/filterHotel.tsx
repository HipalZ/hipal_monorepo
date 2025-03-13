import UniversalFilterHotel from "./universalFilterHotel";

const FilterHotel = () => {
    return (
        <div className="flex flex-col min-h-[80dvh] py-6 hide-scrollbar overflow-y-scroll bg-white shadow-xl">
            <div className="px-4 sm:px-6">
                <div className="flex items-start justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                        Filter and Search
                    </h3>
                </div>
            </div>
            <UniversalFilterHotel />
        </div>
    )
}

export default FilterHotel
