import { useCallback, useRef, type FormEvent, memo } from "react";

interface FormRefs {
  registeredBusinessName: HTMLInputElement | null;
  registrationType: HTMLSelectElement | null;
  businessType: HTMLSelectElement | null;
  establishmentYear: HTMLInputElement | null;
  companyPan: HTMLInputElement | null;
  gstNumber: HTMLInputElement | null;
  gstYesNo: HTMLSelectElement | null;
  accountNumber: HTMLInputElement | null;
  beneficiaryName: HTMLInputElement | null;
  ifscCode: HTMLInputElement | null;
  businessEmail: HTMLInputElement | null;
  businessContact: HTMLInputElement | null;
  authSignatoryName: HTMLInputElement | null;
  contactPanCard: HTMLInputElement | null;
  merchantId: HTMLInputElement | null;
  accessKeyId: HTMLInputElement | null;
  secretKey: HTMLInputElement | null;
}

const MemoBusinessForm: React.FC = () => {
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
  });

  const setRef = useCallback((key: keyof FormRefs) => (el: any) => {
    formRefs.current[key] = el;
  }, []);

  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    const currentRefs = formRefs.current;
    console.log("Registered Business Name:", currentRefs.registeredBusinessName?.value);
    console.log("Registration Type:", currentRefs.registrationType?.value);
    console.log("Business Type:", currentRefs.businessType?.value);
    console.log("Establishment Year:", currentRefs.establishmentYear?.value);
    console.log("Company PAN:", currentRefs.companyPan?.value);
    console.log("GST Number:", currentRefs.gstNumber?.value);
    console.log("Do you have GST:", currentRefs.gstYesNo?.value);
    console.log("Account Number:", currentRefs.accountNumber?.value);
    console.log("Beneficiary Name:", currentRefs.beneficiaryName?.value);
    console.log("IFSC Code:", currentRefs.ifscCode?.value);
    console.log("Business Email:", currentRefs.businessEmail?.value);
    console.log("Business Contact Number:", currentRefs.businessContact?.value);
    console.log("Auth Signatory Name:", currentRefs.authSignatoryName?.value);
    console.log("Contact PAN Card Person:", currentRefs.contactPanCard?.value);
    console.log("Merchant ID:", currentRefs.merchantId?.value);
    console.log("Access Key ID:", currentRefs.accessKeyId?.value);
    console.log("Secret Key:", currentRefs.secretKey?.value);
  }, []);

  return (
    <section>
        <form onSubmit={handleSubmit} className="pb-[5rem] grid grid-cols-1 md:grid-cols-2 gap-4">
          <section className="mx-4 mt-6 space-y-2">
            <h2>Basics</h2>
            <section className="p-4 space-y-4 bg-white rounded-xl">
              <div className="relative">
                <input
                  type="text"
                  ref={setRef("registeredBusinessName")}
                  id="registeredBusinessName"
                  className="block w-full pt-2 pb-4 pl-4 pr-4 mb-0 text-base border border-gray-800 rounded-lg bg-base-100 dark:text-base-100 focus:outline-none focus:border-primary dark:border-gray-600 peer"
                  placeholder=" "
                  required
                />
                <label
                  htmlFor="registeredBusinessName"
                  className="absolute z-10 px-2 text-sm text-gray-500 duration-300 transform scale-75 -translate-y-4 dark:text-gray-400 top-2 bg-base-100 dark:bg-gray-900 peer-focus:px-2 peer-focus:text-primary peer-focus:dark:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                >
                  Registered Business Name
                </label>
              </div>
              <div className="relative">
                <select
                  ref={setRef("registrationType")}
                  id="registrationType"
                  className="block w-full pt-2 pb-4 pl-4 pr-4 mb-0 text-base border border-gray-800 rounded-lg bg-base-100 dark:text-base-100 focus:outline-none focus:border-primary dark:border-gray-600 peer"
                  required
                >
                  <option value="Proprietorship">Proprietorship</option>
                  <option value="Partnership Deed">Partnership Deed</option>
                  <option value="LLP">LLP</option>
                  <option value="Pvt">Pvt</option>
                </select>
                <label
                  htmlFor="registrationType"
                  className="absolute z-10 px-2 text-sm text-gray-500 duration-300 transform scale-75 -translate-y-4 dark:text-gray-400 top-2 bg-base-100 dark:bg-gray-900 peer-focus:px-2 peer-focus:text-primary peer-focus:dark:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                >
                  Registration Type
                </label>
              </div>
              <div className="relative">
                <select
                  ref={setRef("businessType")}
                  id="businessType"
                  className="block w-full pt-2 pb-4 pl-4 pr-4 mb-0 text-base border border-gray-800 rounded-lg bg-base-100 dark:text-base-100 focus:outline-none focus:border-primary dark:border-gray-600 peer"
                  required
                >
                  <option value="FOOD">FOOD</option>
                  <option value="FASHION">FASHION</option>
                  <option value="FITNESS">FITNESS</option>
                  <option value="TRAVEL">TRAVEL</option>
                  <option value="OTHERS">OTHERS</option>
                </select>
                <label
                  htmlFor="businessType"
                  className="absolute z-10 px-2 text-sm text-gray-500 duration-300 transform scale-75 -translate-y-4 dark:text-gray-400 top-2 bg-base-100 dark:bg-gray-900 peer-focus:px-2 peer-focus:text-primary peer-focus:dark:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                >
                  Business Type
                </label>
              </div>
            </section>
          </section>

          <section className="mx-4 mt-6 space-y-2">
            <h3>Company</h3>
            <section className="p-4 space-y-4 bg-white rounded-xl">
              <div className="relative">
                <input
                  type="text"
                  ref={setRef("establishmentYear")}
                  id="establishmentYear"
                  className="block w-full pt-2 pb-4 pl-4 pr-4 mb-0 text-base border border-gray-800 rounded-lg bg-base-100 dark:text-base-100 focus:outline-none focus:border-primary dark:border-gray-600 peer"
                  placeholder=" "
                  required
                />
                <label
                  htmlFor="establishmentYear"
                  className="absolute z-10 px-2 text-sm text-gray-500 duration-300 transform scale-75 -translate-y-4 dark:text-gray-400 top-2 bg-base-100 dark:bg-gray-900 peer-focus:px-2 peer-focus:text-primary peer-focus:dark:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                >
                  Establishment Year
                </label>
              </div>
              <div className="relative">
                <input
                  type="text"
                  ref={setRef("companyPan")}
                  id="companyPan"
                  className="block w-full pt-2 pb-4 pl-4 pr-4 mb-0 text-base border border-gray-800 rounded-lg bg-base-100 dark:text-base-100 focus:outline-none focus:border-primary dark:border-gray-600 peer"
                  placeholder=" "
                  required
                />
                <label
                  htmlFor="companyPan"
                  className="absolute z-10 px-2 text-sm text-gray-500 duration-300 transform scale-75 -translate-y-4 dark:text-gray-400 top-2 bg-base-100 dark:bg-gray-900 peer-focus:px-2 peer-focus:text-primary peer-focus:dark:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                >
                  Company PAN
                </label>
              </div>
              <div className="relative">
                <input
                  type="text"
                  ref={setRef("gstNumber")}
                  id="gstNumber"
                  className="block w-full pt-2 pb-4 pl-4 pr-4 mb-0 text-base border border-gray-800 rounded-lg bg-base-100 dark:text-base-100 focus:outline-none focus:border-primary dark:border-gray-600 peer"
                  placeholder=" "
                  required
                />
                <label
                  htmlFor="gstNumber"
                  className="absolute z-10 px-2 text-sm text-gray-500 duration-300 transform scale-75 -translate-y-4 dark:text-gray-400 top-2 bg-base-100 dark:bg-gray-900 peer-focus:px-2 peer-focus:text-primary peer-focus:dark:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                >
                  GST Number
                </label>
              </div>
              <div className="relative">
                <select
                  ref={setRef("gstYesNo")}
                  id="gstYesNo"
                  className="block w-full pt-2 pb-4 pl-4 pr-4 mb-0 text-base border border-gray-800 rounded-lg bg-base-100 dark:text-base-100 focus:outline-none focus:border-primary dark:border-gray-600 peer"
                  required
                >
                  <option value="YES">YES</option>
                  <option value="NO">NO</option>
                </select>
                <label
                  htmlFor="gstYesNo"
                  className="absolute z-10 px-2 text-sm text-gray-500 duration-300 transform scale-75 -translate-y-4 dark:text-gray-400 top-2 bg-base-100 dark:bg-gray-900 peer-focus:px-2 peer-focus:text-primary peer-focus:dark:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                >
                  Do you have GST?
                </label>
              </div>
            </section>
          </section>

          <section className="mx-4 mt-6 space-y-2">
            <h3>Banking Details</h3>
            <section className="p-4 space-y-4 bg-white rounded-xl">
              <div className="relative">
                <input
                  type="text"
                  ref={setRef("accountNumber")}
                  id="accountNumber"
                  className="block w-full pt-2 pb-4 pl-4 pr-4 mb-0 text-base border border-gray-800 rounded-lg bg-base-100 dark:text-base-100 focus:outline-none focus:border-primary dark:border-gray-600 peer"
                  placeholder=" "
                  required
                />
                <label
                  htmlFor="accountNumber"
                  className="absolute z-10 px-2 text-sm text-gray-500 duration-300 transform scale-75 -translate-y-4 dark:text-gray-400 top-2 bg-base-100 dark:bg-gray-900 peer-focus:px-2 peer-focus:text-primary peer-focus:dark:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                >
                  Account Number
                </label>
              </div>
              <div className="relative">
                <input
                  type="text"
                  ref={setRef("beneficiaryName")}
                  id="beneficiaryName"
                  className="block w-full pt-2 pb-4 pl-4 pr-4 mb-0 text-base border border-gray-800 rounded-lg bg-base-100 dark:text-base-100 focus:outline-none focus:border-primary dark:border-gray-600 peer"
                  placeholder=" "
                  required
                />
                <label
                  htmlFor="beneficiaryName"
                  className="absolute z-10 px-2 text-sm text-gray-500 duration-300 transform scale-75 -translate-y-4 dark:text-gray-400 top-2 bg-base-100 dark:bg-gray-900 peer-focus:px-2 peer-focus:text-primary peer-focus:dark:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                >
                  Beneficiary Name
                </label>
              </div>
              <div className="relative">
                <input
                  type="text"
                  ref={setRef("ifscCode")}
                  id="ifscCode"
                  className="block w-full pt-2 pb-4 pl-4 pr-4 mb-0 text-base border border-gray-800 rounded-lg bg-base-100 dark:text-base-100 focus:outline-none focus:border-primary dark:border-gray-600 peer"
                  placeholder=" "
                  required
                />
                <label
                  htmlFor="ifscCode"
                  className="absolute z-10 px-2 text-sm text-gray-500 duration-300 transform scale-75 -translate-y-4 dark:text-gray-400 top-2 bg-base-100 dark:bg-gray-900 peer-focus:px-2 peer-focus:text-primary peer-focus:dark:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                >
                  Branch IFSC Code
                </label>
              </div>
            </section>
          </section>

          <section className="mx-4 mt-6 space-y-2">
            <h3>Contact</h3>
            <section className="p-4 space-y-4 bg-white rounded-xl">
              <div className="relative">
                <input
                  type="email"
                  ref={setRef("businessEmail")}
                  id="businessEmail"
                  className="block w-full pt-2 pb-4 pl-4 pr-4 mb-0 text-base border border-gray-800 rounded-lg bg-base-100 dark:text-base-100 focus:outline-none focus:border-primary dark:border-gray-600 peer"
                  placeholder=" "
                  required
                />
                <label
                  htmlFor="businessEmail"
                  className="absolute z-10 px-2 text-sm text-gray-500 duration-300 transform scale-75 -translate-y-4 dark:text-gray-400 top-2 bg-base-100 dark:bg-gray-900 peer-focus:px-2 peer-focus:text-primary peer-focus:dark:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                >
                  Business Email
                </label>
              </div>
              <div className="relative">
                <input
                  type="text"
                  ref={setRef("businessContact")}
                  id="businessContact"
                  className="block w-full pt-2 pb-4 pl-4 pr-4 mb-0 text-base border border-gray-800 rounded-lg bg-base-100 dark:text-base-100 focus:outline-none focus:border-primary dark:border-gray-600 peer"
                  placeholder=" "
                  required
                />
                <label
                  htmlFor="businessContact"
                  className="absolute z-10 px-2 text-sm text-gray-500 duration-300 transform scale-75 -translate-y-4 dark:text-gray-400 top-2 bg-base-100 dark:bg-gray-900 peer-focus:px-2 peer-focus:text-primary peer-focus:dark:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                >
                  Business Contact Number
                </label>
              </div>
            </section>
          </section>

          <section className="mx-4 mt-6 space-y-2">
            <h3>Authentication</h3>
            <section className="p-4 space-y-4 bg-white rounded-xl">
              <div className="relative">
                <input
                  type="text"
                  ref={setRef("authSignatoryName")}
                  id="authSignatoryName"
                  className="block w-full pt-2 pb-4 pl-4 pr-4 mb-0 text-base border border-gray-800 rounded-lg bg-base-100 dark:text-base-100 focus:outline-none focus:border-primary dark:border-gray-600 peer"
                  placeholder=" "
                  required
                />
                <label
                  htmlFor="authSignatoryName"
                  className="absolute z-10 px-2 text-sm text-gray-500 duration-300 transform scale-75 -translate-y-4 dark:text-gray-400 top-2 bg-base-100 dark:bg-gray-900 peer-focus:px-2 peer-focus:text-primary peer-focus:dark:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                >
                  Auth Signatory Name
                </label>
              </div>
              <div className="relative">
                <input
                  type="text"
                  ref={setRef("contactPanCard")}
                  id="contactPanCard"
                  className="block w-full pt-2 pb-4 pl-4 pr-4 mb-0 text-base border border-gray-800 rounded-lg bg-base-100 dark:text-base-100 focus:outline-none focus:border-primary dark:border-gray-600 peer"
                  placeholder=" "
                  required
                />
                <label
                  htmlFor="contactPanCard"
                  className="absolute z-10 px-2 text-sm text-gray-500 duration-300 transform scale-75 -translate-y-4 dark:text-gray-400 top-2 bg-base-100 dark:bg-gray-900 peer-focus:px-2 peer-focus:text-primary peer-focus:dark:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                >
                  Contact PAN Card Person
                </label>
              </div>
            </section>
          </section>

          <section className="mx-4 mt-6 space-y-2">
            <h3>Credentials</h3>
            <section className="p-4 space-y-4 bg-white rounded-xl">
              <div className="relative">
                <input
                  type="text"
                  ref={setRef("merchantId")}
                  id="merchantId"
                  className="block w-full pt-2 pb-4 pl-4 pr-4 mb-0 text-base border border-gray-800 rounded-lg bg-base-100 dark:text-base-100 focus:outline-none focus:border-primary dark:border-gray-600 peer"
                  placeholder=" "
                  required
                />
                <label
                  htmlFor="merchantId"
                  className="absolute z-10 px-2 text-sm text-gray-500 duration-300 transform scale-75 -translate-y-4 dark:text-gray-400 top-2 bg-base-100 dark:bg-gray-900 peer-focus:px-2 peer-focus:text-primary peer-focus:dark:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                >
                  Merchant ID
                </label>
              </div>
              <div className="relative">
                <input
                  type="text"
                  ref={setRef("accessKeyId")}
                  id="accessKeyId"
                  className="block w-full pt-2 pb-4 pl-4 pr-4 mb-0 text-base border border-gray-800 rounded-lg bg-base-100 dark:text-base-100 focus:outline-none focus:border-primary dark:border-gray-600 peer"
                  placeholder=" "
                  required
                />
                <label
                  htmlFor="accessKeyId"
                  className="absolute z-10 px-2 text-sm text-gray-500 duration-300 transform scale-75 -translate-y-4 dark:text-gray-400 top-2 bg-base-100 dark:bg-gray-900 peer-focus:px-2 peer-focus:text-primary peer-focus:dark:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                >
                  Access Key ID
                </label>
              </div>
              <div className="relative">
                <input
                  type="text"
                  ref={setRef("secretKey")}
                  id="secretKey"
                  className="block w-full pt-2 pb-4 pl-4 pr-4 mb-0 text-base border border-gray-800 rounded-lg bg-base-100 dark:text-base-100 focus:outline-none focus:border-primary dark:border-gray-600 peer"
                  placeholder=" "
                  required
                />
                <label
                  htmlFor="secretKey"
                  className="absolute z-10 px-2 text-sm text-gray-500 duration-300 transform scale-75 -translate-y-4 dark:text-gray-400 top-2 bg-base-100 dark:bg-gray-900 peer-focus:px-2 peer-focus:text-primary peer-focus:dark:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                >
                  Secret Key
                </label>
              </div>
            </section>
          </section>

          <button className="col-span-1 md:col-span-2 bottom_btn" type="submit">
            Save
          </button>
        </form>
    </section>
  );
};

const OutletForm = memo(MemoBusinessForm);
export default OutletForm;
