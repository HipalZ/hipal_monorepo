import useCouponsStore from "@/components/store/useCouponsStore";
import { memo } from "react";

const MemoTestAvailableDays = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const { customDays, setCustomDays } =
        useCouponsStore((s) => ({
            customDays: s.customDays,
            setCustomDays: s.setCustomDays,
            setDayRestriction: s.setDayRestriction,
            dayRestriction: s.dayRestriction,
        }));
    const handleDayClick = (day) => {
        setCustomDays(
            customDays.includes(day)
                ? customDays.filter(d => d !== day)
                : [...customDays, day]
        );
    };
    return (
        <section>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Available Days
            </label>
            <article className="flex flex-wrap gap-2">
                {days.map((day) => (
                    <button
                        key={day}
                        type="button"
                        onClick={() => handleDayClick(day)}
                        className={`py-1 px-3 rounded-full text-sm ${customDays.includes(day)
                            ? 'bg-indigo-500 text-white'
                            : 'bg-gray-100 text-gray-600'
                            }`}
                    >
                        {day}
                    </button>
                ))}
            </article>
        </section>
    )
}

const TestAvailableDays = memo(MemoTestAvailableDays)
export default TestAvailableDays