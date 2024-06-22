import useTimings from '@/components/store/useTimings';
import type { DailyReviewAnalysis } from '@/components/types/businessData';
import { memo, useEffect, useState } from 'react';

const ReviewBarChart = (props: { data: DailyReviewAnalysis[] }) => {
  const { data } = props;
  const [datesArr, setDatesArr] = useState<string[]>([]);
  const { timeStampStart } = useTimings();

  const getDates = (timeStamp: any) => {
    const datesArr: string[] = [];
    for (let i = 0; i <= 6; i++) {
      const date = new Date(timeStamp.getTime() - i * 24 * 60 * 60 * 1000);
      const formattedDate = `${date.getDate().toString().padStart(2, '0')} ${date.toLocaleString('default', { month: 'short' })}`;
      datesArr.push(formattedDate);
    }
    setDatesArr(datesArr);
  };

  useEffect(() => {
    getDates(new Date(timeStampStart));
  }, [timeStampStart]);

  return (
    <>
      <section id="chart">
        {data.length &&
          data.map((item, index) => {
            return (
              <div className="date" key={index.toString()}>
                <div className="review-bars">
                  <div className="positive" style={{ height: `${item.positivePercentage}%` } as React.CSSProperties}></div>
                  <div className="negative" style={{ height: `${item.negativePercentage}%` } as React.CSSProperties}></div>
                </div>
                <div className="date-value mx-2">{datesArr[index]}</div>
              </div>
            );
          })}
      </section>
    </>
  );
};

export default memo(ReviewBarChart);
