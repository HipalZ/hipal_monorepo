import { memo, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { FaArrowLeft } from "react-icons/fa"

import Header from "@/components/molecules/header"
import useBusinessCtrl from "@/components/store/useBusinessCtrl"
import BusinessType from "@/components/templates/addBusinessForm/businessType"
import OutletType from "@/components/templates/addBusinessForm/outletTypeForm"
import AddName from "@/components/templates/addBusinessForm/addName"
import Congratulation from "@/components/templates/signupPage/congratulation"
import SectionWithLogo from "@/components/atom/sectionWithLogo"

import Hi from "@/assets/svg/hi.svg"
import Terms from "@/components/templates/addBusinessForm/Terms"

const STEP_TITLES = ["Business Type","Acknowledgment" , "Outlet Type", "Outlet Name"]
const STEP_SUBHEADINGS = ["What is your business type", "Read the document carefully", "Choose the outlet type", "Choose the outlet name"]

const AddBusinessForm = () => {
  const navigate = useNavigate()
  const { step, goPrevious } = useBusinessCtrl()

  const handleBack = useCallback(() => {
    if (step === 0) {
      navigate("/app/business")
    } else {
      goPrevious()
    }
  }, [step, goPrevious])

  // No need for useCallback here since these are simple lookups
  const title = STEP_TITLES[step] || ""
  const subHeading = STEP_SUBHEADINGS[step] || ""
  const isLastStep = step === 4

  return (
    <section className="min-h-screen">
      {isLastStep ? (
        <SectionWithLogo>
          <Congratulation />
        </SectionWithLogo>
      ) : (
        <main>
          <div className="linear_gradient_background">
            <Header
              title={title}
              onBack={handleBack}
              leftIcon={<FaArrowLeft />}
              rightImage={Hi}
              isIconBusinessShow={false}
            />
          </div>

          <header className="flex items-center justify-between p-4">
            <h3 className="text-xl font-semibold">{subHeading}</h3>
            <h3 className="text-xl font-semibold">{step + 1} / 4</h3>
          </header>

          {step === 0 && <BusinessType />}
          {
            step === 1 && <Terms />
          }
          {step === 2 && <OutletType />}
          {step === 3 && <AddName />}
        </main>
      )}
    </section>
  )
}

export default memo(AddBusinessForm)

