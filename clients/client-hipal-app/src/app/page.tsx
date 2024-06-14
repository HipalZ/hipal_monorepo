import WhatsappRedirect from "@/components/atoms/whatsappRedirect"
import BusinessThrive from "@/components/molecules/businessThrive"
import BusinessThriveMobile from "@/components/molecules/businessThriveMobile"
import CardSection from "@/components/molecules/cardSection"
import CeoContainer from "@/components/molecules/ceoContainer"
import FooterSection from "@/components/molecules/footerSection"
import LogoNavBar from "@/components/molecules/logoNavBar"
import MiddleSection from "@/components/molecules/middleSection"
import StartTrail from "@/components/molecules/startTrail"

export default function Home() {
  return (
    <main >
      <div className="bg-[#fef7f5] !w-screen !h-screen overflow-x-hidden relative">
        <LogoNavBar />
        {/* <TopSection /> */}
        <MiddleSection />
        <CardSection />
        <BusinessThrive />
        <StartTrail />
        <BusinessThriveMobile />
        <CeoContainer />
        <FooterSection />
        <WhatsappRedirect />
      </div>
    </main>
  );
}
