import { memo, useMemo } from "react";
import { FaRegUserCircle } from "react-icons/fa";
import { TiTick } from "react-icons/ti";
import { HiOutlineBellAlert } from "react-icons/hi2";
import useHiPeopleStore from "@/components/store/useHipeopleStore";
import { cn, convertToTime } from "@/components/utils/helper";

const MemoTagPopup = () => {
  const { singleTagData } = useHiPeopleStore((s) => ({
    singleTagData: s.singleTagData,
  }));

  const defaultBgOpacityColor = useMemo(() => {
    return singleTagData?.tagId?.tagType === "AUTO_TAG"
      ? "bg-[#FFA50020]"
      : "bg-[#8C63FF20]";
  }, [singleTagData?.tagId?.tagType]);

  const defaultColor = useMemo(() => {
    return singleTagData?.tagId?.tagType === "AUTO_TAG"
      ? "[#FFA500]"
      : "[#8C63FF]";
  }, [singleTagData?.tagId?.tagType]);

  console.log(singleTagData);

  return (
    <>
      <section className="px-6 pt-2 bg-white rounded-2xl overflow-auto h-[40vh]">
        <center>
          <span
            className={cn(
              defaultBgOpacityColor,
              `text-${defaultColor} px-4 py-1 rounded-xl`,
            )}
          >
            #{" "}
            {singleTagData?.tagId?.tagType === "AUTO_TAG"
              ? "Auto Tag"
              : "Manual Tag"}
          </span>
        </center>
        <center className={cn(`text-${defaultColor} text-3xl mt-2`)}>
          # {singleTagData?.tagId?.name}
        </center>
        <section className="mt-4">
          <article className="flex justify-between ">
            <h1>
              Number:{" "}
              <span className="font-semibold">
                {singleTagData?.count} times
              </span>
            </h1>
            <h1>
              Created by:{" "}
              <span className="font-semibold">
                {singleTagData?.tagId?.createdBy?.name || "Captain"}
              </span>
            </h1>
          </article>
          <article className="flex justify-between mt-8">
            <div className="flex space-x-2">
              <h1 className="border border-1 border-[#000] rounded-full w-fit h-fit">
                <TiTick size={20} />
              </h1>
              <h1>Displays for captains</h1>
            </div>
          </article>
          <section className="relative">
            <article
              className={`p-3 space-y-2 ${defaultBgOpacityColor} rounded-xl my-4`}
            >
              <div className="flex justify-between">
                <h1>{singleTagData?.tagId?.remainderInDuration} </h1>
                <h6 className="flex items-center space-x-2">
                  <HiOutlineBellAlert color="black" size={20} />
                  <span>{convertToTime(singleTagData?.tagId?.time)}</span>
                </h6>
              </div>
              <div className="flex items-center space-x-2">
                <FaRegUserCircle />
                <p>{singleTagData?.tagId?.createdBy?.name || "Captain"}</p>
              </div>
            </article>
          </section>
        </section>
      </section>
    </>
  );
};

const TagPopup = memo(MemoTagPopup);
export default TagPopup;
