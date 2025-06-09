'use client';
import Image from 'next/image';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import WhatsAppImages from '@/assets/bluetick/whatsAppImage.png';
import GetImage from '@/assets/bluetick/get.png';

const faqData = [
  {
    id: 1,
    question: 'How long does the verification process take?',
    answer:
      'Our average verification time is less than 7 days. Most applications are approved within 3-5 business days thanks to our proven methodology and expert application crafting.',
  },
  {
    id: 2,
    question: "What's your success rate?",
    answer:
      'We maintain a 94% success rate the highest in the industry. Our comprehensive business analysis and strategic positioning ensure your application meets all Meta requirements.',
  },
  {
    id: 3,
    question: 'Do you offer a guarantee?',
    answer:
      "Yes! We offer a success guarantee. If your application is not approved, we provide a full refund. We're confident in our methodology and stand behind our results.",
  },
];

const Faq = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  const toggleItem = (id: number) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isItemOpen = (id: number) => {
    return openItems.includes(id) || hoveredItem === id;
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-12">
      {/* WhatsApp Image */}
      <motion.figure
        className="mb-8 relative z-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Image
          src={WhatsAppImages || '/placeholder.svg'}
          alt="WhatsApp Image"
          width={1773}
          height={831}
          className="w-full h-auto rounded-2xl shadow-lg"
        />
        <Image
          src={GetImage}
          alt="Get Image"
          width={247}
          height={247}
          className="w-[12rem] h-[12rem] hidden lg:block transform translate-x-1/2 translate-y-1/2 left-[35%] rounded-full absolute bottom-0 shadow-lg"
        />
      </motion.figure>

      {/* Heading */}
      <motion.h1
        className="text-4xl md:text-5xl font-bold mt-12 lg:mt-[6rem] text-[#1BA406] text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        Frequently Asked Questions
      </motion.h1>

      {/* FAQ Section */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {faqData.map((item, index) => (
          <motion.div
            key={item.id}
            className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
            onMouseEnter={() => setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            {/* Question */}
            <button
              type="button"
              onClick={() => toggleItem(item.id)}
              className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1BA406] focus:ring-inset"
            >
              <h3 className="text-lg md:text-xl font-semibold text-gray-800 pr-4">
                {item.question}
              </h3>
              <motion.div
                animate={{ rotate: isItemOpen(item.id) ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="flex-shrink-0"
              >
                {isItemOpen(item.id) ? (
                  <ChevronUp className="w-5 h-5 text-[#1BA406]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </motion.div>
            </button>

            {/* Answer */}
            <AnimatePresence>
              {isItemOpen(item.id) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-5">
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </motion.div>

      {/* Additional Info */}
      <motion.div
        className="mt-12 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.0 }}
      >
        <p className="text-gray-600 text-lg">
          Have more questions?
          <span className="text-[#1BA406] font-semibold ml-2 cursor-pointer hover:underline">
            Contact our support team
          </span>
        </p>
      </motion.div>
    </div>
  );
};

export default Faq;
