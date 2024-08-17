import { memo, useEffect, useRef, useState } from 'react';

interface Props {
    number: number;
}

const RollingNumber = (props: Props) => {
    const { number } = props;
    const [initialized, setInitialized] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current && !initialized) {
            initializeDigits();
            setInitialized(true);
        }
    }, [initialized]);

    useEffect(() => {
        if (initialized) {
            setInitialNumber(number);
            animateToNumber(number);
        }
    }, [number, initialized]);

    const initializeDigits = () => {
        const digitsContainers = containerRef.current?.querySelectorAll('.digits') || [];
        digitsContainers.forEach((container) => {
            container.innerHTML = '';
            for (let i = 0; i < 10; i++) {
                const li = document.createElement('li');
                li.textContent = i.toString();
                container.appendChild(li);
            }
        });
    };

    const setInitialNumber = (number: number) => {
        const digitsContainers = containerRef.current?.querySelectorAll('.digits') || [];
        const digits = String(number).padStart(6, '0').split('');
        const nonZeroIndex = digits.findIndex(digit => digit !== '0');
        digitsContainers.forEach((container, index) => {
            if (index < nonZeroIndex) {
                container.style.display = 'none';
            } else {
                container.style.display = 'block';
                container.style.marginTop = `-${digits[index]}em`;
            }
        });
    };

    const animateToNumber = (number: number) => {
        const digitsContainers = containerRef.current?.querySelectorAll('.digits') || [];
        const digits = String(number).padStart(6, '0').split('');
        const nonZeroIndex = digits.findIndex(digit => digit !== '0');
        digitsContainers.forEach((container, index) => {
            if (index < nonZeroIndex) {
                container.style.display = 'none';
            } else {
                container.style.display = 'block';
                container.style.transition = `margin-top ${2 - (index * 0.25)}s ease`;
                container.style.marginTop = `-${digits[index]}em`;
            }
        });
    };

    return (
        <div id="counter" ref={containerRef}>
            <ul className="digits digits-first" />
            <ul className="digits digits-second" />
            <ul className="digits digits-third" />
            <ul className="digits digits-fourth" />
            <ul className="digits digits-fifth" />
            <ul className="digits digits-sixth" />
        </div>
    );
};

const MemoRollingNumber = memo(RollingNumber);
export default MemoRollingNumber;
