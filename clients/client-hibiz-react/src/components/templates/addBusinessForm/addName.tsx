import useBusinessCtrl from "@/components/store/useBusinessCtrl";
import { useUserToken } from "@/components/store/useUserToken";
import { apiRpc } from "@hi/common";
import { type FormEvent, memo, useCallback, useState, type ChangeEvent } from "react";
import { debounce } from "lodash";
import { useOwnerLogin } from "@/components/store/useOwnerLogin";
import PopUp from "@/components/atom/popUp";
import toast from "react-hot-toast";

const parentBranchCopy = [
  {
    title: "menu",
    description: "Copy dishes, categories, add ons, prices with images and description"
  }, {
    title: "themes",
    description: "Copy themes design, banners, must try cover logo and more."
  },
  {
    title: "rewards",
    description: "Copy the rewards program with loyalty program, coupons and other settings"
  },
  {
    title: "paymentAndBusinessSettings",
    description: "Copy the same payments, banks and other business settings from parent"
  }
]

const AddName = () => {
  const {
    setStep,
    step,
    businessName,
    setBusinessName,
    setCustomLink,
    customLink,
    businessType,
    branchName,
    menu,
    setMenu,
    themes,
    setThemes,
    rewards,
    setRewards,
    paymentAndBusinessSettings,
    setPaymentAndBusinessSettings
  } = useBusinessCtrl((s) => ({
    setStep: s.setStep,
    step: s.step,
    businessName: s.businessName,
    setBusinessName: s.setBusinessName,
    setCustomLink: s.setCustomLink,
    customLink: s.customLink,
    businessType: s.businessType,
    branchName: s.selectedBranch,
    menu: s.menu,
    setMenu: s.setMenu,
    themes: s.themes,
    setThemes: s.setThemes,
    rewards: s.rewards,
    setRewards: s.setRewards,
    paymentAndBusinessSettings: s.paymentAndBusinessSettings,
    setPaymentAndBusinessSettings: s.setPaymentAndBusinessSettings,
  }));

  const { accessToken, refreshToken } = useUserToken((s) => ({
    accessToken: s.accessToken,
    refreshToken: s.refreshToken,
  }));

  const { user } = useOwnerLogin((s) => ({
    user: s.user,
  }));

  const [validCustomLink, setValidCustomLink] = useState(false);
  const [validBusinessName, setValidBusinessName] = useState(false);
  const [isButtonActive, setIsButtonActive] = useState(false);
  const [openCopyModal, setOpenCopyModal] = useState(false);
  const [invalidLinkMessage, setInvalidLinkMessage] = useState("");

  const addBusinessName = (e: ChangeEvent<HTMLInputElement>) => {
    setBusinessName(e.target.value);
  };

  const debouncedApiCall = useCallback(
    debounce(async (link) => {
      const res = await apiRpc.businesses[":customLink"].$post({
        header: {
          x_access_token: accessToken,
          x_refresh_token: refreshToken,
        },
        param: {
          customLink: link,
        },
      });
      const response = (await res.json()).data;
      if (response.exist) {
        setValidCustomLink(true);
        setIsButtonActive(false);
        setInvalidLinkMessage("Name already exist");
      } else {
        setIsButtonActive(true);
        setValidCustomLink(false);
      }
    }, 1500),
    [accessToken, refreshToken]
  );

  const addCustomLink = (e: ChangeEvent<HTMLInputElement>) => {
    const link = e.target.value;
    setCustomLink(link);
    setIsButtonActive(false);
    debouncedApiCall(link);
  };

  const goNext = useCallback(async () => {
    if (!businessName) {
      setValidBusinessName(true);
      return;
    }
    if (!customLink) {
      setValidCustomLink(true);
      return;
    }
    const res = await apiRpc.businesses.$post({
      header: {
        x_access_token: accessToken,
        x_refresh_token: refreshToken,
      },
      json: {
        businessType: businessType || "FOOD",
        name: businessName,
        customLink: customLink,
        staffIds: [user._id],
      },
    });

    if (res.status === 200 || res.status === 201) {
      setStep(step + 1);
    }
  }, [
    step,
    businessName,
    customLink,
    accessToken,
    refreshToken,
    businessType,
    user,
    setStep
  ]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (businessName.trim() === "") {
      return toast.error("Please enter a valid name");
    }
    branchName ? openCopyModalComponent() : goNext();
  };

  const openCopyModalComponent = useCallback(() => {
    setOpenCopyModal(true);
  }, []);

  const createBranch = async () => {
    const res = await apiRpc.businesses.createBranch.$post({
      header: {
        x_access_token: accessToken,
        x_refresh_token: refreshToken,
      },
      json: {
        name: businessName,
        customLink: customLink,
        staffIds: [user._id],
        businessType: businessType || "FOOD",
        parentOutLetId: branchName,
        menu,
        themes,
        rewards,
        paymentAndBusinessSettings,
      },
    });
    
    if (res.status === 200 || res.status === 201) {
      console.log({
        name: businessName,
        customLink: customLink,
        staffIds: [user._id],
        businessType: businessType || "FOOD",
        parentOutLetId: branchName,
        menu,
        themes,
        rewards,
        paymentAndBusinessSettings,
      });
    }
  }

  const closeCopyModal = useCallback(() => {
    const selectedSettings = { menu, themes, rewards, paymentAndBusinessSettings };
    console.log(selectedSettings);
    setOpenCopyModal(false);
  }, [menu, themes, rewards, paymentAndBusinessSettings]);

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    switch (name) {
      case "menu":
        setMenu(checked);
        break;
      case "themes":
        setThemes(checked);
        break;
      case "rewards":
        setRewards(checked);
        break;
      case "paymentAndBusinessSettings":
        setPaymentAndBusinessSettings(checked);
        break;
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <section className="mx-6 mt-4 space-y-2">
        <label htmlFor="businessName" className="text-lg">
          Your Outlet name*
        </label>
        <input
          type="text"
          id="businessName"
          value={businessName}
          className="w-full px-4 py-3 border border-black rounded-2xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          placeholder="Enter your name"
          maxLength={20}
          onChange={addBusinessName}
          required
        />
        {validBusinessName && (
          <span className="text-red-500">Please enter a valid name</span>
        )}
      </section>
      <section className="mx-6 mt-8 space-y-2">
        <label htmlFor="customLink" className="text-lg">
          Your customized Link*
        </label>
        <span className="opacity-50">
          Your customers will access your website through this link
        </span>
        <div className="relative w-full overflow-hidden">
          <input
            type="text"
            id="customLink"
            value={customLink}
            className="w-full px-4 py-3 pr-20 border border-black rounded-2xl"
            placeholder="Custom Link"
            maxLength={15}
            onChange={addCustomLink}
            required
          />
          <span className="absolute text-[#2900FF] bg-[#E4E0F9] py-3 px-4 transform -translate-y-1/2 right-0 top-1/2 rounded-r-2xl">
            .hipal.life
          </span>
        </div>
        {validCustomLink && (
          <span className="text-red-500">{invalidLinkMessage}</span>
        )}
      </section>
      <button
        type="submit"
        className="bottom_btn"
        disabled={!isButtonActive}
      >
        Next
      </button>
      {openCopyModal && (
        <PopUp show={openCopyModal} onClose={closeCopyModal}>
          {parentBranchCopy.map((ele) => (
            <section key={ele.title} className="flex flex-col w-[90%] max-w-[30rem] m-6 border rounded-2xl">
              <article className="flex items-center p-4">
                <input
                  type="checkbox"
                  name={ele.title}
                  checked={
                    ele.title === "menu" ? menu :
                      ele.title === "themes" ? themes :
                        ele.title === "rewards" ? rewards :
                          ele.title === "paymentAndBusinessSettings" ? paymentAndBusinessSettings :
                            false
                  }
                  onChange={handleCheckboxChange}
                  className="mr-2"
                />
                <h3 className="text-lg font-semibold">{ele.title}</h3>
              </article>
              <article className="p-4" style={{ background: "#E4E0F9" }}>
                <p className="text-sm">{ele.description}</p>
              </article>
            </section>
          ))}
          <button
            type="button"
            className="bottom_btn"
            onClick={createBranch}
          >
            Next
          </button>
        </PopUp>
      )}
    </form>
  );
};

const MemoiseAddName = memo(AddName);
export default MemoiseAddName;
