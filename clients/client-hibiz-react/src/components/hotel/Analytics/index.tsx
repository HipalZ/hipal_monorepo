import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { memo } from 'react';
import { GrGraphQl } from 'react-icons/gr';
import { IoAnalytics } from 'react-icons/io5';
import { MdOutlineManageHistory } from 'react-icons/md';
import { SlPeople } from 'react-icons/sl';
import { VscFeedback } from 'react-icons/vsc';
import { Link } from 'react-router-dom';

const essentialCards = [
  {
    title: 'Service History',
    description: 'check the service histories',
    icon: (
      <div className="transform rounded-full bg-gradient-to-br from-pink-400 to-pink-600 p-3 shadow-lg transition-transform hover:scale-105">
        <MdOutlineManageHistory className="h-8 w-8 text-white drop-shadow-md" />
      </div>
    ),
    href: 'service-history',
  },
  {
    title: 'Escalation Analytics',
    description: 'Escalation Reports',
    icon: (
      <div className="transform rounded-full bg-gradient-to-br from-blue-400 to-blue-600 p-3 shadow-lg transition-transform hover:scale-105">
        <GrGraphQl className="h-8 w-8 text-white drop-shadow-md" />
      </div>
    ),
    href: 'escalation-reports',
  },
  {
    title: 'Item Analytics',
    description: 'Item Reports',
    icon: (
      <div className="transform rounded-full bg-gradient-to-br from-purple-400 to-purple-600 p-3 shadow-lg transition-transform hover:scale-105">
        <IoAnalytics className="h-8 w-8 text-white drop-shadow-md" />
      </div>
    ),
    href: 'item-reports',
  },
  {
    title: 'Review Analytics',
    description: 'Review Reports',
    icon: (
      <div className="transform rounded-full bg-gradient-to-br from-gray-400 to-[#000000] p-3 shadow-lg transition-transform hover:scale-105">
        <VscFeedback className="h-8 w-8 text-white drop-shadow-md" />
      </div>
    ),
    href: 'review-reports',
  },
  {
    title: 'Staff Analytics',
    description: 'Staff Reports',
    icon: (
      <div className="transform rounded-full bg-gradient-to-br from-red-400 to-red-600 p-3 shadow-lg transition-transform hover:scale-105">
        <SlPeople className="h-8 w-8 text-white drop-shadow-md" />
      </div>
    ),
    href: 'staff-reports',
  },
  {
    title: 'User Analytics',
    description: 'User Reports',
    icon: (
      <div className="transform rounded-full bg-gradient-to-br from-green-400 to-green-600 p-3 shadow-lg transition-transform hover:scale-105">
        <SlPeople className="h-8 w-8 text-white drop-shadow-md" />
      </div>
    ),
    href: 'user-reports',
  },
];

const MemoAnalyticsCards = () => {
  return (
    <>
      <h2 className="mb-6 mt-6 px-4 text-3xl font-bold xl:mt-0 xl:px-0">Analytics</h2>
      <div className="grid grid-cols-1 gap-4 px-4 pb-[3rem] md:grid-cols-2 lg:grid-cols-3 xl:px-0">
        {essentialCards.map((card, index) => (
          <Link to={`${card.href}`} key={index?.toString()} className="block h-full">
            <Card className="hover:border-primary/50 relative h-full transition-all hover:shadow-md">
              <CardHeader className="h-[7rem] pb-2">
                <CardTitle className="absolute left-4 top-4">{card.icon}</CardTitle>
                <CardTitle className="ml-[4rem] pb-4 text-xl">{card.title}</CardTitle>
              </CardHeader>
              <CardContent className="h-[3rem]">
                <CardDescription>{card.description}</CardDescription>
              </CardContent>
              <CardFooter className="pt-2">
                <span className="text-primary text-sm">Configure →</span>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
};

const AnalyticsCards = memo(MemoAnalyticsCards);
export default AnalyticsCards;
