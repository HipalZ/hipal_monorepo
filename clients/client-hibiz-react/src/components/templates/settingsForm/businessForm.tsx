import useBusinessData from '@/components/store/useBusinessData';
import { useBusinessFormStore } from '@/components/store/useOutlet';
import { apiRpc } from '@hi/common';
import * as React from 'react';
import { memo, useCallback, useEffect, useRef, type FormEvent } from 'react';
import toast from 'react-hot-toast';

// Define the form references type
type FormRefs = {
  [key: string]: HTMLInputElement | HTMLSelectElement | null;
};

const MemoBusinessForm: React.FC = () => {
  // Retrieve business form data from the store
  const businessFormData = useBusinessFormStore((s) => s.businessFormData);

  // Retrieve business data
  const businessData = useBusinessData((s) => s.businessData);

  // Create form references
  const formRefs = useRef<FormRefs>({
    registeredBusinessName: null,
    registrationType: null,
    businessType: null,
    establishmentYear: null,
    companyPan: null,
    gstNumber: null,
    gstYesNo: null,
    accountNumber: null,
    beneficiaryName: null,
    ifscCode: null,
    businessEmail: null,
    businessContact: null,
    authSignatoryName: null,
    contactPanCard: null,
    merchantId: null,
    accessKeyId: null,
    secretKey: null,
    notificationSound: null,
    _id: null,
  });

  // Set form references dynamically
  const setRef = useCallback(
    (key: keyof FormRefs) => (el: any) => {
      formRefs.current[key] = el;
    },
    [],
  );

  // Update form values based on businessFormData changes
  useEffect(() => {
    for (const key of Object.keys(formRefs.current)) {
      if (formRefs.current[key] && businessFormData[key as keyof typeof businessFormData]) {
        (formRefs.current[key] as HTMLInputElement).value = businessFormData[key as keyof typeof businessFormData] || '';
      }
    }
  }, [businessFormData]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      const formData = Object.keys(formRefs.current).reduce(
        (acc, key) => {
          if (formRefs.current[key]) {
            acc[key] = (formRefs.current[key] as HTMLInputElement).value;
          }
          return acc;
        },
        {} as { [key: string]: string },
      );

      const filteredFormData = Object.fromEntries(Object.entries(formData).filter(([_, value]) => value !== ''));

      let res;

      try {
        if (businessFormData._id) {
          res = await apiRpc.settings.update[':settingsId'].$put({
            param: {
              settingsId: businessFormData._id,
            },
            json: filteredFormData,
          });
        } else {
          res = await apiRpc.settings.$post({
            json: {
              businessId: businessData?._id.toString() || '',
              ...filteredFormData,
            },
          });
        }

        if (res.status === 200 || res.status === 201) {
          toast.success('Form submitted successfully');
        } else {
          toast.error('Failed to submit form');
        }
      } catch (error) {
        toast.error('Error submitting form');
        console.error('Error submitting form:', error);
      }
    },
    [businessFormData, businessData],
  );

  // JSX rendering for the form
  return (
    <section>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 pb-[5rem] md:grid-cols-2">
        <FormSection title="Basics">
          <TextInput ref={setRef('registerName')} id="registeredBusinessName" label="Registered Business Name" maxLength={30} />
          <SelectInput
            ref={setRef('registerType')}
            id="registrationType"
            label="Registration Type"
            options={['LLP', 'PVT LTD', 'PUBLIC LTD', 'SOLE PROPRIETORSHIP', 'PARTNERSHIP', 'OTHER']}
          />
          <SelectInput
            ref={setRef('businessType')}
            id="businessType"
            label="Business Type"
            options={['FOOD', 'FASHION', 'FITNESS', 'TRAVEL', 'OTHERS']}
          />
        </FormSection>

        <FormSection title="Company">
          <TextInput ref={setRef('establishmentYear')} id="establishmentYear" label="Establishment Year" maxLength={10} />
          <TextInput ref={setRef('panNumber')} id="companyPan" label="Company PAN" maxLength={10} />
          <TextInput ref={setRef('gstNumber')} id="gstNumber" label="GST Number" maxLength={15} />
        </FormSection>

        <FormSection title="Banking Details">
          <TextInput ref={setRef('accountNumber')} id="accountNumber" label="Account Number" maxLength={20} />
          <TextInput ref={setRef('beneficiaryName')} id="beneficiaryName" label="Beneficiary Name" maxLength={20} />
          <TextInput ref={setRef('ifscCode')} id="ifscCode" label="Branch IFSC Code" maxLength={11} />
        </FormSection>

        {/* <FormSection title="Contact">
          <TextInput ref={setRef("businessEmail")} id="businessEmail" label="Business Email" />
          <TextInput ref={setRef("businessContact")} id="businessContact" label="Business Contact Number" />
        </FormSection> */}

        {/* <FormSection title="Authentication">
          <TextInput ref={setRef("authSignatoryName")} id="authSignatoryName" label="Auth Signatory Name" />
          <TextInput ref={setRef("contactPanCard")} id="contactPanCard" label="Contact PAN Card Person" />
        </FormSection> */}

        <FormSection title="Credentials">
          <TextInput ref={setRef('razorpayMerchantId')} id="merchantId" label="Merchant ID" maxLength={35} />
          <TextInput ref={setRef('razorpayKeyId')} id="accessKeyId" label="Access Key ID" maxLength={35} />
          <TextInput ref={setRef('razorpayKeySecret')} id="secretKey" label="Secret Key" maxLength={35} />
        </FormSection>

        <FormSection title="Alert Sound">
          <SelectInput
            ref={setRef('notificationSound')}
            id="notificationSound"
            label="Notification Sound"
            options={[
              { value: 'order', label: 'Order alert' },
              { value: 'alarm', label: 'Alarm alert' },
            ]}
          />
          <p className="text-xs text-gray-500">This sound will be used in the Hitable app for staff alerts.</p>
        </FormSection>

        <button className="bottom_btn col-span-1 md:col-span-2" type="submit">
          Save
        </button>
      </form>
    </section>
  );
};

