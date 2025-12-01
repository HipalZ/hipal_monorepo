"use client";
import { useState, useMemo, useDeferredValue } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRpc } from "@hi/common";
import { motion, AnimatePresence } from "framer-motion";
import { BUSINESS_KEYID } from "@/configs";

interface Business {
  _id: string;
  name: string;
  customLink: string;
  logo?: string;
  address?: string;
}

export default function AllBusiness() {
  const [searchTerm, setSearchTerm] = useState("");

  const deferredSearch = useDeferredValue(searchTerm);
  const animateList = searchTerm.length === 0;

    const getAllBusiness = async (): Promise<Business[]> => {
    const response = await apiRpc.businesses.getAllbusinesses.$get();
    const data = await response.json();
    return data.data || [];
  };
  const { isLoading, data } = useQuery({
    queryKey: ["allBusiness"],
    queryFn: getAllBusiness,
  });

  // Filtered List
  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!deferredSearch.trim()) return data;

    return data.filter((business) =>
      business.name.toLowerCase().includes(deferredSearch.toLowerCase())
    );
  }, [data, deferredSearch]);

  const handleBusinessClick = (customLink: string) => {
    window.open(`${BUSINESS_KEYID}/${customLink}`, "_blank");
  };

  return (
    <div className="p-4 mx-auto max-w-7xl">
      <AnimatePresence mode="wait">
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-4"
        >
          {/* Search Box */}
          <div className="sticky top-0 z-10 p-4 bg-white shadow-md">
            <input
              type="text"
              placeholder="Search businesses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-black"
            />
          </div>

          {/* Loader */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <motion.div
                className="w-16 h-16 border-t-4 border-blue-500 rounded-full"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              />
            </div>
          ) : (
            <motion.div
              className="grid gap-6 md:grid-cols-1 lg:grid-cols-2"
              initial={animateList ? "hidden" : false}
              animate={animateList ? "visible" : false}
              variants={
                animateList
                  ? {
                      hidden: { opacity: 0, y: 25 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: { staggerChildren: 0.04 },
                      },
                    }
                  : undefined
              }
            >
              {filteredData.map((business) => (
                <motion.button
                  key={business._id}
                  onClick={() => handleBusinessClick(business.customLink)}
                  className="flex p-4 text-left bg-white rounded-lg shadow-md"
                  variants={
                    animateList
                      ? {
                          hidden: { opacity: 0, y: 20 },
                          visible: { opacity: 1, y: 0 },
                        }
                      : undefined
                  }
                >
                  {/* Logo */}
                  <div className="flex-shrink-0 mr-4">
                    {business.logo ? (
                      <img
                        src={business.logo}
                        alt="logo"
                        className="w-24 h-24 rounded-md object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 flex items-center justify-center bg-gray-300 rounded-md text-2xl font-bold">
                        {business.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-grow">
                    <h3 className="mb-2 text-2xl font-semibold text-black">
                      {business.name}
                    </h3>
                    <p className="mb-2 text-sm text-gray-600">
                      Custom Link: {business.customLink}
                    </p>
                    {business.address && (
                      <p className="text-sm text-gray-700">{business.address}</p>
                    )}
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
