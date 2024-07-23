import { memo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { IoChevronDown } from "react-icons/io5";
import { AnimatePresence, easeOut, motion } from "framer-motion";
import MultipleBottomButtons from "@/components/atom/multipleButtons";
import { useAddStaffStore } from "@/components/store/useAddStaffStore";
import { apiRpc } from "@hi/common";
import { cn } from "@/components/utils/helper";
import toast from "react-hot-toast";
import useBusinessData from "@/components/store/useBusinessData";

const AddPermissions = () => {
  const {
    selectedPermissions,
    toggleMainService,
    toggleSubService,
    setPageToggle,
    permissions,
    setPermissions,
    selectedRole,
    isEditing,
  } = useAddStaffStore();
  const businessData = useBusinessData((s) => s.businessData);

  const goBack = useCallback(() => {
    if (isEditing) {
      setPageToggle("EDIT_STAFF");
      return;
    }
    setPageToggle("ADD_STAFF");
  }, [setPageToggle]);

  const handleMainServiceChange = useCallback(
    (permission: string, services: string[]) => {
      toggleMainService(permission, services);
    },
    [toggleMainService],
  );

  const handleSubServiceChange = useCallback(
    (serviceTitle: string) => {
      toggleSubService(serviceTitle);
    },
    [toggleSubService],
  );

  const isSubServiceSelected = useCallback(
    (serviceTitle: string) => selectedPermissions.includes(serviceTitle),
    [selectedPermissions],
  );

  const fetchPermissions = async () => {
    const res = await apiRpc.businesses[":businessId"].permissions.$get({
      param: {
        businessId: businessData?._id,
      },
    });
    const data = await res.json();
    if (res.status === 200 || res.status === 201) {
      setPermissions(data.data);
    } else {
      toast.error("Failed to fetch permissions");
    }
    return data.data;
  };

  useQuery({
    queryKey: ["roles", businessData?._id],
    queryFn: fetchPermissions,
    enabled: !!businessData?._id,
  });

  return (
    <section className="relative px-4 rounded">
      <center className="sticky top-0 z-20 p-2 mt-4 text-xl font-semibold bg-[#f4f4f4]">
        {isEditing ? "Edit" : "Add"} Permissions
      </center>

      {(permissions[selectedRole] || []).map((permission) => (
        <Disclosure
          as="div"
          key={permission.title}
          defaultOpen={false}
          className="pt-4"
        >
          {({ open }) => (
            <>
              <DisclosureButton
                className={cn(
                  "flex items-center justify-between w-full p-4 bg-white border border-b-black",
                  open ? "rounded-t-xl" : "rounded-xl",
                )}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked={selectedPermissions.includes(
                      permission.title,
                    )}
                    defaultValue={selectedPermissions}
                    value={permission.title}
                    checked={selectedPermissions.includes(permission.title)}
                    onChange={() =>
                      handleMainServiceChange(
                        permission.title,
                        permission.subPermissions.map(
                          (service) => service.subTitle,
                        ),
                      )
                    }
                    className="mr-2 rounded-sm"
                  />
                  <span className="font-bold">{permission.title}</span>
                </div>
                <IoChevronDown className={cn("w-5", open && "rotate-180")} />
              </DisclosureButton>
              <div className="overflow-hidden">
                <AnimatePresence>
                  {open && (
                    <DisclosurePanel
                      static
                      as={motion.div}
                      initial={{ opacity: 0, y: -24 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -24 }}
                      transition={{ duration: 0.2, ease: easeOut }}
                      className="p-4 space-y-4 text-sm origin-top bg-white rounded-b-xl"
                    >
                      {permission.subPermissions.map((service) => (
                        <div key={service._id} className="flex">
                          <input
                            type="checkbox"
                            checked={isSubServiceSelected(service.subTitle)}
                            onChange={() =>
                              handleSubServiceChange(service.subTitle)
                            }
                            className="mr-2"
                          />
                          <div>
                            <p className="font-bold">{service.subTitle}</p>
                            <p className="text-gray-600">
                              {service.descriptions}
                            </p>
                          </div>
                        </div>
                      ))}
                    </DisclosurePanel>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </Disclosure>
      ))}

      <MultipleBottomButtons
        buttons={[
          {
            text: "Back",
            onClick: goBack,
            className: "bg-white border border-black text-black",
          },
          {
            text: "Save",
            onClick: () =>
              setPageToggle(isEditing ? "EDIT_STAFF" : "ADD_STAFF"),
            className: "bg-black text-white",
          },
        ]}
      />
    </section>
  );
};

const MemoizedAddPermissions = memo(AddPermissions);

export default MemoizedAddPermissions;
