import BottomButton from "@/components/atom/bottomButton"
import useBusinessCtrl, { EnumBusinessType, type businessType } from "@/components/store/useBusinessCtrl"
import { memo, useCallback } from "react"
import toast from "react-hot-toast"

export const businessTypeArray = [
  {
    title: "🍽️ Restaurant",
    description:
      "From cozy cafes to fine dining, elevate your restaurant's digital presence and streamline operations.",
    tags: ["Online Menu", "Table Reservations", "Order Management", "Customer Reviews", "Loyalty Program"],
    tagColor: "#FF6B6B",
    gradient: "linear-gradient(135deg, #FFD3A550 0%, #FD658550 100%)",
    type: EnumBusinessType.MENU,
  },
  {
    title: "🏨 Hotel",
    description: "Enhance guest experiences and boost bookings with cutting-edge digital solutions for your hotel.",
    tags: ["Room Booking", "Virtual Tours", "Concierge Services", "Guest Feedback", "Loyalty Rewards"],
    tagColor: "#4ECDC4",
    gradient: "linear-gradient(135deg, #C4E0E550 0%, #4CA1AF50 100%)",
    type: EnumBusinessType.HOTEL,
  },
  {
    title: "🛒 E-commerce",
    description: "Transform your online store into a powerhouse with tools designed for modern e-commerce success.",
    tags: [
      "Product Catalog",
      "Secure Payments",
      "Inventory Management",
      "Customer Analytics",
      "Abandoned Cart Recovery",
    ],
    tagColor: "#FF8C00",
    gradient: "linear-gradient(135deg, #FFE98550 0%, #FA742B50 100%)",
    type: EnumBusinessType.ECOMMERCE,
  },
  {
    title: "🏥 Clinics",
    description: "Streamline patient care and clinic management with specialized digital health solutions.",
    tags: ["Appointment Scheduling", "Patient Records", "Telemedicine", "Prescription Management", "Health Analytics"],
    tagColor: "#45B649",
    gradient: "linear-gradient(135deg, #DCE35B50 0%, #45B64950 100%)",
    type: EnumBusinessType.CLINIC,
  },
  {
    title: "💍 Fashion & Jewelry",
    description: "Showcase your stunning collections and provide a luxurious online shopping experience.",
    tags: ["Virtual Try-On", "Custom Orders", "Look Books", "VIP Customer Service", "Event Invitations"],
    tagColor: "#A239CA",
    gradient: "linear-gradient(135deg, #E8CBC050 0%, #636FA450 100%)",
    type: EnumBusinessType.FASHION_AND_JEWELRY,
  },
  // {
  //   title: "👤 Personal Brand",
  //   description: "Build and grow your personal brand with tools tailored for influencers, coaches, and entrepreneurs.",
  //   tags: [
  //     "Portfolio Showcase",
  //     "Booking System",
  //     "Content Management",
  //     "Social Media Integration",
  //     "Newsletter Signup",
  //   ],
  //   tagColor: "#1E90FF",
  //   gradient: "linear-gradient(135deg, #FDEB7150 0%, #F8D80050 100%)",
  //   type: "PERSONAL_BRAND" as businessType,
  // },
  {
    title: "🍕 Food Biz",
    description:
      "Give your restaurant🍽️, cafe, bakery🧁, pub🍾 . . . the tools to fly high and capture digital real estate too",
    tags: ["Web page", "E.Menu", "Rewardz & Loyalty", "Payments", "CRM", "Messaging"],
    tagColor: "#9775F8",
    gradient: "linear-gradient(1.7deg, #D9CCFF -11.95%, #F2F2F2 112.46%)",
    type: EnumBusinessType.FOOD,
  },
  {
    title: "✨ Others",
    description:
      "Clothing stores👕, Pet stores🐶, Salons💇 and more. Every store can now be equipped with advanced technology",
    tags: ["Web page", "E.Catalog", "Rewardz & Loyalty", "Payments", "CRM", "Messaging"],
    tagColor: "#000000",
    gradient: "linear-gradient(7.04deg, #FFF3A6 -60.02%, #F0DDE7 93.33%)",
    type: EnumBusinessType.OTHER,
  },
]

const BusinessType = () => {
  const { step, setStep, businessType, setBusinessType } = useBusinessCtrl((s) => ({
    step: s.step,
    setStep: s.setStep,
    businessType: s.businessType,
    setBusinessType: s.setBusinessType,
  }))

  const saveBusinessType = useCallback(
    (type: businessType) => {
      setBusinessType(type)
    },
    [setBusinessType], // Added setBusinessType to dependencies
  )

  const goNext = useCallback(() => {
    if (businessType === "") {
      return toast.error("Please select a business type")
    }
    setStep(step + 1)
  }, [setStep, step, businessType])

  return (
    <main className="">
      <section className="grid grid-cols-1 gap-4 p-4 mx-auto md:grid-cols-2 lg:grid-cols-3 pb-[7rem]">
        {businessTypeArray.map((ele) => (
          <section key={ele.title} className="flex flex-col w-full max-w-sm overflow-hidden border shadow-lg rounded-2xl">
            <article className="flex items-center p-4">
              <input
                type="radio"
                name="businessType"
                value={ele.title}
                id={`businessType-${ele.title}`}
                onChange={() => saveBusinessType(ele.type)}
                checked={businessType === ele.type}
                className="mr-2 radio radio-black"
              />
              <h3 className="text-lg font-semibold">{ele.title}</h3>
            </article>

            <article className="flex-grow p-4" style={{ background: ele.gradient }}>
              <p className="text-sm">{ele.description}</p>
              <div className="flex flex-wrap mt-4">
                {ele.tags.map((tag) => (
                  <div
                    key={tag}
                    className="px-3 py-1 m-1 text-xs text-white rounded-full"
                    style={{ backgroundColor: ele.tagColor }}
                  >
                    {tag}
                  </div>
                ))}
              </div>
            </article>
          </section>
        ))}

      </section>
      <BottomButton
        fixed
        buttons={[
          {
            text: "Next",
            onClick: goNext,
            disable: businessType === "",
          },
        ]}
      />

    </main>
  )
}

export default memo(BusinessType)