// Memoize the component for performance optimization
const BusinessForm = memo(MemoBusinessForm);
export default BusinessForm;

// Helper components for form sections and inputs
const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mx-4 mt-6 space-y-2">
    <h3>{title}</h3>
    <section className="space-y-4 rounded-xl bg-white p-4">{children}</section>
  </section>
);

const TextInput = React.forwardRef<HTMLInputElement, { id: string; label: string; maxLength: number }>(({ id, label, maxLength }, ref) => (
  <div className="relative">
    <input
      type="text"
      ref={ref}
      id={id}
      maxLength={maxLength}
      className="peer mb-0 block w-full rounded-lg border border-black bg-white pb-4 pl-4 pr-4 pt-2 text-base focus:border-black focus:outline-none dark:border-gray-600 dark:text-white"
    />
    <label
      htmlFor={id}
      className="scale-85 peer-focus:scale-85 absolute left-1 top-2 z-0 -translate-y-4 transform bg-white px-2 text-sm text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:px-2 peer-focus:text-black dark:bg-gray-900 dark:text-gray-400 peer-focus:dark:text-black"
    >
      {label}
    </label>
  </div>
));

const SelectInput = React.forwardRef<HTMLSelectElement, { id: string; label: string; options: Array<string | { value: string; label: string }> }>(
  ({ id, label, options }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        id={id}
        className="peer mb-0 block w-full rounded-lg border border-black bg-white pb-4 pl-4 pr-4 pt-2 text-base focus:border-black focus:outline-none dark:border-gray-600 dark:text-white"
      >
        {options.map((option) => {
          const value = typeof option === 'string' ? option : option.value;
          const optionLabel = typeof option === 'string' ? option : option.label;

          return (
            <option key={value} value={value}>
              {optionLabel}
            </option>
          );
        })}
      </select>
      <label
        htmlFor={id}
        className="scale-85 peer-focus:scale-85 absolute left-1 top-2 z-0 -translate-y-4 transform bg-white px-2 text-sm text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:px-2 peer-focus:text-black dark:bg-gray-900 dark:text-gray-400 peer-focus:dark:text-black"
      >
        {label}
      </label>
    </div>
  ),
);
