
import { useBirthday } from '@/components/store/useBirthday';
import dynamic from 'next/dynamic';
import { useState, useEffect, memo } from 'react';
import { usePathname } from "next/navigation";
import { useBirthdayConditions } from '@/components/utils/birthdayHelper';

const BirthdayPrompt = dynamic(() => import('@/components/organisms/explore/birthdayPrompt'))

const MemoBirthdayPromptTimer = () => {
    const { openModal, setOpenModal } = useBirthday();
    const { checkConditions } = useBirthdayConditions();
    const pathName = usePathname()
    // State to track inactivity
    const [isInactive, setIsInactive] = useState(false);
    let inactivityTimer: NodeJS.Timeout | null = null;

    const resetInactivityTimer = () => {
        if (inactivityTimer) clearTimeout(inactivityTimer);
        setIsInactive(false); // Hide the BirthdayPrompt when user interacts

        // Only start inactivity tracking if all conditions are met
        if (!checkConditions()) return null;
        inactivityTimer = setTimeout(() => {
            setIsInactive(true);
            setOpenModal(true);
        }, 15000);
    };
    // Effect to track user activity and reset inactivity timer
    useEffect(() => {
        if (!pathName.includes("/explore")) return;

        // Start the timer initially
        resetInactivityTimer();

        // Listen to user interactions
        window.addEventListener("mousemove", resetInactivityTimer);
        window.addEventListener("keydown", resetInactivityTimer);
        window.addEventListener("click", resetInactivityTimer);
        window.addEventListener("scroll", resetInactivityTimer);

        // Cleanup event listeners on unmount
        return () => {
            if (inactivityTimer) clearTimeout(inactivityTimer);
            window.removeEventListener("mousemove", resetInactivityTimer);
            window.removeEventListener("keydown", resetInactivityTimer);
            window.removeEventListener("click", resetInactivityTimer);
            window.removeEventListener("scroll", resetInactivityTimer);
        };
    }, [checkConditions]);

    return (
        <>
            {(isInactive || openModal) && <BirthdayPrompt />}
        </>
    )
}

const BirthdayPromptTimer = memo(MemoBirthdayPromptTimer)
export default BirthdayPromptTimer