import BottomButton from "@/components/atom/bottomButton";
import useBusinessData from "@/components/store/useBusinessData";
import useHiPeopleStore from "@/components/store/useHipeopleStore";
import { cn } from "@/components/utils/helper";
import { apiRpc } from "@hi/common";
import { memo, useCallback } from "react";
import { toast } from "react-hot-toast";

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

const MemoCreateGroup = () => {
  const businessData = useBusinessData((s) => s.businessData);
  const { selectedUserIds, setAddGroupPage, formData, setFormData, reset,clearAllUsers } =
    useHiPeopleStore();

  const handleInputChange = useCallback(
    (key: string) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(key, e.target.value);
      },
    [setFormData],
  );

  // Handle color selection
  const handleColorSelection = (color: string) => {
    setFormData("groupColor", color);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await apiRpc.groups.$post({
        json: {
          ...formData,
          businessId: businessData?._id || "",
          userIds: selectedUserIds,
        },
      });

      if (res.status === 200 || res.status === 201) {
        toast.success("Group created successfully!");
        clearAllUsers()
        reset();
      } else {
        toast.error("Failed to create group.");
      }
    } catch (error) {
      toast.error("Error creating group.");
      console.error("Error creating group:", error);
    }
  };

  return (
    <section>
      <center className="w-full bg-[#6C30E420] p-4">
        <h3 className="text-sm">
          Do yoy want the selected{" "}
          <span className="text-[#6C30E4] text-xl font-semibold">
            {selectedUserIds.length}
          </span>{" "}
          users to be added <br /> to{" "}
          <span className="text-xl text-[#6C30E4] font-semibold">
            “{formData.name}”
          </span>{" "}
          Group
        </h3>
      </center>
      <form
        className="p-4 mx-4 mt-4 bg-white rounded-2xl"
        onSubmit={handleSubmit}
      >
        <article className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <input
              type="text"
              id="groupName"
              value={formData.name}
              onChange={handleInputChange("name")}
              className="block w-full pt-2 pb-4 pl-4 pr-4 mb-0 ml-0 mr-0 text-base bg-white border border-gray-800 rounded-2xl text-base-content dark:text-base-100 focus:outline-none focus:border-[#8c63ff] dark:border-gray-600 peer"
              maxLength={30}
              required
            />
            <label
              htmlFor="groupName"
              className="absolute text-sm text-[#000000] dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#8c63ff] peer-focus:dark:text-[#8c63ff] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
            >
              Group Name
            </label>
          </div>
          <div className="relative flex-1 mt-4 md:mt-0 lg:mt-0">
            <textarea
              id="groupDescription"
              value={formData.description}
              onChange={handleInputChange("description")}
              className="block w-full pt-2 pb-4 pl-4 pr-4 mb-0 ml-0 mr-0 text-base bg-white border border-gray-800 rounded-2xl text-base-content dark:text-base-100 focus:outline-none focus:border-[#8c63ff] dark:border-gray-600 peer"
              maxLength={50}
              required
            />
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
                  formData.groupColor === color && "ring-2 ring-[#8c63ff]",
                )}
                style={{ backgroundColor: color }}
                onClick={() => handleColorSelection(color)}
              />
            ))}
          </div>
        </div>
        <section className="-mx-8">
          <BottomButton
            buttons={[
              {
                type: "button",
                text: "Add More pplz",
                onClick: () => setAddGroupPage("ADD MORE USERS"),
              },
              {
                text: "Save",
                type: "submit",
              },
            ]}
          />
        </section>
      </form>
    </section>
  );
};

const CreateGroup = memo(MemoCreateGroup);

export default CreateGroup;
