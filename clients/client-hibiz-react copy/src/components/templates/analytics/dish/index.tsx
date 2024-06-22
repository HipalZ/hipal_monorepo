import Hi from '@/assets/svg/hi.svg';
import axios from '@/axios';
import LoadingSpinner from '@/components/atom/loadingSpinner';
import ErrorComponent from '@/components/errorComponent';
import DateRangePicker from '@/components/molecules/dateRangePicker';
import Header from '@/components/molecules/header';
import { useSelectedIcon } from '@/components/store/useSelectedIcon';
import useTimings from '@/components/store/useTimings';
import type { IAnalyticsItem } from '@/components/types/businessData';
import {  Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { useQuery } from '@tanstack/react-query';
import ExcelJS from 'exceljs';
import { memo, useState } from 'react';
import { AiFillCaretDown } from 'react-icons/ai';
import { BiChevronsLeft, BiChevronsRight, BiDownload } from 'react-icons/bi';
import { FaArrowLeft } from 'react-icons/fa';
import { IoFastFoodOutline } from 'react-icons/io5';
import { useParams } from 'react-router-dom';

function AnalyticsDish() {
  const [dish, setDish] = useState<IAnalyticsItem[] | null>(null);
  const { setSelectedSubIcon, selectedSubIcon } = useSelectedIcon();
  const { inTime, outTime } = useTimings();
  const [currentPage, setCurrentPage] = useState(1);
  const { businessId } = useParams<{ businessId: string }>();

  const getDish = async () => {
    let url = `/v1/kitchens/:id/Dishes?businessId=${businessId}`;
    if (inTime && outTime) {
      url += `&from=${inTime}&to=${outTime}`;
    }
    try {
      const res = await axios.get(url);
      setDish(res.data.data);
      return res.data.data;
    } catch (error) {
      console.error('Error fetching sales report:', error);
    }
  };

  const itemsPerPage = 20;

  const totalPages = dish ? Math.ceil(dish.length / itemsPerPage) : 0;

  const handleClick = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Dishes');

    // Define columns for categories and dishes
    worksheet.columns = [
      { header: 'Category Name', key: 'categoryName', width: 20 },
      { header: 'Category Percentage', key: 'categoryPercentage', width: 18 },
      { header: 'Category Orders', key: 'categoryOrders', width: 15 },
      { header: 'Dish Name', key: 'dishName', width: 20 },
      { header: 'Dish Percentage', key: 'dishPercentage', width: 15 },
      { header: 'Dish Orders', key: 'dishOrders', width: 12 },
    ];

    // Set bold header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).eachCell({ includeEmpty: true }, (cell, colNumber) => {
      if (colNumber !== 4) {
        // Skip the fourth column
        cell.alignment = { horizontal: 'center' };
      }
    });
    // Adding category and dish data
    dish.forEach((category) => {
      category.dishes.forEach((dish) => {
        const row = worksheet.addRow({
          categoryName: category.categoryName,
          categoryPercentage: category.percentage,
          categoryOrders: category.orders,
          dishName: dish.name,
          dishPercentage: dish.percentage,
          dishOrders: dish.orders,
        });
        // Apply center alignment to each cell in the row
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          if (colNumber !== 4) {
            // Skip the fourth column
            cell.alignment = { horizontal: 'center' };
          }
        });
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    triggerDownload(buffer);
  };
  const triggerDownload = (buffer: any) => {
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Dishes_Analytics_${inTime}_to_${outTime}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ['getDish', businessId, inTime, outTime, selectedSubIcon === 'dish'],
    queryFn: getDish,
    enabled: !!businessId && !!inTime && !!outTime && selectedSubIcon === 'dish',
  });

  if (error) return <ErrorComponent refetch={refetch} />;
  return (
    <div className="relative">
      <div className="sticky top-0 z-20 linear_gradient_background">
        <Header
          title="Analytics"
          onBack={() => setSelectedSubIcon('')}
          leftIcon={<FaArrowLeft />}
          centerImage={Hi}
          rightImage={Hi}
          isIconBusinessShow={true}
        />
        <div className="flex items-center justify-between px-6 pb-2 mt-6">
          <div className="ml-2 text-xl"> Dish</div>
          <div
            onKeyDown={exportToExcel}
            onClick={exportToExcel}
            className="on_active_bounce flex items-center justify-center space-x-2 rounded-lg border border-[#cacaca] bg-white px-2 py-1 text-sm"
          >
            <BiDownload />
            <button type="button">CSV</button>
          </div>
        </div>
        <DateRangePicker />
      </div>
      <div className="masonry-layout relative mt-6 w-full space-y-4 overflow-auto scroll-smooth px-6 pb-[2rem]">
        {isLoading ? (
          <LoadingSpinner />
        ) : dish && dish.length > 0 ? (
          <>
            <div className="masonry-item">
              {dish?.map((eachDish: IAnalyticsItem) => (
                <>
                   <Disclosure  as="div" defaultOpen={true}>
                    {({ open }) => {
                      return (
                        <>
                          <div className="my-4 rounded-lg border border-[#cacaca]">
                            <DisclosureButton className="w-full p-4">
                              <section className="flex items-center justify-between">
                                <h1 className="text-base font-semibold capitalize">{eachDish?.categoryName}</h1>
                                <AiFillCaretDown className={`ml-2 h-4 w-4 ${open ? 'rotate-180 transform' : ''}`} />
                              </section>
                              <section className="flex items-center justify-between mt-2 text-base">
                                <h1>{eachDish?.orders} orders</h1>
                                <h1>{eachDish?.percentage} %</h1>
                              </section>
                            </DisclosureButton>
                            {eachDish?.dishes?.map((eachChild, index) => {
                              return (
                                <DisclosurePanel key={index.toString()} className="mx-4 text-sm">
                                  <div className="pb-4 space-y-2 text-sm font-medium">
                                    <hr className="bg-[#cacaca]" />
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center">
                                        <IoFastFoodOutline className="text-2xl" />
                                        <span className="ml-2">{eachChild?.name}</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span>{eachChild?.orders}</span>
                                      </div>
                                    </div>
                                  </div>
                                </DisclosurePanel>
                              );
                            })}
                          </div>
                        </>
                      );
                    }}
                  </Disclosure>
                </>
              ))}
            </div>
            <div className="fixed bottom-[5rem] left-1/2 z-20 flex -translate-x-1/2 transform items-center justify-center space-x-4">
              {dish && dish.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleClick(currentPage > 1 ? currentPage - 1 : 1)}
                  disabled={currentPage === 1}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#000000] bg-white text-base text-black"
                >
                  <BiChevronsLeft />
                </button>
              )}

              {[...Array(totalPages)].map((_, idx) => (
                <button
                  type="button"
                  key={idx.toString()}
                  onClick={() => handleClick(idx + 1)}
                  disabled={currentPage === idx + 1}
                  className={`flex h-10 w-10 items-center justify-center ${
                    currentPage === idx + 1
                      ? 'rounded-full border border-[#000000] bg-[#000000] text-white'
                      : 'rounded-full border border-[#000000] bg-white text-black'
                  }`}
                  style={{
                    display: idx >= currentPage - 1 && idx <= currentPage + 1 ? 'inline-flex' : 'none',
                  }}
                >
                  {idx + 1}
                </button>
              ))}

              {dish && dish.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleClick(currentPage < totalPages ? currentPage + 1 : totalPages)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#000000] bg-white text-base text-black"
                  disabled={currentPage === totalPages}
                >
                  <BiChevronsRight />
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="fixed flex flex-col text-center transform -translate-x-1/2 left-1/2 top-1/2">
              No Dish Analytics Found
              <div className="text-base">({inTime && outTime ? `${inTime} to ${outTime} ` : ''} )</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default memo(AnalyticsDish);
