import { useRouter } from 'next/navigation';

const Button = (props: { onClick: () => void }) => {
    const router = useRouter();

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.preventDefault();
        const path = props.onClick();
        router.push(path); 
    };

    return (
        <a href="#" onClick={handleClick} passHref>
            <BottomButton>
                <div className="flex flex-row space-x-2 capitalize">Menu</div>
            </BottomButton>
        </a>
    );
};

export default Button;