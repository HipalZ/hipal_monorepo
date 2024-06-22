import React from 'react';

interface ButtonProps {
    text: string;
    onClick: () => void;
    className: string;
}

interface MultipleBottomButtonsProps {
    buttons: ButtonProps[];
}

const MultipleBottomButtons: React.FC<MultipleBottomButtonsProps> = ({ buttons }) => {
    return (
        <section className="fixed flex w-[90%] gap-6 justify-between mt-4 max-w-[30rem] bottom-4">
            {buttons.map((button, index) => (
                <button
                    key={index}
                    onClick={button.onClick}
                    className={`w-full p-3 rounded-3xl ${button.className}`}
                >
                    {button.text}
                </button>
            ))}
        </section>
    );
};

export default MultipleBottomButtons;
