import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Bed, Clock, Mail, UtensilsCrossed } from "lucide-react"

/**
 * Public support page — the Support URL given to App Store Connect.
 *
 * Deliberately static and unauthenticated: Apple's reviewer loads this URL
 * without an account, and a page that redirects to a login is a rejection.
 * It lives under src/pages so vite-plugin-pages routes it at /support with no
 * guard, the same way terms&conditions.tsx is served.
 */

const SUPPORT_EMAIL = "support@paltribe.in"
const COMPANY = "Paltribe Solutions Private Limited"

const HOTEL_FAQS = [
  {
    q: "A new guest request is not appearing on my device",
    a: "Requests are delivered by push notification to the staff assigned to that floor and service. Check that notifications are allowed for HiClientZ in your device settings, that you are signed in to the correct property, and that your role covers the service in question. Your property administrator can confirm your floor and service assignments.",
  },
  {
    q: "A request escalated even though I accepted it",
    a: "Each request carries two separate windows: one to accept it and one to complete it. Accepting on time stops the first, but the request still escalates to a manager if it is not completed within the completion window. Both windows are configured per service by your administrator.",
  },
  {
    q: "Cleaning tasks did not appear after a checkout",
    a: "Checkout automation must be switched on for your property, and at least one service has to be selected in it. Until an administrator enables it and chooses the services, checking a guest out will not raise any turnover tasks.",
  },
  {
    q: "A room shows the wrong status",
    a: "Room status follows check-in, checkout and housekeeping completion. A room being cleaned continues to show as occupied until the turnover task is marked complete, so that it is never sold while work is outstanding.",
  },
]

const RESTAURANT_FAQS = [
  {
    q: "A table order is not reaching the kitchen",
    a: "Orders route to the kitchen only once a staff member accepts them. Check the order was accepted, and that the items are mapped to a kitchen. Your administrator configures which items print to which kitchen.",
  },
  {
    q: "I cannot settle a bill or free a table",
    a: "Billing and table actions are controlled per staff member. Raising a bill, settling normally, force-settling and freeing a table are separate permissions. Ask your administrator to review your role if an action is unavailable.",
  },
  {
    q: "A guest says their scanned order did not go through",
    a: "Guest orders arrive for acceptance rather than going straight to the kitchen, so a pending order is normal until someone accepts it. If nothing arrives at all, confirm the table is open and the table code the guest scanned matches it.",
  },
  {
    q: "Sales totals look wrong",
    a: "The sales summary covers the date range selected at the top of the screen and only includes settled bills. Open tables and unsettled bills are excluded until they are closed.",
  },
]

const GENERAL_FAQS = [
  {
    q: "How do I get an account?",
    a: `HiClientZ accounts are issued by your property administrator under your organisation's agreement with ${COMPANY}. There is no public sign-up. If you need access, contact your manager or administrator rather than us — they can create the account immediately.`,
  },
  {
    q: "I forgot my password",
    a: "Your property administrator can reset it for you from the management dashboard. For security we do not reset staff passwords by email.",
  },
  {
    q: "How do I delete my account or my data?",
    a: `Staff accounts belong to the property that issued them, so deletion is handled by your administrator. If you need an account or its data removed and cannot reach your administrator, write to ${SUPPORT_EMAIL} from your registered address and we will act on it with the property.`,
  },
  {
    q: "The app will not load",
    a: "HiClientZ needs an internet connection. If the screen stays blank, close the app fully and reopen it, then confirm the device is online. If it persists, send us the property name, your device model and iOS version.",
  },
]

function FaqGroup({ items }: { items: { q: string; a: string }[] }) {
  return (
    <Accordion type="single" collapsible className="w-full">
      {items.map((item) => (
        <AccordionItem key={item.q} value={item.q}>
          <AccordionTrigger className="text-left text-base font-medium">{item.q}</AccordionTrigger>
          <AccordionContent className="text-muted-foreground leading-relaxed">{item.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

export default function Support() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">HiClientZ Support</h1>
        <p className="text-muted-foreground mt-3 leading-relaxed">
          Help for hotel and restaurant teams using HiClientZ. If you cannot find an answer below, email us and a person
          will reply.
        </p>
      </header>

      <Card className="mb-10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Mail className="h-5 w-5" />
            Contact us
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-muted-foreground text-sm">Email</p>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-lg font-semibold underline underline-offset-4">
              {SUPPORT_EMAIL}
            </a>
          </div>
          <Separator />
          <div className="text-muted-foreground flex items-start gap-2 text-sm">
            <Clock className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              We reply within one business day, Monday to Saturday. For anything blocking service to a guest, put
              <span className="font-medium text-foreground"> URGENT </span>
              in the subject line.
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-sm leading-relaxed">
            <p className="mb-2 font-medium">To get a faster answer, tell us:</p>
            <ul className="text-muted-foreground list-inside list-disc space-y-1">
              <li>Your property name</li>
              <li>The room or table number involved</li>
              <li>What you expected to happen, and what happened instead</li>
              <li>Your device model and iOS or Android version</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <section className="mb-10">
        <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold">
          <Bed className="h-5 w-5" />
          Hotel operations
        </h2>
        <FaqGroup items={HOTEL_FAQS} />
      </section>

      <section className="mb-10">
        <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold">
          <UtensilsCrossed className="h-5 w-5" />
          Restaurant and orders
        </h2>
        <FaqGroup items={RESTAURANT_FAQS} />
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold">Accounts and access</h2>
        <FaqGroup items={GENERAL_FAQS} />
      </section>

      <Separator className="my-8" />

      <footer className="text-muted-foreground space-y-2 text-sm">
        <p className="font-medium text-foreground">{COMPANY}</p>
        <p>
          HiClientZ is provided to hospitality businesses under a commercial agreement. Staff accounts are issued by the
          property administrator.
        </p>
        <p>
          <a href="/terms&conditions" className="underline underline-offset-4">
            Terms &amp; Conditions
          </a>
        </p>
      </footer>
    </main>
  )
}
