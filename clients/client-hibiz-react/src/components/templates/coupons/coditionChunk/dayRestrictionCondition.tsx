import Background from "@/components/atom/feildBackground";
import useCouponsStore from "@/components/store/useCouponsStore";
import { Switch } from "@headlessui/react";
import { cn } from "@hi/common";
import { memo, useCallback } from "react";

const daysArray = [
  { id: 1, name: "Sunday" },
  { id: 2, name: "Monday" },
  { id: 3, name: "Tuesday" },
  { id: 4, name: "Wednesday" },
  { id: 5, name: "Thursday" },
  { id: 6, name: "Friday" },
  { id: 7, name: "Saturday" },
];

const CustomDayButtons = ({ customDays = [], handleCustomDayToggle }: any) => (
  <div className="flex flex-wrap gap-2 mt-2">
    {daysArray.map((day) => (
      <button
        type="button"
        key={day.id}
        onClick={() => handleCustomDayToggle(day.name.toLowerCase())}
        className={cn(
          "py-2 px-4 border rounded-3xl text-xs",
          customDays.includes(day.name.toLowerCase())
            ? "bg-[#6A31DF50] text-white"
            : "bg-gray-200",
        )}
      >
        {day.name}
      </button>
    ))}
  </div>
);

const MemoDayRestrictionCondition = () => {
  const { customDays, setCustomDays, setDayRestriction, dayRestriction } =
    useCouponsStore((s) => ({
      customDays: s.customDays,
      setCustomDays: s.setCustomDays,
      setDayRestriction: s.setDayRestriction,
      dayRestriction: s.dayRestriction,
    }));

  const handleDayRestriction = useCallback(() => {
    setCustomDays([]);
    setDayRestriction(!dayRestriction);
  }, [dayRestriction]);

  const handleCustomDayToggle = useCallback(
    (day: string) => {
      setCustomDays(
        customDays.includes(day)
          ? customDays.filter((d) => d !== day)
          : [...customDays, day],
      );
    },
    [customDays, setCustomDays],
  );
  return (
    <Background>
      <section className="flex items-center justify-between text-nowrap">
        <h3 className="font-semibold opacity-60">
          Add "Day" based restriction
        </h3>
        <Switch
          checked={dayRestriction}
          onChange={handleDayRestriction}
          className="group inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition data-[checked]:bg-green-400"
        >
          <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-[checked]:translate-x-6" />
        </Switch>
      </section>
      {dayRestriction && (
        <>
          <h3 className="my-2 pb-2 text-xs font-semibold  text-[#8C63FF]">
            Choose minimum one day*
          </h3>
          <CustomDayButtons
            customDays={customDays}
            handleCustomDayToggle={handleCustomDayToggle}
          />
        </>
      )}
    </Background>
  );
};

const DayRestrictionCondition = memo(MemoDayRestrictionCondition);
export default DayRestrictionCondition;
