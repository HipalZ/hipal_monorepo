import { FaGlassMartiniAlt } from "react-icons/fa";
import { IoBeerOutline, IoWifiOutline } from "react-icons/io5";
import {
  MdOutlineSmokingRooms,
  MdOutlineStroller,
  MdOutlineWatchLater,
} from "react-icons/md";
import { useBizInfoChanges } from "../../helpers/bizInforHelpers";
import { lazy, memo } from "react";
import { convertTo12HourFormat } from "../settingsForm/outletForm";
import { FaLocationDot } from "react-icons/fa6";
import { useExploreTemp } from "@/components/store/useExploreTemp";

const SubHeader = lazy(() => import("@/components/atom/subHeader"));

const amenitiesArr = [
  { _id: 1, text: "SMOKING SECTION", image: <MdOutlineSmokingRooms /> },
  { _id: 2, text: "BUFFET", image: <FaGlassMartiniAlt /> },
  { _id: 3, text: "HI SPEED WIFI", image: <IoWifiOutline /> },
  { _id: 4, text: "CHILD FRIENDLY", image: <MdOutlineStroller /> },
  { _id: 5, text: "ALCOHOL", image: <IoBeerOutline /> },
];
const MemoContactInfo = () => {
  const { phone, location, avgPricingForTwo, amenities, address, fixedTime } =
    useExploreTemp((s) => ({
      phone: s.phone,
      location: s.location,
      avgPricingForTwo: s.avgPricingForTwo,
      amenities: s.amenities,
      address: s.address,
      fixedTime: s.fixedTime,
    }));
  const {
    handlePhoneChange,
    handleLocationChange,
    handleChangeAddress,
    handlePricingChange,
    handleSelectAmenitiesChange,
    handleTimings,
  } = useBizInfoChanges();
  return (
    <div className="mt-10 lg:flex lg:justify-between lg:space-x-4">
      <section className="flex-1 my-6 lg:my-0">
        <SubHeader text="Contact" />
        <article className="p-4 space-y-4 bg-white rounded-2xl">
          <div className="relative">
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              className="w-full rounded-2xl"
              placeholder="Enter phone number"
              maxLength={10}
              minLength={10}
            />
            <small className="absolute bottom-3 right-4">
              {phone?.length}/{10}
            </small>
          </div>
          <div className="relative">
            <input
              minLength={10}
              maxLength={100}
              placeholder="Add Location on map"
              type="text"
              value={location}
              className="w-full pr-10 rounded-2xl"
              onChange={handleLocationChange}
            />
            <small className="absolute bottom-4 right-4">
              <FaLocationDot />
            </small>
          </div>
          <div className="relative">
            <textarea
              minLength={10}
              maxLength={100}
              placeholder="Add Address"
              value={address}
              className="w-full h-24 pr-16 resize-none rounded-2xl"
              onChange={handleChangeAddress}
            />
            <small className="absolute bottom-3 right-4">
              {address?.length}/{100}
            </small>
          </div>
        </article>
      </section>
      <section className="mb-[5rem] flex-1">
        <article>
          <SubHeader text="Info" />
        </article>
        <article className="p-4 bg-white rounded-2xl">
          <section className="p-4 border border-1 rounded-2xl">
            <div className="relative">
              <input
                value={avgPricingForTwo}
                type="tel"
                maxLength={10}
                onChange={handlePricingChange}
                className="w-full mb-2 outline-none rounded-2xl"
                placeholder="Add Average Pricing For Two"
              />
              <small className="absolute bottom-5 right-4">
                {avgPricingForTwo?.toString().length}/{10}
              </small>
            </div>
            {amenitiesArr && amenitiesArr.length > 0 ? (
              <h6 className="my-2 text-base text-gray-500">Add Amenities</h6>
            ) : null}
            <section className="flex flex-wrap gap-4">
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
                        onKeyDown={() =>
                          handleSelectAmenitiesChange(amenity.text)
                        }
                        className={`capitalize flex items-center space-x-1 rounded-full border border-1 px-2 py-1 cursor-pointer ${
                          isSelected ? "bg-[#FFE7AB]" : "bg-gray-100"
                        }`}
                      >
                        {amenity?.image}
                        <h1>{amenity.text.toLowerCase()}</h1>
                      </article>
                    );
                  })
                : null}
            </section>
          </section>
          <section className="flex gap-6 my-4">
            <article
              onClick={handleTimings}
              className="flex items-center px-2 py-1 space-x-4 bg-gray-100 border rounded-full border-1"
            >
              <MdOutlineWatchLater />
              <h1>Add Timings</h1>
            </article>
          </section>
          {(fixedTime?.openTime || fixedTime?.closeTime) && (
            <div
              style={{ width: "max-content" }}
              className="px-4 py-1 text-sm text-[#8C63FF] bg-[#8C63FF20] rounded-full"
            >
              Business time from {convertTo12HourFormat(fixedTime?.openTime)} to{" "}
              {convertTo12HourFormat(fixedTime?.closeTime)}
            </div>
          )}
        </article>
      </section>
    </div>
  );
};

const ContactInfo = memo(MemoContactInfo);
export default ContactInfo;
