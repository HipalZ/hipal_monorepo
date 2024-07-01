import { useCallback, lazy, Suspense, memo } from "react";
import { AddRoleArray } from "./staffTypes";
import { cn } from "@/components/utils/helper";
import Loader from "@/components/atom/loader";
import { useAddStaffStore } from "@/components/store/useAddStaffStore";

const MultipleBottomButtons = lazy(() => import("@/components/atom/multipleButtons"));



const AddRole = () => {
    const { selectedRole, setSelectedRole, pageToggle, setPageToggle } = useAddStaffStore();

    const handleRoleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedRole(event.target.value);
    };

    const saveRole = () => {
        if (selectedRole) {
            console.log("Selected role:", selectedRole);
        } else {
            console.error("No role selected");
        }
    };

    const goBack = useCallback(() => {
        setPageToggle("ADD_STAFF");
    }, [pageToggle, setPageToggle]);

    return (
        <section className="relative px-4 rounded-4">
            <center className="sticky top-0 z-20 p-2 my-4 text-xl font-semibold bg-[#f4f4f4]">
                Add Role
            </center>
            <section>
                {AddRoleArray.map((item) => (
                    <div key={item.role} className={cn(
                        "p-4 mb-4 bg-white rounded-2xl",
                        selectedRole === item.role && "border border-purple-500"
                    )}
                    >
                        <label className="flex items-center mb-2">
                            <input
                                type="radio"
                                name="role"
                                value={item.role}
                                checked={selectedRole === item.role}
                                onChange={handleRoleChange}
                                className="mr-2"
                            />
                            <span className="font-bold">{item.role}</span>
                        </label>
                        <p className="text-sm opacity-50">{item.description}</p>
                    </div>
                ))}
            </section>

            <Suspense fallback={<div><Loader /></div>}>
                <MultipleBottomButtons
                    buttons={[
                        {
                            text: 'Back',
                            onClick: goBack,
                            className: 'bg-white border border-black text-black',
                        },
                        {
                            text: 'Save',
                            onClick: saveRole,
                            className: 'bg-black text-white',
                        },
                    ]}
                />
            </Suspense>
        </section>
    );
};

export default memo(AddRole);
