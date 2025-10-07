import { useBizInfoChanges } from "../../helpers/bizInforHelpers";
import { useExploreTemp } from "@/components/store/useExploreTemp";
import { lazy, memo } from "react";

const Paragraph = lazy(() => import("@/components/atom/paragraph"));
const SubHeader = lazy(() => import("@/components/atom/subHeader"));

const MemoBasicInformationSection = () => {
  const { handleDescriptionChange, handleTagChange } = useBizInfoChanges();
  const { description, tags } = useExploreTemp((s) => ({
    description: s.description,
    tags: s.tags,
  }));
  return (
    <section>
      <SubHeader text="Basic Information" />
      <article className="p-4 bg-white rounded-2xl lg:flex lg:justify-around lg:space-x-4">
        <div className="relative flex-1">
          <textarea
            minLength={30}
            maxLength={250}
            value={description}
            onChange={handleDescriptionChange}
            className="w-full pr-16 resize-none h-28 lg:h-full rounded-2xl"
            placeholder="Add description"
          />
          <small className="absolute bottom-3 right-4">
            {description?.length}/{250}
          </small>
        </div>
        <div className="mt-4 lg:flex lg:flex-col lg:justify-end lg:items-end">
          <Paragraph text="Describe Your business with 4 words" />
          {tags.map((tag, index) => (
            <section
              key={index.toString()}
              className="flex items-center my-2 space-x-4"
            >
              <h1>{index + 1}</h1>
              <div className="relative">
                <input
                  minLength={3}
                  maxLength={30}
                  placeholder={`Tag ${index + 1}`}
                  type="text"
                  className="w-full rounded-xl"
                  value={tag}
                  onChange={(e) => handleTagChange(e, index)}
                />
                <small className="absolute bottom-3 right-4">
                  {tag?.length}/{30}
                </small>
              </div>
            </section>
          ))}
        </div>
      </article>
    </section>
  );
};

const BasicInformationSection = memo(MemoBasicInformationSection);
export default BasicInformationSection;
