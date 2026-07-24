import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ShieldCheck } from "lucide-react"

/**
 * Public privacy policy — the Privacy Policy URL given to App Store Connect.
 *
 * Static and unauthenticated for the same reason as support.tsx: Apple loads
 * it cold, and a redirect to /login is a rejection. Registered in PUBLIC_PATHS
 * in molecules/boundary, without which the guard bounces a signed-out visitor.
 */

const SUPPORT_EMAIL = "support@paltribe.in"
const COMPANY = "Paltribe Solutions Private Limited"
const EFFECTIVE = "24 July 2026"

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-xl font-semibold">{title}</h2>
      <div className="text-muted-foreground space-y-3 leading-relaxed">{children}</div>
    </section>
  )
}

export default function Privacy() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Privacy Policy</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          HiClientZ · Effective {EFFECTIVE} · {COMPANY}
        </p>
      </header>

      <Card className="mb-10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShieldCheck className="h-5 w-5" />
            In short
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-2 text-sm leading-relaxed">
          <p>HiClientZ is a workplace tool used by hotel and restaurant staff. It is not a consumer app.</p>
          <p>We do not sell your data, we do not use it for advertising, and we do not track you across other apps or websites.</p>
          <p>Everything we hold exists to run the property that issued your account.</p>
        </CardContent>
      </Card>

      <Section title="1. Who we are">
        <p>
          HiClientZ is operated by {COMPANY} ("we", "us"). We provide the app to hospitality businesses under a
          commercial agreement. The business that issued your account — the hotel or restaurant you work for — decides
          what is recorded in it and is the controller of that information. We process it on their behalf.
        </p>
      </Section>

      <Section title="2. Information we collect">
        <p className="text-foreground font-medium">Staff account information</p>
        <p>
          Your name, phone number, email address where provided, encrypted password, job role and the properties,
          floors and services you are assigned to. This is created by your property administrator, not by you.
        </p>

        <p className="text-foreground font-medium">Device and notification data</p>
        <p>
          A push notification token for each device you sign in on, together with the app version and whether
          notifications are enabled. This is how a request reaches the right person rather than everyone.
        </p>

        <p className="text-foreground font-medium">Operational records</p>
        <p>
          Guest requests, room and table activity, orders, bills, housekeeping tasks and the timestamps attached to
          them — including which staff member accepted and completed each job. These records are how the property
          measures its own service.
        </p>

        <p className="text-foreground font-medium">Guest details entered by staff</p>
        <p>
          A guest's name and contact number may be recorded against a room or a request so the right person is served.
          This is entered by the property, and the property is responsible for the guest relationship.
        </p>

        <p className="text-foreground font-medium">Photographs</p>
        <p>
          Where a property enables it, staff may attach a photograph of completed work to a task. Images are uploaded
          to our storage and attached to that record. The app requests camera and photo library access only at the
          moment you choose to attach one.
        </p>
      </Section>

      <Section title="3. What we do not collect">
        <p>
          We do not use advertising identifiers, analytics SDKs or any third-party tracking technology in this app. We
          do not build advertising profiles, and we do not track you across other companies' apps or websites. We do
          not collect your location in the background. We never see your card details.
        </p>
      </Section>

      <Section title="4. Why we use it">
        <p>
          Solely to operate the service: authenticating you, routing requests and orders to the correct staff, sending
          the notifications that make that work, producing the property's own performance reports, supporting you when
          you contact us, and meeting our legal and security obligations.
        </p>
      </Section>

      <Section title="5. Who we share it with">
        <p>
          We do not sell personal information. We share it only with service providers that make the product work, and
          only to the extent required:
        </p>
        <ul className="list-inside list-disc space-y-1">
          <li>Google Firebase Cloud Messaging — delivery of push notifications</li>
          <li>Our cloud hosting and database providers — storage and operation of the service</li>
          <li>WhatsApp Business Platform — where a property enables WhatsApp notifications</li>
          <li>Payment processors — where a property takes payment; card details are handled by the processor, not by us</li>
        </ul>
        <p>We may also disclose information where required by law, or to protect the safety and rights of users.</p>
      </Section>

      <Section title="6. How long we keep it">
        <p>
          Operational records are retained for as long as the property's agreement with us is active, because those
          records are the property's own service history. When an agreement ends, data is deleted or returned on
          request. Push notification tokens are removed when you sign out or the token expires.
        </p>
      </Section>

      <Section title="7. Your choices and rights">
        <p>
          You may turn off push notifications at any time in your device settings; the app continues to work, but new
          requests will not alert you. Camera and photo access can be revoked the same way.
        </p>
        <p>
          Because accounts are issued by your employer, requests to access, correct or delete an account are handled by
          your property administrator, who can action them immediately. If you cannot reach them, write to us at{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-foreground underline underline-offset-4">
            {SUPPORT_EMAIL}
          </a>{" "}
          from your registered address and we will work with the property to resolve it. Depending on where you live you
          may also have rights to object to or restrict processing, or to data portability.
        </p>
      </Section>

      <Section title="8. Security">
        <p>
          Traffic between the app and our servers is encrypted in transit using HTTPS. Passwords are stored hashed, never
          in readable form. Access to production data is limited to staff who need it. No system is perfectly secure, but
          we take reasonable and appropriate measures to protect what we hold.
        </p>
      </Section>

      <Section title="9. Children">
        <p>
          HiClientZ is a workplace tool intended for adults in employment. It is not directed at children and we do not
          knowingly collect information from anyone under 16.
        </p>
      </Section>

      <Section title="10. Changes">
        <p>
          If we change this policy we will update the effective date above and, where the change is significant, notify
          the properties that use the service.
        </p>
      </Section>

      <Separator className="my-8" />

      <footer className="text-muted-foreground space-y-2 text-sm">
        <p className="text-foreground font-medium">{COMPANY}</p>
        <p>
          Questions about this policy:{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="underline underline-offset-4">
            {SUPPORT_EMAIL}
          </a>
        </p>
        <p className="flex gap-4">
          <a href="/support" className="underline underline-offset-4">
            Support
          </a>
          <a href="/terms&conditions" className="underline underline-offset-4">
            Terms &amp; Conditions
          </a>
        </p>
      </footer>
    </main>
  )
}
