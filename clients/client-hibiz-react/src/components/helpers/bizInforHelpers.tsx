import { useExploreTemp } from "@/components/store/useExploreTemp";
import { type ChangeEvent, useCallback } from "react";

// Callbacks to handle changes in the form fields of bizInfo

export const useBizInfoChanges = () => {
  const {
    setDescription,
    setPhone,
    setLocation,
    setAddress,
    setAvgPricingForTwo,
    tags,
    setTags,
    amenities,
    setAmenities,
    openTimings,
    setOpenTimings,
    customTimings,
    setCustomTimings,
    setFixedTime,
  } = useExploreTemp((s) => ({
    setDescription: s.setDescription,
    setPhone: s.setPhone,
    setLocation: s.setLocation,
    setAddress: s.setAddress,
    setAvgPricingForTwo: s.setAvgPricingForTwo,
    tags: s.tags,
    setTags: s.setTags,
    amenities: s.amenities,
    setAmenities: s.setAmenities,
    openTimings: s.openTimings,
    setOpenTimings: s.setOpenTimings,
    customTimings: s.customTimings,
    setCustomTimings: s.setCustomTimings,
    setFixedTime: s.setFixedTime,
  }));
  const handleDescriptionChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      setDescription(e.target.value);
    },
    [setDescription],
  );
  const handlePhoneChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setPhone(e.target.value);
    },
    [setPhone],
  );

  const handleLocationChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setLocation(e.target.value);
    },
    [setLocation],
  );

  const handleChangeAddress = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      setAddress(e.target.value);
    },
    [setAddress],
  );

  const handlePricingChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setAvgPricingForTwo(e.target.value);
    },
    [setAvgPricingForTwo],
  );

  const handleTagChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>, index: number) => {
      const value = e.target.value;
      const updatedTags = tags.map((tag, currentIndex) => {
        if (currentIndex === index) {
          return value;
        }
        return tag;
      });
      setTags(updatedTags);
    },
    [setTags, tags],
  );

  const handleSelectAmenitiesChange = useCallback(
    (selectedAmenity: string) => {
      const updatedAmenities = [...amenities];
      const index = updatedAmenities.indexOf(selectedAmenity);
      if (index > -1) {
        updatedAmenities.splice(index, 1);
      } else {
        updatedAmenities.push(selectedAmenity);
      }
      setAmenities(updatedAmenities);
    },
    [amenities],
  );

  const handleTimings = useCallback(() => {
    setOpenTimings(!openTimings);
  }, [openTimings, setOpenTimings]);

  const handleCustomTimingChange = useCallback(
    (index: number, key: "openTime" | "closeTime", value: string) => {
      setCustomTimings(
        customTimings?.map((timing, i) =>
          i === index ? { ...timing, [key]: value } : timing,
        ),
      );
    },
    [customTimings, setCustomTimings], // Watch for changes in customTimings and setCustomTimings
  );

  const handleFixedTimeChange = useCallback(
    (key: "openTime" | "closeTime", value: string) => {
      setFixedTime({ [key]: value });
    },
    [setFixedTime], // Dependency on setFixedTime
  );

  return {
    handleDescriptionChange,
    handlePhoneChange,
    handleLocationChange,
    handleChangeAddress,
    handlePricingChange,
    handleTagChange,
    handleSelectAmenitiesChange,
    handleTimings,
    handleCustomTimingChange,
    handleFixedTimeChange,
  };
};
