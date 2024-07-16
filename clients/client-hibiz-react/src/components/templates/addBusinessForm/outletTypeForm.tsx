import useBusinessCtrl from "@/components/store/useBusinessCtrl";
import { useOwnerLogin } from "@/components/store/useOwnerLogin";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { apiRpc } from "@hi/common";
import { memo, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import { IoChevronDownCircleOutline } from "react-icons/io5";

export const businessTypeArray = [
  {
    title: "🏨New outlet",
    description: "Store has nothing to do with my previous stores, They gave different brand names",
    gradient: " linear-gradient(1.7deg, #FFFFFF -11.95%, #F2F2F2 112.46%)",
  },
  {
    title: "✨Branch",
    description: " Add a branch to existing brand and auto link loyalty and other services",
    gradient: " linear-gradient(1.7deg, #FFFFFF -11.95%, #F2F2F2 112.46%)",
  },
];

const OutletType = () => {
  const { step, setStep, outletType, setOutletType, branches, selectedBranch, setBranches, setSelectedBranch } = useBusinessCtrl((s) => ({
    step: s.step,
    setStep: s.setStep,
    outletType: s.outletType,
    setOutletType: s.setOutletType,
    branches: s.branches,
    setBranches: s.setBranches,
    selectedBranch: s.selectedBranch,
    setSelectedBranch: s.setSelectedBranch,
  }));

  const user = useOwnerLogin((s) => s.user);

  const getAllBranches = useCallback(async () => {
    const res = await apiRpc.businesses.getBranches[":ownerId"].$get({
      param: {
        ownerId: user?._id || "",
      },
    });
    const response = (await res.json()).data as Array<{ _id: string, name: string }> || [];
    setBranches(response);

  }, [user?._id, setBranches]);

  useEffect(() => {
    if (outletType === "✨Branch") {
      getAllBranches();
    }
  }, [outletType, getAllBranches]);

  const goNext = useCallback(() => {
    if (outletType === "") {
      return toast.error("Please select a business type");
    }
    if (outletType === "✨Branch" && selectedBranch === "") {
      return toast.error("Please select a branch");
    }
    setStep(step + 1);
  }, [step, outletType, selectedBranch, setStep]);

  return (
    <main>
      {businessTypeArray.map((ele, index) => (
        <section key={ele.title} className="flex flex-col w-[90%] max-w-[30rem] m-6  border rounded-2xl">
          <article className="flex items-center p-4">
            <input
              type="radio"
              name="businessType"
              value={ele.title}
              id={`businessType-${ele.title}`}
              onChange={() => {
                setOutletType(ele.title);
                setSelectedBranch("");
              }}
              checked={outletType === ele.title}
              className="mr-2 radio-black radio"
            />
            <h3 className="text-lg font-semibold">{ele.title}</h3>
          </article>

          <article className="p-4" style={{ background: ele.gradient }}>
            <p className="text-sm">{ele.description}</p>
          </article>

          {index === 1 && outletType === "✨Branch" && (
            <article className="p-4">
              <Menu as="div" className="relative inline-block w-full text-left">
                <div>
                  <MenuButton className="inline-flex justify-between w-full px-4 py-2 text-sm font-medium text-black bg-white border border-black rounded-2xl">
                    {selectedBranch ? branches.find(branch => branch._id === selectedBranch)?.name || "Select a branch" : "Select a branch"}
                    <IoChevronDownCircleOutline className="w-5 h-5 ml-2 -mr-1" aria-hidden="true" />
                  </MenuButton>
                </div>
                <MenuItems className="absolute right-0 w-full mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg">
                  {branches.map((branch) => (
                    <MenuItem key={branch._id} as="div">
                      {({ focus }) => (
                        <button
                          type="button"
                          className={`${focus ? 'bg-gray-100' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                          onClick={() => setSelectedBranch(branch._id)}
                        >
                          {branch.name}
                        </button>
                      )}
                    </MenuItem>
                  ))}
                </MenuItems>
              </Menu>
            </article>
          )}

          <button type="button" onClick={goNext} className="bottom_btn">
            Next
          </button>
        </section>
      ))}
    </main>
  );
};

const MemoiseOutletType = memo(OutletType);
export default MemoiseOutletType;