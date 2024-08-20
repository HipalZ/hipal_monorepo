import { memo, useState } from "react";
import { cn } from "@hi/common";
import useHiPeopleStore, {
  type FilterValue,
  type FilterValues,
  type GroupData,
} from "@/components/store/useHipeopleStore";
import toast from "react-hot-toast";
import { SlCalender } from "react-icons/sl";
import useBusinessData from "@/components/store/useBusinessData";
import { useCreateGroup } from "@/hooks/usePeopleData";
import LoadingSpinner from "@/components/atom/loadingSpinner";

const predefinedColors = [
  "#E43065",
  "#6C30E4",
  "#3084E4",
  "#30D2E4",
  "#30E43F",
  "#E4B430",
  "#807667",
  "#414348",
];

const MemoCreateDynamicGroup = () => {
  const {
    groupData,
    setGroupData,
    showDuration,
    untilNow,
    setShowDuration,
    setUntilNow,
  } = useHiPeopleStore();
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const businessData = useBusinessData((state) => state.businessData);

  const { mutateCreateGroup, isCreatingGroupPending } = useCreateGroup();

  const handleUntilNowChange = () => {
    setUntilNow(!untilNow);
    setShowDuration(false);
    setGroupData({ durationValue: "0" });
  };

  const handleAddDurationClick = () => {
    setShowDuration(true);
    setUntilNow(false);
    setGroupData({ durationValue: "" });
  };

  const handleInputChange = (
    field: keyof GroupData,
    value: string | "MANUAL" | "DYNAMIC" | "days" | "months" | "years",
  ) => {
    setGroupData({ [field]: value });
  };

  const handleFilterChange = (
    key: keyof FilterValues,
    field: keyof FilterValue,
    value: string,
  ) => {
    setGroupData({
      filterValues: {
        ...groupData.filterValues,
        [key]: { ...groupData.filterValues[key], [field]: value },
      },
    });
    setErrors((prevErrors) => ({ ...prevErrors, [key]: false }));
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let max = 1095;
    if (groupData.durationType === "months") max = 36;
    if (groupData.durationType === "years") max = 3;

    if (Number.parseInt(e.target.value) > max) {
      e.target.value = max.toString();
    }

    setGroupData({ durationValue: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let hasError = false;
    const newErrors: Record<string, boolean> = {};

    // Prepare the payload based on groupType
    let payload: Record<string, any>;

    if (groupData.groupType === "DYNAMIC") {
      let durationInDays = 0;

      if (groupData.durationType && groupData.durationValue) {
        const durationValue = Number(groupData.durationValue);
        if (groupData.durationType === "years") {
          durationInDays = durationValue * 365;
        } else if (groupData.durationType === "months") {
          durationInDays = durationValue * 30;
        } else if (groupData.durationType === "days") {
          durationInDays = durationValue;
        }
      }

      const filterPayload: Record<string, any> = {
        duration: durationInDays,
      };

      for (const key of Object.keys(groupData.filterValues)) {
        const filterKey = key as keyof FilterValues;
        const filterValue = groupData.filterValues[filterKey];
        if (filterValue.type && !filterValue.value) {
          newErrors[filterKey] = true;
          hasError = true;
        } else if (filterValue.value) {
          filterPayload[filterKey] = Number.parseFloat(filterValue.value);
          filterPayload[`${filterKey}Type`] = filterValue.type;
        }
      }

      payload = {
        name: groupData.name,
        businessId: businessData?._id,
        description: groupData.description,
        filter: [filterPayload],
        groupColor: groupData.groupColor,
        autoUpdate: true,
        groupType: "DYNAMIC",
        durationValue: groupData.durationValue,
      };
    } else {
      payload = {
        name: groupData.name,
        businessId: businessData?._id,
        description: groupData.description,
        groupColor: groupData.groupColor,
        groupType: "MANUAL",
      };
    }

    setErrors(newErrors);

    if (hasError) {
      toast.error("Please fill in all required fields.");
      return;
    }

    console.log("Generated Payload:", payload);

    try {
      await mutateCreateGroup(payload);
    } catch (error) {
      console.error("Failed to create group:", error);
    }
  };

  if (isCreatingGroupPending) {
    return (
      <div>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="relative z-10 pb-[7rem]">
      <h3 className="ml-6 text-3xl text-[#6F649B] capitalize">Create Group</h3>

      <form
        className="p-4 mx-4 mt-4 bg-white rounded-2xl"
        onSubmit={handleSubmit}
      >
        <article className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <input
              type="text"
              id="groupName"
              value={groupData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="block w-full h-16 pt-2 pb-4 pl-4 pr-4 mb-0 ml-0 mr-0 text-base bg-white border border-gray-800 rounded-2xl text-base-content dark:text-base-100 focus:outline-none focus:border-[#8c63ff] dark:border-gray-600 peer"
              maxLength={30}
              minLength={3}
              required
            />
            <small className="absolute bottom-10 right-4">
              {groupData.name?.length}/{30}
            </small>
            <label
              htmlFor="groupName"
              className="absolute text-sm text-[#000000] dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#8c63ff] peer-focus:dark:text-[#8c63ff] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
            >
              Group Name
            </label>
          </div>
          <div className="relative flex-1 mt-4 md:mt-0 lg:mt-0">
            <div className="relative">
              <textarea
                id="groupDescription"
                value={groupData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                className="resize-none h-24 block w-full pt-2 pb-4 pl-4 pr-4 mb-0 ml-0 mr-0 text-base bg-white border border-gray-800 rounded-2xl text-base-content dark:text-base-100 focus:outline-none focus:border-[#8c63ff] dark:border-gray-600 peer"
                maxLength={50}
                minLength={3}
              />
              <small className="absolute bottom-2 right-2">
                {groupData.description?.length}/{50}
              </small>
            </div>
            <label
              htmlFor="groupDescription"
              className="absolute text-sm text-[#000000] dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#8c63ff] peer-focus:dark:text-[#8c63ff] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
            >
              Group Description
            </label>
          </div>
        </article>

        <div className="mt-4">
          <label
            htmlFor="groupType"
            className="block mb-2 text-sm text-gray-700"
          >
            Select Group Type:
          </label>
          <select
            id="groupType"
            value={groupData.groupType}
            onChange={(e) => handleInputChange("groupType", e.target.value)}
            className="block w-full pt-2 pb-2 pl-4 pr-4 mb-0 ml-0 mr-0 text-base bg-white border border-gray-800 rounded-2xl text-base-content dark:text-base-100 focus:outline-none focus:border-[#8c63ff] dark:border-gray-600"
          >
            <option value="MANUAL">Manual</option>
            <option value="DYNAMIC">Dynamic</option>
          </select>
        </div>

        <article className="bg-[#f4f4f4] -mx-4 mt-4 p-4 text-xs">
          Dynamic groups add customers automatically into this group who match
          the requirements of the group
        </article>

        {groupData.groupType === "DYNAMIC" && (
          <>
            <h3 className="pt-4 my-4 text-xl font-semibold">
              Dynamic group condition
            </h3>

            <div className="flex justify-between gap-4 ">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={untilNow}
                  onChange={handleUntilNowChange}
                  className="mr-2 text-[#8C63FF] w-5 h-5 rounded-md"
                />
                Until Now
              </label>

              <button
                type="button"
                onClick={handleAddDurationClick}
                className="px-4 py-2 text-sm text-[#8C63FF] rounded-md flex gap-2 items-center"
              >
                <SlCalender /> Add Duration
              </button>
            </div>

            {showDuration && (
              <section className="mt-4 bg-[#8C63FF30] -mx-4 p-4">
                <label
                  htmlFor="duration"
                  className="block mb-2 text-sm text-gray-700"
                >
                  Duration:
                </label>
                <div className="flex gap-4">
                  <select
                    value={groupData.durationType}
                    onChange={(e) =>
                      handleInputChange("durationType", e.target.value)
                    }
                    className="block w-[30%] pt-2 pb-2 pl-4 pr-4 text-base bg-white border border-gray-800 rounded-2xl text-base-content dark:text-base-100 focus:outline-none focus:border-[#8c63ff] dark:border-gray-600"
                  >
                    <option value="days">Days</option>
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                  <input
                    type="number"
                    value={groupData.durationValue}
                    onChange={handleDurationChange}
                    className="block w-[70%] pt-2 pb-2 pl-4 pr-4 text-base bg-white border border-gray-800 rounded-2xl text-base-content dark:text-base-100 focus:outline-none focus:border-[#8c63ff] dark:border-gray-600"
                    placeholder={`Enter ${groupData.durationType}`}
                    max={
                      groupData.durationType === "days"
                        ? 1095
                        : groupData.durationType === "months"
                          ? 36
                          : 3
                    }
                    min="1"
                  />
                </div>
              </section>
            )}

            <div className="mt-4">
              {groupData.filters.map((filter) => (
                <section key={filter.key} className="relative">
                  <header>{filter.heading}</header>

                  <label className="absolute top-0 text-sm text-gray-700">
                    {filter.label}
                  </label>
                  <div className="flex gap-4 mb-4 md:flex-row">
                    <div className="w-[70%]">
                      <select
                        value={groupData.filterValues[filter.key].type}
                        onChange={(e) =>
                          handleFilterChange(filter.key, "type", e.target.value)
                        }
                        className={cn(
                          "block w-full pt-2 pb-2 pl-4 pr-4 mb-0 ml-0 mr-0 text-base bg-white border border-gray-800 rounded-2xl text-base-content dark:text-base-100 focus:outline-none focus:border-[#8c63ff] dark:border-gray-600",
                          errors[filter.key] && "border-red-500",
                        )}
                      >
                        <option value="">Above/below/equals</option>
                        <option value="ABOVE">Above</option>
                        <option value="BELOW">Below</option>
                        <option value="EQUALS">Equal</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <input
                        type="tel"
                        value={groupData.filterValues[filter.key].value}
                        onChange={(e) =>
                          handleFilterChange(
                            filter.key,
                            "value",
                            e.target.value,
                          )
                        }
                        max={5}
                        maxLength={5}
                        className={cn(
                          "block w-full pt-2 pb-2 pl-4 pr-4 mb-0 ml-0 mr-0 text-base bg-white border border-gray-800 rounded-2xl text-base-content dark:text-base-100 focus:outline-none focus:border-[#8c63ff] dark:border-gray-600",
                          errors[filter.key] && "border-red-500",
                        )}
                        placeholder="Value"
                      />
                    </div>
                  </div>
                </section>
              ))}
            </div>
          </>
        )}

        <div className="mt-4">
          <label
            htmlFor="groupColor"
            className="block mb-2 text-sm text-gray-700"
          >
            Select Group Color:
          </label>
          <div className="flex gap-2">
            {predefinedColors.map((color) => (
              <button
                type="button"
                key={color}
                className={cn(
                  "w-10 h-10 rounded-full cursor-pointer",
                  groupData.groupColor === color && "ring-2 ring-[#8c63ff]",
                )}
                style={{ backgroundColor: color }}
                onClick={() => handleInputChange("groupColor", color)}
              />
            ))}
          </div>
        </div>

        <div className="mt-6">
          <button type="submit" className="bottom_btn">
            Create Group
          </button>
        </div>
      </form>
    </div>
  );
};

const CreateDynamicGroup = memo(MemoCreateDynamicGroup);
export default CreateDynamicGroup;
