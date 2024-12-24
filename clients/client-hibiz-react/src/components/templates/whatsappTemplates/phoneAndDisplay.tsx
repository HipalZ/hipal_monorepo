import { useWhatsappTempStore } from "@/components/store/useWhatsappTempStore";
import { cn } from "@/components/utils/helper";
import { lazy, memo, useCallback } from "react";

const FormField = lazy(() => import("./formField"));

function MemoPhoneAndDisplayStep() {
  const {
    termsAccepted,
    setTermsAccepted,
    displayNumber,
    displayName,
    facebookId,
    setFacebookId,
    setFacebookPassword,
    setDisplayName,
    setDisplayNumber,
  } = useWhatsappTempStore((s) => ({
    termsAccepted: s.termsAccepted,
    setTermsAccepted: s.setTermsAccepted,
    displayNumber: s.displayNumber,
    displayName: s.displayName,
    facebookId: s.facebookId,
    facebookPassword: s.facebookPassword,
    setFacebookId: s.setFacebookId,
    setFacebookPassword: s.setFacebookPassword,
    setDisplayNumber: s.setDisplayNumber,
    setDisplayName: s.setDisplayName,
  }));
  const fields = [
    {
      label: "Display Name",
      name: "displayName",
      value: displayName,
      placeholder: "Enter display name",
      required: true,
      maxLength: 16,
      note: "Display name once created takes much longer to change.",
    },
    {
      label: "Facebook Login ID",
      name: "facebookId",
      value: facebookId,
      placeholder: "Enter Facebook ID",
      required: false,
      maxLength: 100,
      note: "Link your Meta account. Make sure your personal Facebook account is linked with your business page account. If you're not sure, you can come back to this page later.",
    },
  ];

  const handleChange = useCallback(
    (id: string, value: string) => {
      const setters = {
        displayName: setDisplayName,
        displayNumber: setDisplayNumber,
        facebookId: setFacebookId,
        facebookPassword: setFacebookPassword,
      };
      const setFn = setters[id];
      if (setFn) setFn(value);
    },
    [setDisplayName, setDisplayNumber, setFacebookId, setFacebookPassword],
  );

  return (
    <section className="p-4">
      <h2 className="mb-2 text-xl font-semibold sm:text-2xl">
        Phone and display name verification
      </h2>
      <p className="mb-8 text-sm text-gray-600 sm:text-base">
        This will be your display name while we connect with your customers.
      </p>
      <div className="my-4">
        <label
          htmlFor="displayNumber"
          className="block mb-2 text-sm font-bold text-gray-700"
        >
          Phone Number <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2 mb-2">
          <select className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md">
            <option value="+91">🇮🇳 +91</option>
          </select>
          <input
            type="tel"
            id="displayNumber"
            name="displayNumber"
            value={displayNumber}
            onChange={(e) => handleChange("displayNumber", e.target.value)}
            required
            maxLength={10}
            pattern="[0-9]{10}"
            placeholder="Enter 10-digit number"
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md"
          />
        </div>
        <strong className="text-sm">
          Note: Provide a fresh number for starting your business account. If
          you want to use existing number then make sure to delete the existing
          account either in WhatsApp or WhatsApp Business.
        </strong>
      </div>
      {fields?.map(
        ({ label, name, value, placeholder, required, maxLength, note }) => (
          <FormField
            key={name}
            label={label}
            name={name}
            value={value}
            placeholder={placeholder}
            maxLength={maxLength}
            onChange={(e) => handleChange(name, e.target.value)}
            required={required}
            note={note}
          />
        ),
      )}
      <div className="mb-4">
        <strong className="block mb-2 text-sm">Privacy Policy</strong>
        <p className="mb-4 text-sm text-gray-600">
          The information you provided is kept confidential. This information is
          only used for linking your account and is kept secure.
        </p>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm">
            I have read and understood all the terms and conditions provided
            here.
          </span>
        </label>
      </div>
      <div className="p-4 space-y-4">
        <button
          type="submit"
          className={cn(
            displayNumber && displayName && termsAccepted ? "" : "opacity-50",
            "w-full px-6 py-3 font-medium text-white transition-colors rounded-md on_active_bounce whatzapp_gradient_background",
          )}
        >
          Pay & Proceed
        </button>
      </div>
    </section>
  );
}

const PhoneAndDisplayStep = memo(MemoPhoneAndDisplayStep);
export default PhoneAndDisplayStep;
