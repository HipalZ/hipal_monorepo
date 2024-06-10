import Hi from '@/assets/svg/hi.svg';
import axios from '@/axios';
import Header from '@/components/molecules/header';
import type { IBusinessDetails } from '@/components/types/businessData';
import { storeImageFiles } from '@/components/utils/helper';
import { PAGE_TYPES, routePaths } from '@/components/utils/routes';
import type React from 'react';
import { memo, startTransition, useEffect, useState } from 'react';
import { BsChevronLeft } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AddBusiness = memo(() => {
  const navigate = useNavigate();
  const [uniqueUrl, setUniqueUrl] = useState<string>('');
  const [businessDetails, setBusinessDetails] = useState<IBusinessDetails>({
    name: '',
    registerName: '',
    businessType: '',
    address: '',
    url: '',
    logo: '',
  });
  const [exists, setExists] = useState<boolean>(false);
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    setChecked(true);
  }, [exists]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.readAsDataURL(e.target.files[0]);

      const imageUrl = await storeImageFiles(e.target.files[0]);
      setBusinessDetails((prevDetails: IBusinessDetails) => {
        return {
          ...prevDetails,
          logo: imageUrl,
        };
      });
      setSelectedImage(imageUrl || '');
    }
  };
  const handleBusinessName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusinessDetails((prevDetails) => {
      return {
        ...prevDetails,
        name: e.target.value,
      };
    });
  };
  const handleRegisterName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusinessDetails((prevDetails) => {
      return {
        ...prevDetails,
        registerName: e.target.value,
      };
    });
  };
  const handleBusinessType = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBusinessDetails((prevDetails) => {
      return {
        ...prevDetails,
        businessType: e.target.value,
      };
    });
  };
  const handleAddress = (e: any) => {
    setBusinessDetails((prevDetails) => {
      return {
        ...prevDetails,
        address: e.target.value,
      };
    });
  };
  const getCustomUrl = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (
      e.target.value
        ?.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s/g, '')
    ) {
      try {
        const res = await axios.get(`/v1/businesses/${e.target.value?.toLowerCase().replace(/\s/g, '')}?customLink=true`);
        setExists(res?.data?.exists);
        setChecked(true);
        if (res?.data?.exists) {
          toast.error('Business already exists');
        } else {
          setBusinessDetails((prevDetails) => {
            return {
              ...prevDetails,
              url: e.target.value
                ?.toLowerCase()
                .replace(/[^a-z0-9\s]/g, '')
                .replace(/\s/g, ''),
            };
          });
        }
      } catch (err) {
        console.error(err);
      }
    }
  };
  const postSettings = async (businessId: string) => {
    try {
      const config = {
        method: 'POST',
        url: '/v1/settings',
        data: {
          businessId: businessId,
          themes: {
            primaryColor: '#F9F2E7',
            secondaryColor: '#161616',
            accentColor: '#FA6642',
          },
        },
      };
      await axios(config);
    } catch (error) {
      console.error(error);
    }
  };
  const handleCreateBusiness = async () => {
    if (
      businessDetails?.name === '' ||
      businessDetails?.registerName === '' ||
      businessDetails?.businessType === '' ||
      businessDetails?.address === '' ||
      businessDetails?.url === '' ||
      businessDetails?.logo === ''
    )
      return toast.error('Please fill all the details');
    if (businessDetails?.address?.length < 50) return toast.error('Address should be more than 50 characters');
    if (businessDetails?.url?.length <= 1) return toast.error('Custom url must be between 2 and 50 characters');
    if (businessDetails?.name?.length <= 1 || businessDetails?.registerName?.length <= 1)
      return toast.error('Business Name must be between 2 and 50 characters');
    try {
      const config = {
        method: 'POST',
        url: '/v1/businesses',
        data: {
          businessName: businessDetails?.name,
          registeredName: businessDetails?.registerName,
          businessType: businessDetails?.businessType?.toUpperCase(),
          logo: businessDetails?.logo,
          address: businessDetails?.address,
          customLink: businessDetails?.url,
          gstRegistered: false,
          multipleOutlets: false,
        },
      };
      const response = await axios(config);
      if (response?.status === 201 || response?.status === 200) {
        await postSettings(response?.data?._id);
        toast.success('Business created successfully');
        startTransition(() => {
          navigate(routePaths[PAGE_TYPES.BUSINESS]());
        });
      }
    } catch (error: any) {
      toast.error(error[0]?.message);
    }
  };
  return (
    <div>
      <div className="pb-[2rem]">
        <div className="sticky top-0 z-20 bg-[#f5f5f5] lg:mx-[30rem]">
          <Header title="Business" leftIcon={<BsChevronLeft />} centerImage={Hi} rightImage={Hi} isIconBusinessShow={true} />
          <div className="mt-6 flex items-center justify-between border-b border-[#cacaca] px-6 pb-4">
            <div className="flex text-2xl">
              <span>Add Business</span>
            </div>
          </div>
        </div>
        <div className="border-1 mx-6 mt-4 rounded-md border border-[#CACACA] pb-4 lg:mx-[30rem]">
          <div className="ml-4 mt-4 font-medium">
            Name of the Business <span className="text-red-500">*</span>
          </div>
          <div className=" mt-4 w-full px-4">
            <input
              type="text"
              onChange={(e) => handleBusinessName(e)}
              value={businessDetails?.name}
              id="floating_outlined"
              className="peer mb-0 ml-0 mr-0 block w-full rounded-md border border-gray-800 bg-transparent pb-2 pl-2 pr-[7rem] pt-1 text-base text-gray-900 focus:border-[#2B354D] focus:outline-none focus:ring-0 dark:border-[#2B354D] dark:text-white"
              placeholder="Name"
              required
            />
          </div>
          <div className="ml-4 mt-4 font-medium">
            Registered Business Name <span className="text-red-500">*</span>
          </div>
          <div className=" mt-4 w-full px-4">
            <input
              type="text"
              onChange={(e) => handleRegisterName(e)}
              value={businessDetails?.registerName}
              id="floating_outlined"
              className="peer mb-0 ml-0 mr-0 block w-full rounded-md border border-gray-800 bg-transparent pb-2 pl-2 pr-[7rem] pt-1 text-base text-gray-900 focus:border-[#2B354D] focus:outline-none focus:ring-0 dark:border-[#2B354D] dark:text-white"
              placeholder="Register Name"
              required
            />
          </div>
          <div className=" mt-4 w-full px-4">
            <label className="my-4 font-medium">
              Type of Business <span className="text-red-500">*</span>
            </label>
            <select
              value={businessDetails?.businessType}
              onChange={handleBusinessType}
              className="peer mb-0 ml-0 mr-0 mt-4 block w-full rounded-md border border-gray-800 bg-transparent pb-2 pl-2 pt-1 text-base text-gray-900 focus:border-[#2B354D] focus:outline-none focus:ring-0 dark:border-[#2B354D] dark:text-white"
            >
              <option value="">Select a Business Type</option>
              <option value="Qsr">Qsr</option>
              <option value="Classic_dine_in">Classic_dine_in</option>
              <option value="Cafe">Cafe</option>
              <option value="Bakery">Bakery</option>
              <option value="Food_retails">Food_retails</option>
              <option value="Food_parlours">Food_parlours</option>
            </select>
          </div>
          <div className="ml-4 mt-4 font-medium">
            Address of business <span className="text-red-500">*</span>
          </div>
          <div className=" mt-4 w-full px-4">
            <textarea
              onChange={(e) => handleAddress(e)}
              maxLength={400}
              value={businessDetails?.address}
              id="floating_outlined"
              className="peer mb-0 ml-0 mr-0 block h-[7rem] w-full rounded-md border border-gray-800 bg-transparent pb-2 pl-2 pt-1 text-base text-gray-900 focus:border-[#2B354D] focus:outline-none focus:ring-0 dark:border-[#2B354D] dark:text-white"
              placeholder="Address"
              required
            />
          </div>
        </div>
        <div className="border-1 mx-6 mt-4 rounded-md border border-[#CACACA] pb-4 lg:mx-[30rem]">
          <h1 className="ml-4 mt-4 font-medium">
            Customized Link <span className="text-red-500">*</span>
          </h1>
          <label className="ml-4 mt-4 font-semibold text-[#2B354D]">https://hipal.life/{uniqueUrl}</label>
          <div className="mx-4 mt-4 font-medium">
            <input
              type="text"
              value={uniqueUrl}
              onChange={(e) =>
                setUniqueUrl(
                  e.target.value
                    ?.toLowerCase()
                    .replace(/[^a-z0-9\s]/g, '')
                    .replace(/\s/g, ''),
                )
              }
              onBlurCapture={getCustomUrl}
              id="floating_outlined"
              className="peer mb-0 ml-0 mr-0 block w-full rounded-md border border-gray-800 bg-transparent pb-2 pl-2 pr-[7rem] pt-1 text-base text-gray-900 focus:border-[#2B354D] focus:outline-none focus:ring-0 dark:border-[#2B354D] dark:text-white"
              placeholder="URL"
              required
            />
            {businessDetails?.url && checked ? (
              businessDetails.url.length < 2 ? (
                <p className="my-1 ml-auto text-xs text-red-500">URL should contain minimum two characters</p>
              ) : exists ? (
                <p className="my-1 ml-auto text-xs text-red-500">Business Name exists</p>
              ) : (
                <p className="my-1 ml-auto text-xs text-green-500">Business Name available</p>
              )
            ) : null}
          </div>
        </div>
        <div className="border-1 mx-6 mt-4 rounded-md border border-[#CACACA] pb-4 lg:mx-[30rem]">
          <h1 className="ml-4 mt-4 text-2xl font-medium">
            Logo <span className="text-red-500">*</span>
          </h1>
          <hr className="mx-4 my-5 border border-l-0 border-r-0 border-t-0 border-[#CACACA]" />
          <div className="mx-4 mt-4 flex justify-start font-medium">
            <div className="relative">
              <input
                id="fileInput"
                type="file"
                style={{ display: 'none' }}
                accept=".png, .jpeg, .jpg, .webp"
                onChange={(e) => handleImageChange(e)}
              />
              <label
                htmlFor="fileInput"
                className="border-1 rounded-xl border border-[#CACACA]"
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '147px',
                  height: '110px',
                  cursor: 'pointer',
                  overflow: 'hidden',
                }}
              >
                {selectedImage !== '' ? <img src={selectedImage} alt={selectedImage} width={100} height={100} loading="lazy" /> : '+'}
              </label>
              {selectedImage !== '' ? (
                <div className="absolute right-0 top-0">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImage('');
                      setBusinessDetails((prev) => ({ ...prev, logo: '' }));
                    }}
                    className="mx-1 text-blue-500"
                  >
                    ✖
                  </button>
                </div>
              ) : (
                ''
              )}
            </div>
            <div className="ml-4 text-sm font-normal text-[#2B354D] opacity-70">
              <p>Cover Image</p>
              <p>1080 px X 1080 px</p>
              <p>Png, Jpeg, Webp</p>
            </div>
          </div>
        </div>
      </div>
      <div className="sticky bottom-5 mx-6 my-6 lg:mx-[30rem]">
        <button onClick={handleCreateBusiness} type="button" className="on_active_bounce w-full rounded-md bg-[#2B354D] py-2.5 text-white">
          Create
        </button>
      </div>
    </div>
  );
});

export default AddBusiness;
