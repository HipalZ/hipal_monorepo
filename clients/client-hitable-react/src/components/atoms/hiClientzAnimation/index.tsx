import './index.css';
import Icon1 from '@/assets/img/liteLoginIcon1.png';
import Icon2 from '@/assets/img/liteLoginIcon2.png';
import Icon3 from '@/assets/img/liteLoginIcon3.png';
import MainIcon from '@/assets/img/liteLoginIcon4.png';
import Icon5 from '@/assets/img/liteLoginIcon5.png';
import Icon6 from '@/assets/img/liteLoginIcon6.png';
import Icon7 from '@/assets/img/liteLoginIcon7.png';

const HiClientZAnimation = () => {
    return (
        <div className="container">
            <div className="main-logo">
                <img src={MainIcon} alt="Central Icon"  />
            </div>
            <div className="icon1">
                <img src={Icon1} alt="Planet Icon" />
            </div>
            <div className="icon2">
                <img src={Icon2} alt="Planet Icon" />
            </div>
            <div className="icon3">
                <img src={Icon3} alt="Planet Icon" />
            </div>
            <div className="icon5">
                <img src={Icon5} alt= "Planet Icon" />
            </div>
            <div className="icon6">
                <img src={Icon6} alt="Planet Icon"  />
            </div>
            <div className="icon7">
                <img src={Icon7} alt="Planet Icon" />
            </div>
        </div>
    );
};

export default HiClientZAnimation;
