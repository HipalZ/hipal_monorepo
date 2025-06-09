"use client"
import { motion } from "framer-motion"
import { ArrowRight, CheckCircle, MessageCircle, Phone, Mail, Star } from "lucide-react"
import { memo, useCallback } from "react"

const MemoBottom = () => {
  const benefits = ["94% Success Rate", "5-Day Average Approval", "Full Money-Back Guarantee", "Expert Support Team"]

  // Function to open WhatsApp chat
  const openWhatsApp = useCallback(() => {
    window.open("https://wa.me/916300529700", "_blank", "noopener,noreferrer")
  }, [])

  // Function to make a phone call
  const callUs = useCallback(() => {
    window.open("tel:+916300529700", "_blank", "noopener,noreferrer")
  }, [])

  // Function to send an email
  const email = useCallback(() => {
    window.open("mailto:Info@paltribe.in", "_blank", "noopener,noreferrer")
  }, [])

  const contactMethods = [
    {
      icon: MessageCircle,
      label: "Live Chat",
      description: "Get instant answers",
      action: "Start Chat",
      onClick: openWhatsApp,
    },
    {
      icon: Phone,
      label: "Call Us",
      description: "Speak with an expert",
      action: "Call Now",
      onClick: callUs,
    },
    {
      icon: Mail,
      label: "Email",
      description: "Send us your questions",
      action: "Send Email",
      onClick: email,
    },
  ]

  // Function to open Calendly scheduling
  const openCalendar = useCallback(() => {
    window.open("https://calendly.com/palnesto/1hour", "_blank", "noopener,noreferrer")
  }, [])

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#6532FF] via-[#7c3aed] to-[#8b5cf6] text-white py-16 md:py-20 lg:py-24 px-4 md:px-8">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/3 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Main Content */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Star className="w-4 h-4 fill-current" />
            Trusted by 100+ Businesses
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Connect with Trust,
            <br />
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Connect with Us
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Ready to transform your business credibility? Let's get you verified today and unlock the power of trusted
            communication.
          </motion.p>

          {/* Benefits List */}
          <motion.div
            className="flex flex-wrap justify-center gap-4 mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
              >
                <CheckCircle className="w-4 h-4 text-green-300" />
                <span className="text-sm font-medium">{benefit}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Main CTA Button - Connected to Calendly */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <motion.button
              className="bg-white text-[#6532FF] px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 mx-auto hover:bg-gray-50 transition-colors duration-300 shadow-2xl"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={openCalendar}
              aria-label="Schedule a consultation on Calendly"
            >
              Connect with us now
              <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}>
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            </motion.button>
            <p className="text-white/70 text-sm mt-3">No commitment required • Free consultation</p>
          </motion.div>
        </motion.div>

        {/* Contact Methods - Each connected to appropriate function */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {contactMethods.map((method, index) => {
            const IconComponent = method.icon
            return (
              <motion.div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/15 transition-colors duration-300 border border-white/20"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{method.label}</h3>
                <p className="text-white/80 mb-4">{method.description}</p>
                <motion.button
                  className="bg-white/20 text-white px-6 py-2 rounded-lg font-medium hover:bg-white/30 transition-colors duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={method.onClick}
                  aria-label={`Contact via ${method.label}`}
                >
                  {method.action}
                </motion.button>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          {[
            { number: "100+", label: "Businesses Verified" },
            { number: "94%", label: "Success Rate" },
            { number: "5 Days", label: "Average Approval" },
            { number: "24/7", label: "Expert Support" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
            >
              <div className="text-3xl md:text-4xl font-bold text-yellow-300 mb-2">{stat.number}</div>
              <div className="text-white/80 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Text */}
        <motion.div
          className="text-center mt-12 pt-8 border-t border-white/20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <p className="text-white/70">
            Join the elite group of verified businesses that customers trust.
            <br />
            <span className="text-white font-semibold">Your verification journey starts here.</span>
          </p>
        </motion.div>
      </div>
    </section>
  )
}

const Bottom = memo(MemoBottom)
export default Bottom
