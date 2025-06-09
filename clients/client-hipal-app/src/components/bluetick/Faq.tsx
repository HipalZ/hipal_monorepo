"use client";
import Image from "next/image";
import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Clock,
  Shield,
} from "lucide-react";
import WhatsAppImages from "@/assets/bluetick/whatsAppImage.png";
import GetImage from "@/assets/bluetick/get.png";

const faqData = [
  {
    id: 1,
    question: "How long does the verification process take?",
    answer:
      "Our average verification time is less than 7 days. Most applications are approved within 3-5 business days thanks to our proven methodology and expert application crafting.",
    icon: Clock,
  },
  {
    id: 2,
    question: "What's your success rate?",
    answer:
      "We maintain a 94% success rate the highest in the industry. Our comprehensive business analysis and strategic positioning ensure your application meets all Meta requirements.",
    icon: Shield,
  },
  {
    id: 3,
    question: "Do you offer a guarantee?",
    answer:
      "Yes! We offer a success guarantee. If your application is not approved, we provide a full refund. We're confident in our methodology and stand behind our results.",
    icon: MessageCircle,
  },
];

const Faq = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  const toggleItem = (id: number) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const isItemOpen = (id: number) => {
    return openItems.includes(id) || hoveredItem === id;
  };

  const openCalendar = useCallback(() => {
    window.open(
      "https://calendly.com/palnesto/1hour",
      "_blank",
      "noopener,noreferrer",
    );
  }, []);

  // +91 6300529700

  const callUs = useCallback(() => {
    window.open("tel:+916300529700", "_blank", "noopener,noreferrer");
  }, []);

  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-16 lg:py-24">
      <div className="w-full max-w-6xl mx-auto px-4">
        <motion.div
          className="mb-8 relative z-0"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative">
            <Image
              src={WhatsAppImages || "/placeholder.svg"}
              alt="WhatsApp Business Interface"
              width={1773}
              height={831}
              className="w-full h-auto rounded-2xl shadow-2xl"
            />

            {/* Floating Get Image */}
            <motion.div
              className="hidden lg:block absolute bottom-0 left-[35%] transform translate-x-1/2 translate-y-1/2"
              initial={{ scale: 0, rotate: -180 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3, ease: "backOut" }}
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <div className="relative">
                <Image
                  src={GetImage || "/placeholder.svg"}
                  alt="Get Verified Badge"
                  width={247}
                  height={247}
                  className="w-[12rem] h-[12rem] rounded-full shadow-2xl border-4 border-white"
                />
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-green-400/20 to-blue-400/20" />
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          className="text-center mb-16 mt-12 lg:mt-24"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <MessageCircle className="w-4 h-4" />
            Got Questions? We Have Answers
          </motion.div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1BA406] mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about our WhatsApp Business verification
            process
          </p>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          className="space-y-6 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {faqData.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <motion.div
                key={item.id}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                whileHover={{ y: -2 }}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className="w-full px-6 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1BA406] focus:ring-inset group"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors duration-200">
                      <IconComponent className="w-6 h-6 text-[#1BA406]" />
                    </div>
                    <h3 className="text-lg md:text-xl font-semibold text-gray-800 pr-4">
                      {item.question}
                    </h3>
                  </div>
                  <motion.div
                    animate={{ rotate: isItemOpen(item.id) ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-[#1BA406] group-hover:text-white transition-colors duration-200">
                      {isItemOpen(item.id) ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </motion.div>
                </button>

                <AnimatePresence>
                  {isItemOpen(item.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6">
                        <div className="border-t border-gray-100 pt-4 ml-16">
                          <motion.p
                            className="text-gray-600 leading-relaxed text-lg"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                          >
                            {item.answer}
                          </motion.p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          className="text-center bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Still have questions?
          </h3>
          <p className="text-gray-600 text-lg mb-6">
            Our expert team is here to help you through every step of the
            verification process.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              className="bg-[#1BA406] text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors duration-300 flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openCalendar}
            >
              <MessageCircle className="w-5 h-5" />
              Contact Support Team
            </motion.button>
            <motion.button
              onClick={callUs}
              className="border-2 border-[#1BA406] text-[#1BA406] px-8 py-3 rounded-xl font-semibold hover:bg-[#1BA406] hover:text-white transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Schedule a Call
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Faq;
