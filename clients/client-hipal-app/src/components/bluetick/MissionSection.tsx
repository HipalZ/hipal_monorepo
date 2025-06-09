"use client"

import { motion } from "framer-motion"
import { memo, useCallback, useRef } from "react"
import { ArrowRight, CheckCircle, MessageCircle, TrendingUp, Users } from "lucide-react"

const MemoMissionSection = () => {
  const sectionRef = useRef(null)

  const stats = [
    {
      value: "2x",
      label: "Reply Rate",
      icon: MessageCircle,
      description: "Higher response rates from verified business accounts",
    },
    {
      value: "85%",
      label: "Better Conversion",
      icon: TrendingUp,
      description: "Increased conversion rates with verified status",
    },
    {
      value: "132+",
      label: "Verified Businesses",
      icon: Users,
      description: "Businesses already enjoying verification benefits",
    },
  ]

    const openCalendar = useCallback(() => {
      window.open(
        "https://calendly.com/palnesto/1hour",
        "_blank",
        "noopener,noreferrer",
      );
    }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-gradient-to-b from-[#f8f6f1] to-[#f0ede5] py-16 md:py-20 lg:py-24 px-4 md:px-8 lg:px-12 text-[#252223]"
    >
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-30 translate-y-1/2 -translate-x-1/2"></div>

      <div className="max-w-7xl mx-auto">
        {/* Mission Statement */}
        <motion.div
          className="flex flex-col lg:flex-row items-start justify-between gap-8 lg:gap-16 mb-16 lg:mb-24"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <div className="lg:max-w-3xl">
            <motion.div
              className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full text-xs font-medium mb-4"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Meta Verified Business
            </motion.div>

            <motion.h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Stand out with trust and credibility
            </motion.h2>

            <motion.p
              className="text-lg md:text-xl text-gray-600 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Get your business Meta Verified and elevate customer confidence instantly. Join the elite group of trusted
              brands that customers prefer to engage with.
            </motion.p>
          </div>

          <motion.div
            className="w-full lg:w-auto flex flex-col gap-4"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <p className="text-sm text-gray-500 mb-4">Ready to get started?</p>
              <button
                type="button"
                onClick={openCalendar}
                className="bg-[#703BF7] rounded-lg w-full text-white py-3 px-6 font-medium flex items-center justify-center gap-2 hover:bg-[#5f32d1] transition-colors duration-300"
              >
                Connect with us now
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-xs text-gray-400 mt-3 text-center">No commitment required</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          className="relative border-t border-b border-gray-200 py-12 md:py-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <motion.div
                  key={index}
                  className="flex flex-col items-center md:items-start"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.2 }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-[#6532FF]" />
                    </div>
                    <motion.span
                      className="text-5xl text-[#6532FF] font-extrabold"
                      initial={{ opacity: 0, scale: 0.5 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.6 + index * 0.2, ease: "backOut" }}
                    >
                      {stat.value}
                    </motion.span>
                  </div>
                  <div className="ml-0 md:ml-12">
                    <h3 className="text-lg font-semibold text-gray-800">{stat.label}</h3>
                    <p className="text-sm text-gray-500 mt-1">{stat.description}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

const MissionSection = memo(MemoMissionSection)
export default MissionSection
