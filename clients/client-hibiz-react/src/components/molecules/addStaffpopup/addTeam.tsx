import { MdEdit } from "react-icons/md";
import { useAddStaffStore } from "@/components/store/useAddStaffStore";

const AddTeam = () => {
    const { setPageToggle, name, setName, phone, setPhone } = useAddStaffStore();
    return (
        <>
            <h6 className="mx-4 mt-4 -mb-2 opacity-50">Staff</h6>

            <section className="p-4 m-4 space-y-4 bg-white rounded-xl">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-black rounded-2xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Enter your name"
                    maxLength={20}
                    required
                />
                <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 border border-black rounded-2xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Enter phone number"
                    maxLength={10}
                    required
                />
            </section>

            <h6 className="mx-4 mt-6 mb-2 opacity-50">Role</h6>

            <section className="p-4 mx-4 space-y-4 bg-white rounded-xl">
                <button className="px-4 py-2 rounded-2xl bg-[#2C01A360] text-white">
                    Owner
                </button>
                <br />
                <button onClick={() => setPageToggle("ADD_ROLE")} className="flex items-center justify-center px-4 py-2 rounded-2xl bg-[#EFEFF3] w-full">
                    <MdEdit /> Assign Role
                </button>
            </section>

            <h6 className="mx-4 mt-6 mb-2 opacity-50">
                Customize Permissions for Co owner
            </h6>

            <section className="p-4 mx-4 space-y-4 bg-white rounded-xl">
                <button className="px-4 py-2 rounded-2xl bg-[#2C01A360] text-white">
                    Owner
                </button>
                <br />
                <button onClick={() => setPageToggle("ADD_PERMISSIONS")} className="flex items-center justify-center px-4 py-2 rounded-2xl bg-[#EFEFF3] w-full">
                    <MdEdit /> Manage Permissions{" "}
                </button>
            </section>

            <button className="bottom_btn">Send Invite</button>
        </>
    );
};

export default AddTeam;
