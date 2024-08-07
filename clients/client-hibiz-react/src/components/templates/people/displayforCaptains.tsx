import useHiPeopleStore from "@/components/store/useHipeopleStore";
import { useUserPaymentTags } from "@/hooks/useHipeople";
import { memo } from "react";
import { AiFillAlert } from "react-icons/ai";
import { useParams } from "react-router-dom";

const MemoDisplayforCaptains = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const { selectedTagId } = useHiPeopleStore((s) => ({
    selectedTagId: s.selectedTagId,
  }));
  const { mutate } = useUserPaymentTags();
  const handleShowTag = (value: boolean) => {
    const payload = {
      businessId: businessId,
      displayForCaptains: value,
      tagId: selectedTagId,
      userId: selectedTagId,
    };
    mutate(payload);
  };

  return (
    <div className="flex justify-center my-6">
      <section className="h-[20rem] w-[20rem] border-1 border rounded-2xl p-6">
        <AiFillAlert color="green" size="28" />
        <h1 className="mt-2 mb-6 text-2xl font-bold">
          Display Tag For Captains!
        </h1>
        <p className="text-xl">Do you want to display this tag for captains?</p>
        <center className="mt-10 space-x-24">
          <button
            type="button"
            className="px-6 py-2 mr-2 text-white bg-red-500 rounded-full"
            onClick={() => handleShowTag(false)}
          >
            No
          </button>
          <button
            type="button"
            className="px-6 py-2 text-white bg-green-500 rounded-full"
            onClick={() => handleShowTag(true)}
          >
            Yes
          </button>
        </center>
      </section>
    </div>
  );
};

const DisplayforCaptains = memo(MemoDisplayforCaptains);
export default DisplayforCaptains;
