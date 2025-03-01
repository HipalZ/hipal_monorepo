"use client"
import type React from "react"
import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

interface TermsSection {
  title: string
  content: React.ReactNode
}

interface TermsAndConditionsProps {
  companyName: string
  services: string[]
  effectiveDate: string
  contactEmail: string
  websiteUrl: string
  customSections?: TermsSection[]
  onAccept?: () => void
}

export default function TermsAndConditions({
  companyName = "Hipalz",
  services = ["Hipalz", "Hi Clientz", "HiBiz"],
  effectiveDate = "11-12-2023",
  contactEmail = "info@paltribe.in",
  websiteUrl = "https://www.hipalz.in",
  customSections = [],
  onAccept = () => {},
}: TermsAndConditionsProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [accepted, setAccepted] = useState(false)

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }))
  }

  const defaultSections: TermsSection[] = [
    {
      title: "1. Definitions",
      content: (
        <div className="space-y-2">
          <p>
            1.1 Services: Refers to the access and use of the {companyName} platform, including {services.join(", ")}{" "}
            applications, along with any related and associated services.
          </p>
          <p>
            1.2 Client Data: Means any data, information, or material provided or submitted by the Client or its
            end-users in the course of using the Services.
          </p>
          <p>
            1.3 Third-Party Services: Refers to services provided by external providers integrated into the Company's
            platform, including but not limited to Razorpay and WhatsApp.
          </p>
        </div>
      ),
    },
    {
      title: "2. Acceptance of Terms",
      content: (
        <p>
          By using the Services, you acknowledge that you have read, understood, and agree to be bound by these Terms of
          Use and No Refund Policy. If you do not agree to these terms, you must not use the Services.
        </p>
      ),
    },
    {
      title: "3. Subscription Plans and Payment Terms",
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">3.1 Payment Terms:</h4>
            <ul className="pl-6 space-y-1 list-disc">
              <li>Payments are due in advance for the selected billing cycle.</li>
              <li>
                Accepted payment methods include bank transfer, credit/debit cards, and other methods as specified by
                the Company.
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium">3.3 No Refund Policy:</h4>
            <ul className="pl-6 space-y-1 list-disc">
              <li>All payments made for the Services are non-refundable.</li>
              <li>
                No refunds will be issued for any unused portion of the subscription, including in cases of early
                termination or cancellation by the Client.
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium">3.4 Late Payments:</h4>
            <ul className="pl-6 space-y-1 list-disc">
              <li>Late payments may result in suspension or termination of Services.</li>
              <li>The Company reserves the right to charge interest on overdue amounts as per applicable laws.</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: "4. Data Collection, Usage, and Privacy",
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">4.1 Data Collected:</h4>
            <p>
              The Company may collect, store, and use data, including personally identifiable information and financial
              particulars, to provide and improve the Services. For more details, please refer to our Data Collection,
              Usage, and Privacy Policy available at ({websiteUrl}/terms).
            </p>
          </div>

          <div>
            <h4 className="font-medium">4.2 Data Usage:</h4>
            <ul className="pl-6 space-y-1 list-disc">
              <li>To improve user experience (UX) and user interface (UI).</li>
              <li>To enhance platform engagement and develop combined intelligence.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium">4.3 Data Sharing:</h4>
            <ul className="pl-6 space-y-1 list-disc">
              <li>
                Client Data may be shared with Third-Party Services like Razorpay and WhatsApp during the use of their
                services.
              </li>
              <li>The Company does not sell Client Data or end-user information to third parties.</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: "5. Third-Party Services",
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">5.1 Razorpay Integration:</h4>
            <ul className="pl-6 space-y-1 list-disc">
              <li>Razorpay is integrated as the payment gateway service within the platform.</li>
              <li>
                Clients opting for payment gateway services will be required to sign a separate sub-agreement with
                Razorpay.
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium">5.2 Liability Disclaimer:</h4>
            <ul className="pl-6 space-y-1 list-disc">
              <li>
                The Company is not responsible for Razorpay's operational factors, including uptime, settlement terms,
                or transaction failures.
              </li>
              <li>All disputes related to payment processing must be addressed directly with Razorpay.</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: "6. Client Responsibilities",
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">6.1 Usage Guidelines:</h4>
            <ul className="pl-6 space-y-1 list-disc">
              <li>The Services must be used ethically and in accordance with applicable laws.</li>
              <li>The Services must not be used for fraudulent schemes or illegal activities.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium">6.2 Data Accuracy:</h4>
            <ul className="pl-6 space-y-1 list-disc">
              <li>The Client is responsible for the accuracy and legality of the data provided.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium">6.3 Prohibited Activities:</h4>
            <ul className="pl-6 space-y-1 list-disc">
              <li>The Services must not be used in a predatory manner or to harass, irritate, or spam customers.</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: "7. Limitations of Liability and Disclaimers",
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">7.1 Warranty Disclaimer:</h4>
            <ul className="pl-6 space-y-1 list-disc">
              <li>The Services are provided on an "as is" and "as available" basis.</li>
              <li>
                The Company disclaims all warranties, express or implied, including merchantability, fitness for a
                particular purpose, and non-infringement.
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium">7.2 Limitation of Liability:</h4>
            <ul className="pl-6 space-y-1 list-disc">
              <li>
                The Company's total liability under this Agreement shall not exceed the total amount paid by the Client
                in the twelve (12) months preceding the incident.
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: "8. Term and Termination",
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">8.1 Term:</h4>
            <ul className="pl-6 space-y-1 list-disc">
              <li>
                This Agreement commences on the Effective Date and continues for the duration of the selected
                subscription plan unless terminated earlier.
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium">8.2 Termination by Either Party:</h4>
            <ul className="pl-6 space-y-1 list-disc">
              <li>Either party may terminate this Agreement with thirty (30) days' written notice.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium">8.3 No Refunds Upon Termination:</h4>
            <ul className="pl-6 space-y-1 list-disc">
              <li>No refunds will be issued for the remaining billing cycle upon termination.</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: "9. Governing Law and Dispute Resolution",
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">9.1 Governing Law:</h4>
            <ul className="pl-6 space-y-1 list-disc">
              <li>This Agreement shall be governed by and construed in accordance with the laws of India.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium">9.2 Dispute Resolution:</h4>
            <ul className="pl-6 space-y-1 list-disc">
              <li>
                Any disputes arising out of this Agreement shall be subject to the exclusive jurisdiction of the courts
                located in Hyderabad, Telangana, India.
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: "10. Confidentiality and Intellectual Property",
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">10.1 Confidential Information:</h4>
            <ul className="pl-6 space-y-1 list-disc">
              <li>
                Both parties agree to keep confidential all proprietary information received from the other party.
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium">10.2 Intellectual Property Rights:</h4>
            <ul className="pl-6 space-y-1 list-disc">
              <li>
                The Company retains all rights, title, and interest in and to the Services, including all related
                intellectual property rights.
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: "11. Miscellaneous Terms",
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">11.1 Force Majeure:</h4>
            <ul className="pl-6 space-y-1 list-disc">
              <li>
                Neither party shall be liable for any failure or delay in performance due to causes beyond their
                reasonable control.
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium">11.2 Amendments:</h4>
            <ul className="pl-6 space-y-1 list-disc">
              <li>
                The Company reserves the right to modify this Agreement. Continued use of the Services constitutes
                acceptance of the amended terms.
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium">11.3 Entire Agreement:</h4>
            <ul className="pl-6 space-y-1 list-disc">
              <li>
                This Agreement constitutes the entire understanding between the parties and supersedes all prior
                agreements.
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: "12. Contact Information",
      content: (
        <div className="space-y-2">
          <p>
            For any questions or concerns regarding these Terms of Use or the No Refund Policy, please contact us at:
          </p>
          <p>
            Email:{" "}
            <a href={`mailto:${contactEmail}`} className="text-primary hover:underline">
              {contactEmail}
            </a>
          </p>
          <p>
            Website:{" "}
            <a href={websiteUrl} className="text-primary hover:underline">
              {websiteUrl}
            </a>
          </p>
        </div>
      ),
    },
  ]

  const allSections = [...defaultSections, ...customSections]

  return (
    <div className="container max-w-4xl pb-[100rem] px-4 py-8 mx-auto ">
      <Card className="shadow-lg">
        <CardHeader className="text-center border-b">
          <CardTitle className="text-2xl md:text-3xl">Terms of Use and No Refund Policy</CardTitle>
          <p className="text-muted-foreground">Effective Date: {effectiveDate}</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="prose max-w-none">
              <p>
                Welcome to the {companyName} platform, which includes {services.join(", ")} applications (collectively
                referred to as the "Services"). By accessing or using our Services, you agree to comply with and be
                bound by the following Terms of Use and No Refund Policy. Please read these terms carefully before using
                our Services.
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              {allSections.map((section, index) => (
                <div key={index} className="overflow-hidden border rounded-md">
                  <Button
                    onClick={() => toggleSection(`section-${index}`)}
                    className="flex items-center justify-between w-full p-4 font-medium text-left transition-colors bg-muted/30 hover:bg-muted/50"
                  >
                    {section.title}
                    {expandedSections[`section-${index}`] ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </Button>
                  {expandedSections[`section-${index}`] && (
                    <div className="p-4 prose max-w-none">{section.content}</div>
                  )}
                </div>
              ))}
            </div>

            <Separator />

            <div className="prose max-w-none">
              <p>
                By using the Services, you acknowledge that you have read, understood, and agree to these Terms of Use
                and No Refund Policy.
              </p>
              <p>
                IN WITNESS WHEREOF, the parties have executed this Agreement as of the Effective Date: {effectiveDate}.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

