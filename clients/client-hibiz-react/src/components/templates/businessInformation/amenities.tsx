import { useBizInfoChanges } from '@/components/helpers/bizInforHelpers';
import useBusinessData from '@/components/store/useBusinessData';
import { useExploreTemp } from '@/components/store/useExploreTemp';
import { FaBed, FaConciergeBell, FaGlassMartiniAlt, FaHotel, FaSwimmingPool } from 'react-icons/fa';
import { GiCastle, GiGymBag } from 'react-icons/gi';
import { IoBeerOutline, IoWifiOutline } from 'react-icons/io5';
import { MdOutlineMeetingRoom, MdOutlineSmokingRooms, MdOutlineStroller, MdRestaurantMenu } from 'react-icons/md';

const Amenities = () => {
    const outletInfo = useBusinessData((s) => s.outletInfo);
    const {
        handleSelectAmenitiesChange,
    } = useBizInfoChanges();
    const { amenities } =
        useExploreTemp((s) => ({
            amenities: s.amenities,
        }));
    const amenitiesArr = [
        { _id: 1, text: "SMOKING SECTION", image: <MdOutlineSmokingRooms /> },
        { _id: 2, text: "BUFFET", image: <FaGlassMartiniAlt /> },
        { _id: 3, text: "HI SPEED WIFI", image: <IoWifiOutline /> },
        { _id: 4, text: "CHILD FRIENDLY", image: <MdOutlineStroller /> },
        { _id: 5, text: "ALCOHOL", image: <IoBeerOutline /> },
    ];

    const hotelAmentiesArr = [
        { _id: "67cfc9b0e30981c209e29788", text: "Housekeeping", image: <FaConciergeBell /> },
        { _id: "67cfc9d7e30981c209e2978a", text: "Spa", image: <FaGlassMartiniAlt /> },
        { _id: "67cfcaa3e30981c209e2978c", text: "Drinks", image: <IoBeerOutline /> },
        { _id: "67cfcab2e30981c209e2978e", text: "Food", image: <MdRestaurantMenu /> },
        { _id: "67cfcac2e30981c209e29790", text: "Kids Area", image: <MdOutlineStroller /> },
        { _id: "67cfcad4e30981c209e29792", text: "Outdoor Settings", image: <FaHotel /> },
        { _id: "67cfcae4e30981c209e29794", text: "Hotel", image: <FaBed /> },
        { _id: "67cfcaf2e30981c209e29796", text: "Cabin", image: <GiCastle /> },
        { _id: "67cfcaffe30981c209e29798", text: "Luxe", image: <GiCastle /> },
        { _id: "67cfcb0ce30981c209e2979a", text: "Castle", image: <GiCastle /> },
        { _id: "67cfe869ef78baab99ef92e4", text: "Lift", image: <MdOutlineMeetingRoom /> },
        { _id: "67cfe870ef78baab99ef92e6", text: "WiFi", image: <IoWifiOutline /> },
        { _id: "67cfe879ef78baab99ef92e8", text: "Swimming Pool", image: <FaSwimmingPool /> },
        { _id: "67cfe884ef78baab99ef92ea", text: "Multicuisine", image: <MdRestaurantMenu /> },
        { _id: "67cfe88cef78baab99ef92ec", text: "Restaurant", image: <MdRestaurantMenu /> },
        { _id: "67cfe893ef78baab99ef92ee", text: "Affordable Rooms", image: <FaBed /> },
        { _id: "67cfe89cef78baab99ef92f0", text: "Premium Rooms", image: <FaBed /> },
        { _id: "67cfe8a4ef78baab99ef92f2", text: "Gym", image: <GiGymBag /> },
        { _id: "67cfe8aeef78baab99ef92f4", text: "Conference Hall", image: <MdOutlineMeetingRoom /> },
        { _id: "67cfe8b6ef78baab99ef92f6", text: "Function Hall", image: <MdOutlineMeetingRoom /> },
        { _id: "67cfe8beef78baab99ef92f8", text: "Bar", image: <IoBeerOutline /> },
        { _id: "67cfe8c6ef78baab99ef92fa", text: "Singles Friendly", image: <FaConciergeBell /> },
        { _id: "67cfe8d0ef78baab99ef92fc", text: "Family Friendly", image: <MdOutlineStroller /> },
    ];

    const finalAmenities = outletInfo?.outLetType === "HOTEL" ? hotelAmentiesArr : amenitiesArr;

    return (
        <>
            {finalAmenities && finalAmenities.length > 0 ? (
                <h6 className="my-2 text-base text-gray-500">Add Amenities</h6>
            ) : null}
            {outletInfo?.outLetType === "HOTEL" ? <section className="flex flex-wrap gap-4">
                {hotelAmentiesArr
                    ? hotelAmentiesArr.map((amenity) => {
                        if (amenities === undefined) return null;
                        const isSelected = amenities.includes(amenity?._id);
                        return (
                            <article
                                key={amenity._id}
                                onClick={() =>
                                    handleSelectAmenitiesChange(amenity._id)
                                }
                                className={`capitalize flex items-center space-x-1 rounded-full border border-1 px-2 py-1 cursor-pointer ${isSelected ? "bg-[#FFE7AB]" : "bg-gray-100"
                                    }`}
                            >
                                {amenity?.image}
                                <h1>{amenity.text.toLowerCase()}</h1>
                            </article>
                        );
                    })
                    : null}
            </section> : <section className="flex flex-wrap gap-4">
                {amenitiesArr
                    ? amenitiesArr.map((amenity) => {
                        if (amenities === undefined) return null;
                        const isSelected = amenities.includes(amenity?.text);
                        return (
                            <article
                                key={amenity._id}
                                onClick={() =>
                                    handleSelectAmenitiesChange(amenity.text)
                                }
                                className={`capitalize flex items-center space-x-1 rounded-full border border-1 px-2 py-1 cursor-pointer ${isSelected ? "bg-[#FFE7AB]" : "bg-gray-100"
                                    }`}
                            >
                                {amenity?.image}
                                <h1>{amenity.text.toLowerCase()}</h1>
                            </article>
                        );
                    })
                    : null}
            </section>}

        </>
    )
}

export default Amenities