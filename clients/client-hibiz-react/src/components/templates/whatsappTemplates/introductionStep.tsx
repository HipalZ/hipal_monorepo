import { useWhatsappTempStore } from "@/components/store/useWhatsappTempStore";
import {
  Shield,
  MessageSquare,
  Zap,
  BarChart,
  Users,
  Check,
  ArrowRight,
} from "lucide-react";
import { memo } from "react";

const benefits = [
  {
    icon: MessageSquare,
    title: "WABA Integration",
    description:
      "Complete whatzApp Business API setup and integration with Hipal",
  },
  {
    icon: Zap,
    title: "Campaign Management",
    description: "Expert guidance on running effective marketing campaigns",
  },
  {
    icon: BarChart,
    title: "Growth Strategy",
    description: "Personalized consultation to scale your business reach",
  },
  {
    icon: Shield,
    title: "Meta Blue Tick Verification",
    description:
      "Consultation to get your Meta Business Account verified and establish credibility",
  },
  {
    icon: Users,
    title: "Customer Connection",
    description: "Enhanced tools to build stronger customer relationships",
  },
];

const services = [
  "WABA (whatzApp Business API) Account Activation",
  "Meta Business Account Verification Consulting",
  "Complete Integration with Hipal Ecosystem",
  "Campaign Management & Strategy",
  "Business Growth Consultation",
  "Enhanced Customer Connection Tools",
];
function MemoizedIntroductionStep() {
  const { setStep } = useWhatsappTempStore((s) => ({
    setStep: s.setStep,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-16 text-center">
          <h1 className="mb-6 text-5xl font-bold text-gray-900">
            Supercharge Your Business with
            <span className="block mt-2 text-emerald-600">
              WhatzApp By Hipalz
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-600">
            Transform your business communication with our complete whatzApp
            Business solution
          </p>
        </div>

        {/* Pricing and Benefits Grid */}
        <div className="grid gap-12 mb-16 lg:grid-cols-2">
          {/* Left Column - Pricing */}
          <div className="grid gap-6">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="flex items-start p-6 space-x-4 transition-shadow bg-white shadow-md rounded-xl hover:shadow-lg"
              >
                <div className="flex-shrink-0">
                  <benefit.icon className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {benefit.title}
                  </h3>
                  <p className="mt-2 text-gray-600">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column - Benefits */}
          <div className="p-8 bg-white shadow-xl rounded-2xl md:p-12">
            <div className="mb-8 text-center">
              <div className="inline-block px-4 py-1 mb-4 text-sm font-medium rounded-full bg-emerald-100 text-emerald-800">
                One-Time Payment
              </div>
              <div className="flex items-center justify-center">
                <span className="text-6xl font-bold text-gray-900">₹3,999</span>
                <span className="ml-2 text-gray-500">/ lifetime</span>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="mb-4 text-xl font-semibold text-gray-900">
                Everything you need to succeed:
              </h3>
              <div className="space-y-4">
                {services.map((service) => (
                  <div key={service} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <Check className="w-6 h-6 text-emerald-500" />
                    </div>
                    <span className="text-gray-700">{service}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 text-sm text-gray-600">
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span>
                    * Conditions apply prior to meta terms and conditions
                  </span>
                </li>
                <li className="flex items-center">
                  <span>* No monthly fees or hidden costs</span>
                </li>
                <li className="flex items-center">
                  <span>* Lifetime access to all features</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="p-12 text-center shadow-xl bg-emerald-600 rounded-2xl">
          <h2 className="mb-6 text-3xl font-bold text-white">
            Ready To Say Hi To Your Customers?
          </h2>
          <p className="max-w-2xl mx-auto mb-8 text-lg text-emerald-100">
            Join successful businesses that have elevated their customer
            engagement with our complete whatzApp Business solution
          </p>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="inline-flex items-center px-8 py-4 font-semibold transition-colors bg-white rounded-full shadow-lg group text-emerald-600 hover:bg-emerald-50 hover:shadow-xl"
          >
            Get Started Today
            <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
}

const IntroductionStep = memo(MemoizedIntroductionStep);
export default IntroductionStep;
