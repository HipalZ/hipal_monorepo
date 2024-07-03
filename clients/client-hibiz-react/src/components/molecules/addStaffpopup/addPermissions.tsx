import { permissionsArray } from "./staffTypes";
import MultipleBottomButtons from "@/components/atom/multipleButtons";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { useAddStaffStore } from "@/components/store/useAddStaffStore";
import { IoChevronDown } from "react-icons/io5";
import { AnimatePresence, easeOut, motion } from "framer-motion";
import { cn } from "@/components/utils/helper";

const AddPermissions = () => {
  const { selectedPermissions, toggleMainService, toggleSubService, setPageToggle } = useAddStaffStore();

  const goBack = useCallback(() => {
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

  const isSubServiceSelected = useCallback((serviceTitle: string) => selectedPermissions.includes(serviceTitle), [selectedPermissions]);

  return (
    <section className="relative px-4 rounded">
      <center className="sticky top-0 z-20 p-2 mt-4 text-xl font-semibold bg-[#f4f4f4]">Add Permissions</center>

      {permissionsArray.map((permission) => (
        <Disclosure as="div" key={permission.permission} defaultOpen={false} className="pt-4">
          {({ open }) => (
            <>
              <DisclosureButton
                className={cn("flex items-center justify-between w-full p-4 bg-white border border-b-black", open ? "rounded-t-xl" : "rounded-xl")}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(permission.permission)}
                    onChange={() =>
                      handleMainServiceChange(
                        permission.permission,
                        permission.services.map((service) => service.title),
                      )
                    }
                    className="mr-2 rounded-sm"
                  />
                  <span className="font-bold">{permission.permission}</span>
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
                      {permission.services.map((service) => (
                        <div key={service.title} className="flex">
                          <input
                            type="checkbox"
                            checked={isSubServiceSelected(service.title)}
                            onChange={() => handleSubServiceChange(service.title)}
                            className="mr-2"
                          />
                          <div>
                            <p className="font-bold">{service.title}</p>
                            <p className="text-gray-600">{service.description}</p>
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
              onClick: () => console.log("Selected permissions:", selectedPermissions),
              className: "bg-black text-white",
            },
          ]}
        />
    </section>
  );
};

const MemoizedAddPermissions = memo(AddPermissions);

export default MemoizedAddPermissions;
