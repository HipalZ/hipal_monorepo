import logoPlaceholder from "@/assets/hisite/logoPlaceholder.png";
import { memo } from 'react'

interface SidebarProps {
  items: { icon: string; text: string; onClick: () => void }[];
}

const MemoiseSidebar: React.FC<SidebarProps> = ({ items }) => {
  return (
    <section className="sidebar">
        <center className='mt-8 mb-4'>
            <img src={logoPlaceholder} alt="logo placeholder" />
            <span>
                Home
            </span>
        </center>
      {items.map((item, index) => (
        <center key={index} className="sidebar-item" onClick={item.onClick}>
          <img src={item.icon} alt={item.text}/>
          <span>{item.text}</span>
        </center>
      ))}
    </section>
  );
};

const Sidebar = memo(MemoiseSidebar);

export default Sidebar;
