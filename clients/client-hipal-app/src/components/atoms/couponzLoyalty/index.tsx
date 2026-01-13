import { memo } from "react";

interface ICouponzLoyaltyProps {
    cardColor: string;
    textColor: string;
    textContent: string;
}

const CouponzLoyalty = ({ cardColor, textColor, textContent }: ICouponzLoyaltyProps) => {
    const defaultCardStyle: React.CSSProperties = {
        backgroundColor: cardColor,
        height: '12rem',
        width: '10rem',
        padding: '1rem',
        borderRadius: '1rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        color: 'white',
    };
    
    const defaultButtonStyle: React.CSSProperties = {
        backgroundColor: 'white',
        borderRadius: '1.5rem',
        fontWeight: 'normal',
        marginTop: 'auto',
        color: cardColor
    };

    return (
        <article style={defaultCardStyle}>
            <div>
                <span className="bg-white p-2 rounded-2xl">🎁</span>&nbsp;&nbsp;&nbsp;<span className="text-3xl">50%</span>
                <p style={{ color: textColor, margin: '1rem 0' }}>{textContent}</p>
            </div>
            <button style={defaultButtonStyle}>Coming Soon</button>
        </article>
    );
}

const MemoCouponzLoyalty = memo(CouponzLoyalty);
export default MemoCouponzLoyalty;
