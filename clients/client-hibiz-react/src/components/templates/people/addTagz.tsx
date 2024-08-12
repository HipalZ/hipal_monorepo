import useHiPeopleStore from "@/components/store/useHipeopleStore";
import { convertToTime, filterPayload } from "@/components/utils/helper";
import { useAllTags, useUserPaymentTags } from "@/hooks/useHipeople";
import { memo, useState, useMemo, lazy } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";

const BottomButton = lazy(() => import("@/components/atom/bottomButton"));
const MemoAddTagz = () => {
  useAllTags();
  const { businessId, userId } = useParams<{
    businessId: string;
    userId: string;
  }>();
  const { mutate } = useUserPaymentTags();
  const { userDashboardDetails, setOpenAddTagz, tags } = useHiPeopleStore(
    (s) => ({
      userDashboardDetails: s.userDashboardDetails,
      setOpenAddTagz: s.setOpenAddTagz,
      tags: s.tags,
    }),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);

  // Filtered tags based on search query
  const filteredTags = useMemo(() => {
    if (!searchQuery) {
      return tags;
    }
    return tags?.filter((tag) =>
      tag.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, tags]);

  // Handle checkbox change
  const handleCheckboxChange = (tagId: string) => {
    setSelectedTags((prevSelected: string[]) => {
      if (prevSelected.includes(tagId)) {
        // Remove tagId if it's already in the array
        return prevSelected.filter((id) => id !== tagId);
      }
      // Add tagId to the array
      return [...prevSelected, tagId];
    });
  };

  const handleAddTagz = () => {
    const payload = {
      businessId: businessId,
      userId: userId,
      tagIds: selectedTags,
    };
    const filteredTags = filterPayload(payload);
    if (selectedTags.length === 0)
      return toast.error("Please select atleast one tag.");
    mutate(filteredTags);
    setOpenAddTagz(false);
  };

  return (
    <section className="h-[60vh] overflow-y-auto pb-[5rem] bg-white rounded-t-3xl">
      <center className="my-4">
        <h1 className="px-4 py-1 text-3xl text-[#6F649B] bg-opacity-50 rounded-xl">
          Add Tagz
        </h1>
        <span className="text-[#6F649B]">
          For :- {userDashboardDetails?.name}
        </span>
      </center>
      <article className="mx-6">
        <input
          type="search"
          className="w-full rounded-2xl"
          placeholder="Search the tag name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </article>
      <section className="mx-6 mt-4">
        {filteredTags && filteredTags.length > 0 ? (
          filteredTags.map((tag) => (
            <article key={tag._id} className="flex items-center my-3">
              <input
                type="checkbox"
                checked={selectedTags.includes(tag?._id)}
                onChange={() => handleCheckboxChange(tag?._id)}
                className="p-2 mr-2 rounded-full"
              />
              <div className="w-full p-2 border rounded-lg bg-[#EEEEEE] space-y-2">
                <h2 className="text-base text-[#6F649B] truncate">
                  {tag.name}{" "}
                  <span className="ml-2 text-sm">
                    (
                    {tag?.tagType === "AUTO_TAG"
                      ? "# Auto Tag"
                      : "# Manual Tag"}
                    )
                  </span>
                </h2>
                <p className="text-sm text-[#6F649B]">
                  Remainder: {tag?.remainderInDuration || "No "}{" "}
                  {tag?.time && (
                    <span className="ml-6">
                      Time:
                      {convertToTime(tag?.time)}
                    </span>
                  )}
                </p>
              </div>
            </article>
          ))
        ) : (
          <p className="text-gray-500">No tags found.</p>
        )}
      </section>
      <BottomButton
        buttons={[
          {
            text: "Add Tagz",
            onClick: handleAddTagz,
          },
        ]}
      />
    </section>
  );
};

const AddTagz = memo(MemoAddTagz);
export default AddTagz;
