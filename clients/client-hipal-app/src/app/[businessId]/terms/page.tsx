"use client";
import React, { memo } from "react";
import Image from "next/image";
import Logo from "@/assets/hipalNewLogo.svg";
import { isEmpty } from "lodash-es";
import { useRouter } from "next/navigation";
import { HiChevronLeft } from "react-icons/hi";
import { getRandomBlurImg } from "@/components/utils/images";
import PlaceholderImg from "@/components/atoms/placeholder";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import type { IBiz } from "@/components/types/businessData";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
const Terms = () => {
  const businessDetails = useBusinessDetails((s) => s.businessDetails);
  const router = useRouter();
  const onBack = () => {
    router.back();
  };
  return (
    <main className="p-6 text-white bg-black">
      <div className="relative">
        <HiChevronLeft className="mt-6 ml-2 text-3xl" onClick={onBack} />
      </div>
      <div className="flex items-center justify-center w-1/2 mx-auto mt-6 mb-12">
        {!isEmpty(businessDetails?.logoUrl) ? (
          <Image
            src={businessDetails?.logoUrl ? businessDetails?.logoUrl : Logo}
            height={100}
            width={100}
            quality={95}
            objectFit="contain"
            alt="logo-business"
            className="object-center w-1/3 border rounded-lg shadow-sm aspect-square"
            placeholder="blur"
            blurDataURL={getRandomBlurImg(100, 100)}
          />
        ) : (
          <PlaceholderImg />
        )}
      </div>
      <h1 className="heading">
        <b>
          <b>{businessDetails?.name}</b>
        </b>{" "}
        - Terms of Use
      </h1>
      <h3 className="subheading">1. Introduction</h3>
      <p className="paragraph">
        Welcome to{" "}
        <b>
          <b>{businessDetails?.name}</b>
        </b>{" "}
        a brand of <b>{businessDetails?.registeredName}</b> , a service powered
        by Hipalz technology provided by Paltribe Solutions Pvt Ltd. These terms
        govern your use of our services, which include digital menu displays,
        customer data collection, discounts, loyalty programs, user preference
        management, and bill settlements. Our offerings extend to food delivery,
        consultation, and sales of consumable products
      </p>
      <h3 className="subheading">2. Acceptance of Terms</h3>
      <p className="paragraph">
        By accessing or using our services, you agree to these terms. If you do
        not agree, please refrain from using our services.
      </p>
      <h3 className="subheading">3. Modification of Terms</h3>
      <p className="paragraph">
        We reserve the right to modify these terms at any time. Changes will
        become effective immediately upon their posting on our website. Your
        continued use of our services after any such changes are posted will be
        considered acceptance of those changes. If you continue to use the
        services for more than seven days after the posting of modified terms,
        you are agreeing, by default, to be bound by the modifications.
      </p>
      <h3 className="subheading">4. Description of Services</h3>
      <p className="paragraph">
        We use technology to enhance service delivery and customer interaction.
        All services are provided "as is" without warranties.
      </p>
      <h3 className="subheading">5. User Responsibilities</h3>
      <p className="paragraph">
        Users are responsible for the accuracy of their data and maintaining the
        confidentiality of their account information. Users are liable for all
        activities under their accounts.
      </p>
      <h3 className="subheading">6. Payments and Financial Transactions</h3>
      <p className="paragraph">
        <b>{businessDetails?.name}</b> uses Hipalz to facilitate transactions.{" "}
        <b>{businessDetails?.name}</b> is responsible for all financial service
        issues, including disputes and billing inaccuracies.
      </p>
      <h3 className="subheading">7. Service Fulfillment</h3>
      <p className="paragraph">
        While Hipalz provides the technology, <b>{businessDetails?.name}</b>{" "}
        manages all direct services related to food, products, and
        consultations. Any issues should be directly addressed by{" "}
        <b>{businessDetails?.name}</b>
      </p>
      <h3 className="subheading">8. Data Usage and Privacy</h3>
      <p className="paragraph">
        <b>{businessDetails?.name}</b> and Hipalz collect and use personal
        information (name, contact details, DOB, and more) to enhance user
        experience, provide personalized services, and for marketing. By using
        our services, you consent to the collection and use of your data as
        described.
      </p>
      <h3 className="subheading">9. User Consent for Data Sharing</h3>
      <p className="paragraph">
        Your personal information may be shared between{" "}
        <b>{businessDetails?.name}</b> and Hipalz to improve services and offer
        personalized promotions. We commit to protecting your privacy and using
        information only as stated.
      </p>
      <h3 className="subheading">10. Contact Information</h3>
      <p className="paragraph">
        <ol className="unorderedlist">
          For questions or concerns related to <b>{businessDetails?.name}</b>{" "}
          services, please approach us at the following contact points:
          <br />
          <li>
            Company Name: <b>{businessDetails?.registeredName}</b>
          </li>
          <li>
            Brand Name: <b>{businessDetails?.name}</b>
          </li>
          <li>Phone Number: {businessDetails?.phone}</li>
          {businessDetails?.email ? (
            <li>Email : {businessDetails?.email}</li>
          ) : null}
          <li>Address: {businessDetails?.address}</li>
        </ol>
      </p>
      <h1 className="heading">HiPalz - Terms of Use</h1>
      <h3 className="subheading">1. Introduction</h3>
      <p className="paragraph">
        Hipalz, a service by Paltribe Solutions Pvt Ltd, supports businesses in
        the FOOD, FASHION, and FITNESS sectors with digital solutions for menus,
        payments, and customer engagement.
      </p>
      <h3 className="subheading">2. Acceptance of Terms</h3>
      <p className="paragraph">
        By using Hipalz, you accept these terms of use
      </p>
      <h3 className="subheading">3. Methods of Terms</h3>
      <p className="paragraph">
        We reserve the right to change these terms at any time, with continued
        use post-change constituting acceptance
      </p>
      <h3 className="subheading">4. Technology Services Description</h3>
      <p className="paragraph">
        Hipalz provides technology that supports digital interactions between
        businesses and their customers, including menu management, transaction
        processing, and loyalty programs. All services are provided "as is."
      </p>
      <h3 className="subheading">5. Role Clarification</h3>
      <p className="paragraph">
        Hipalz is solely a technology provider and does not participate in the
        direct delivery of food, fashion, or fitness services. Information
        accuracy, product quality, and service delivery are the responsibilities
        of the partner businesses.
      </p>
      <h3 className="subheading">6. Data Handling and Usage</h3>
      <p className="paragraph">
        Hipalz processes user data to facilitate service improvements, marketing
        efforts, and enhanced user experiences. Your data may be shared with
        partnered businesses under strict privacy controls.
      </p>
      <h4 className="subheading">Tracking Technologies and Cookies</h4>
      <p className="paragraph">
        We use Cookies and similar tracking technologies to track the activity
        on Our Service and store certain information. Tracking technologies used
        are beacons, tags, and scripts to collect and track information and to
        improve and analyze Our Service. The technologies We use may include:
      </p>
      <ul>
        <li>
          Cookies or Browser Cookies. A cookie is a small file placed on Your
          Device. You can instruct Your browser to refuse all Cookies or to
          indicate when a Cookie is being sent. However, if You do not accept
          Cookies, You may not be able to use some parts of our Service. Unless
          you have adjusted Your browser setting so that it will refuse Cookies,
          our Service may use Cookies.
        </li>
        <li>
          Web Beacons. Certain sections of our Service and our emails may
          contain small electronic files known as web beacons (also referred to
          as clear gifs, pixel tags, and single-pixel gifs) that permit the
          Company, for example, to count users who have visited those pages or
          opened an email and for other related website statistics (for example,
          recording the popularity of a certain section and verifying system and
          server integrity).
        </li>
      </ul>
      <p className="paragraph">
        Cookies can be &quot;Persistent&quot; or &quot;Session&quot; Cookies.
        Persistent Cookies remain on Your personal computer or mobile device
        when You go offline, while Session Cookies are deleted as soon as You
        close Your web browser.
      </p>
      <p className="paragraph">
        We use both Session and Persistent Cookies for the purposes set out
        below:
      </p>
      <ul>
        <li>
          Necessary / Essential Cookies Type: Session Cookies Administered by:
          Us Purpose: These Cookies are essential to provide You with services
          available through the Website and to enable You to use some of its
          features. They help to authenticate users and prevent fraudulent use
          of user accounts. Without these Cookies, the services that You have
          asked for cannot be provided, and We only use these Cookies to provide
          You with those services.
        </li>
        <li>
          Cookies Policy / Notice Acceptance Cookies Type: Persistent Cookies
          Administered by: Us Purpose: These Cookies identify if users have
          accepted the use of cookies on the Website.
        </li>
        <li>
          Functionality Cookies Type: Persistent Cookies Administered by: Us
          Purpose: These Cookies allow us to remember choices You make when You
          use the Website, such as remembering your login details or language
          preference. The purpose of these Cookies is to provide You with a more
          personal experience and to avoid You having to re-enter your
          preferences every time You use the Website.
        </li>
      </ul>
      <p className="paragraph">
        For more information about the cookies we use and your choices regarding
        cookies, please visit our Cookies Policy or the Cookies section of our
        Privacy Policy.
      </p>
      <h1 className="heading">Use of Your Personal Data</h1>
      <p className="paragraph">
        The Company may use Personal Data for the following purposes:
      </p>
      <ul>
        <li>
          To provide and maintain our Service, including to monitor the usage of
          our Service.
        </li>
        <li>
          To manage Your Account: to manage Your registration as a user of the
          Service. The Personal Data You provide can give You access to
          different functionalities of the Service that are available to You as
          a registered user.
        </li>
        <li>
          For the performance of a contract: the development, compliance and
          undertaking of the purchase contract for the products, items or
          services You have purchased or of any other contract with Us through
          the Service.
        </li>
        <li>
          To contact You: To contact You by email, telephone calls, SMS, or
          other equivalent forms of electronic communication, such as a mobile
          application&apos;s push notifications regarding updates or informative
          communications related to the functionalities, products or contracted
          services, including the security updates, when necessary or reasonable
          for their implementation.
        </li>
        <li>
          To provide You with news, special offers and general information about
          other goods, services and events which we offer that are similar to
          those that you have already purchased or enquired about unless You
          have opted not to receive such information.
        </li>
        <li>
          To manage Your requests: To attend and manage Your requests to Us.
        </li>
        <li>
          For business transfers: We may use Your information to evaluate or
          conduct a merger, divestiture, restructuring, reorganization,
          dissolution, or other sale or transfer of some or all of Our assets,
          whether as a going concern or as part of bankruptcy, liquidation, or
          similar proceeding, in which Personal Data held by Us about our
          Service users is among the assets transferred.
        </li>
        <li>
          For other purposes: We may use Your information for other purposes,
          such as data analysis, identifying usage trends, determining the
          effectiveness of our promotional campaigns and to evaluate and improve
          our Service, products, services, marketing and your experience.
        </li>
      </ul>
      <p className="paragraph">
        We may share Your personal information in the following situations:
      </p>
      <ul>
        <li>
          With Service Providers: We may share Your personal information with
          Service Providers to monitor and analyze the use of our Service, to
          contact You.
        </li>
        <li>
          For business transfers: We may share or transfer Your personal
          information in connection with, or during negotiations of, any merger,
          sale of Company assets, financing, or acquisition of all or a portion
          of Our business to another company.
        </li>
        <li>
          With Affiliates: We may share Your information with Our affiliates, in
          which case we will require those affiliates to honor this Privacy
          Policy. Affiliates include Our parent company and any other
          subsidiaries, joint venture partners or other companies that We
          control or that are under common control with Us.
        </li>
        <li>
          With business partners: We may share Your information with Our
          business partners to offer You certain products, services or
          promotions.
        </li>
        <li>
          With other users: when You share personal information or otherwise
          interact in the public areas with other users, such information may be
          viewed by all users and may be publicly distributed outside.
        </li>
        <li>
          With Your consent: We may disclose Your personal information for any
          other purpose with Your consent.
        </li>
      </ul>
      <h1 className="heading">Retention of Your Personal Data</h1>
      <p className="paragraph">
        The Company will retain Your Personal Data only for as long as is
        necessary for the purposes set out in this Privacy Policy. We will
        retain and use Your Personal Data to the extent necessary to comply with
        our legal obligations (for example, if we are required to retain your
        data to comply with applicable laws), resolve disputes, and enforce our
        legal agreements and policies. The Company will also retain Usage Data
        for internal analysis purposes. Usage Data is generally retained for a
        shorter period of time, except when this data is used to strengthen the
        security or to improve the functionality of Our Service, or We are
        legally obligated to retain this data for longer time periods.
      </p>
      <h1 className="heading">Transfer of Your Personal Data</h1>
      <p className="paragraph">
        Your information, including Personal Data, is processed at the
        Company&apos;s operating offices and in any other places where the
        parties involved in the processing are located. It means that this
        information may be transferred to — and maintained on — computers
        located outside of Your state, province, country or other governmental
        jurisdiction where the data protection laws may differ than those from
        Your jurisdiction. Your consent to this Privacy Policy followed by Your
        submission of such information represents Your agreement to that
        transfer. The Company will take all steps reasonably necessary to ensure
        that Your data is treated securely and in accordance with this Privacy
        Policy and no transfer of Your Personal Data will take place to an
        organization or a country unless there are adequate controls in place
        including the security of Your data and other personal information.
      </p>
      <h1 className="heading">Disclosure of Your Personal Data</h1>
      <h3 className="subheading">Business Transactions</h3>
      <p className="paragraph">
        If the Company is involved in a merger, acquisition or asset sale, Your
        Personal Data may be transferred. We will provide notice before Your
        Personal Data is transferred and becomes subject to a different Privacy
        Policy.
      </p>
      <h3 className="subheading">Law enforcement</h3>
      <p className="paragraph">
        Under certain circumstances, the Company may be required to disclose
        Your Personal Data if required to do so by law or in response to valid
        requests by public authorities (e.g. a court or a government agency).
      </p>
      <h3 className="subheading">Other legal requirements</h3>
      <p className="paragraph">
        The Company may disclose Your Personal Data in the good faith belief
        that such action is necessary to:
      </p>
      <ul>
        <li>Comply with a legal obligation</li>
        <li>Protect and defend the rights or property of the Company</li>
        <li>
          Prevent or investigate possible wrongdoing in connection with the
          Service
        </li>
        <li>
          Protect the personal safety of Users of the Service or the public
        </li>
        <li>Protect against legal liability</li>
      </ul>
      <h1 className="heading">Security of Your Personal Data</h1>
      <p className="paragraph">
        The security of Your Personal Data is important to Us, but remember that
        no method of transmission over the Internet, or method of electronic
        storage is 100% secure. While We strive to use commercially acceptable
        means to protect Your Personal Data, We cannot guarantee its absolute
        security.
      </p>
      <h1 className="heading">Children&apos;s Privacy</h1>
      <p className="paragraph">
        Our Service does not address anyone under the age of 13. We do not
        knowingly collect personally identifiable information from anyone under
        the age of 13. If You are a parent or guardian and You are aware that
        Your child has provided Us with Personal Data, please contact Us. If We
        become aware that We have collected Personal Data from anyone under the
        age of 13 without verification of parental consent, We take steps to
        remove that information from Our servers. If We need to rely on consent
        as a legal basis for processing Your information and Your country
        requires consent from a parent, We may require Your parent&apos;s
        consent before We collect and use that information.
      </p>
      <h1 className="heading">Changes to this Privacy Policy</h1>
      <p className="paragraph">
        We may update Our Privacy Policy from time to time. We will notify You
        of any changes by posting the new Privacy Policy on this page. We will
        let You know via email and/or a prominent notice on Our Service, prior
        to the change becoming effective and update the Last &quot;updated&quot;
        date at the top of this Privacy Policy. You are advised to review this
        Privacy Policy periodically for any changes. Changes to this Privacy
        Policy are effective when they are posted on this page.
      </p>
      <h1 className="heading">Refund Policy</h1>
      <p className="paragraph">
        <b>{businessDetails?.name}</b> is committed to ensuring satisfaction for
        all our customers. If you are not satisfied with a purchase or service
        provided by <b>{businessDetails?.name}</b> and we find your point fair
        and acceptable, here are the terms applicable to refunds: Products and
        Services: Eligible for a refund if a cancellation request is made within
        the time of interaction or exchange of the purchase or if there are
        significant discrepancies in the service delivered or product received.
        Cancellation: Orders can be canceled within a specified time frame,
        typically before the service provision starts or product dispatch.
        Refunds for canceled orders will be processed within 7-10 business days.
        Issues and Disputes: Any issues or discrepancies related to payments,
        product quality, or service delivery must be reported to{" "}
        <b>{businessDetails?.name}</b> as soon as possible, wherein if the
        product or service was consumed within store /outlet should reported
        immediately for other take home service it can be within 48 hours of the
        transaction or service delivery date. Processing Refunds: Refunds will
        be processed using the original method of payment. If a refund is
        issued, it will typically appear on your account statement within 7-10
        business days. Please note that certain conditions and exceptions may
        apply. For specific details related to refund eligibility and process,
        please contact our customer service team mentioned in the contact us
        form
      </p>
      <h1 className="heading">Contact Paltribe Solutions Pvt</h1>
      <p className="paragraph">
        If you have any questions about this Privacy Policy, You can contact us:
      </p>
      <h3 className="subheading">7. Contact Information</h3>
      <p className="paragraph">
        <ol className="unorderedlist">
          For support related to Hipalz technology, contact
          <li>
            Company Name: <b>Paltribe Solutions Pvt Ltd</b>
          </li>
          <li>
            Brand Name: <b>Hipalz</b>
          </li>
          <li>By email: info@paltribe.in</li>
          <li>
            Phone Number: <b>7386142525</b>
          </li>
          <li>
            Address: 929, 2nd floor, Sudheekshas, Defence Colony Rd, Hill Top
            Colony, Sainikpuri, Secunderabad, Hyderabad, Telangana 500056
          </li>
        </ol>
      </p>
      &nbsp; &nbsp;
    </main>
  );
};

const MemoTerms = memo(Terms);
export default MemoTerms;
