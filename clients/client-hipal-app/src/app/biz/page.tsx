"use client";

import { useState, useEffect } from "react";
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
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<Business[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "2701") {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Hint : Tattoo on my hand.");
    }
  };

  const getAllBusiness = async (): Promise<Business[]> => {
    const response = await apiRpc.businesses.getAllbusinesses.$get();
    const data = await response.json();
    return data.data;
  };

  const { isLoading, data } = useQuery({
    queryKey: ["allBusiness"],
    queryFn: getAllBusiness,
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (data) {
      setFilteredData(
        data.filter((business) =>
          business.name.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      );
    }
  }, [data, searchTerm]);

  const handleBusinessClick = (customLink: string) => {
    window.open(`${BUSINESS_KEYID}/${customLink}`, "_blank");
  };

  return (
    <div className="p-4 mx-auto max-w-7xl">
      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <motion.div
            key="auth"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="p-6 bg-white rounded-lg shadow-md"
          >
            <h2 className="mb-4 text-xl font-semibold text-black">
              Hello Prem ji
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full p-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="w-full px-4 py-2 text-white transition-colors bg-blue-500 rounded-md hover:bg-blue-600"
              >
                Submit
              </button>
            </form>
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 mt-4 text-red-700 bg-red-100 rounded-md"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky top-0 z-10 p-4 bg-white shadow-md"
            >
              <input
                type="text"
                placeholder="Search businesses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </motion.div>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <motion.div
                  className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              </div>
            ) : (
              <motion.div
                className="grid gap-6 md:grid-cols-1 lg:grid-cols-2"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.1 } },
                }}
              >
                {filteredData.map((business) => (
                  <motion.button
                    key={business._id}
                    onClick={() => handleBusinessClick(business.customLink)}
                    className="flex p-4 text-left bg-white rounded-lg shadow-md"
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 },
                    }}
                  >
                    <div className="flex-shrink-0 mr-4">
                      {business.logo ? (
                        <img
                          src={business.logo}
                          alt={`${business.name} logo`}
                          className="object-cover w-24 h-24 rounded-md"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-24 h-24 text-2xl font-bold text-black bg-gray-300 rounded-md">
                          {business.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <h3 className="mb-2 text-2xl font-semibold text-black">
                        {business.name}
                      </h3>
                      <p className="mb-2 text-sm text-gray-600">
                        Custom Link: {business.customLink}
                      </p>
                      {business.address && (
                        <p className="text-sm text-gray-700">
                          Address: {business.address}
                        </p>
                      )}
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
