
const NewAddStaff = () => {
    return (
        <div className="min-h-auto h-auto max-h-[85vh] overflow-auto rounded-t-3xl bg-[#F4F4F4] pb-[7rem] pt-4">
            {/* <div className="px-4 text-xl font-semibold ">Add Staff</div> */}
                <h6 className="mx-4 mb-2 opacity-50">
                    Staff
                </h6>
            <section className="p-4 mx-4 space-y-4 bg-white rounded-xl">
                <input
                    type="text"
                    // value={name}
                    // onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-black rounded-2xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Enter your name"
                    maxLength={20}
                    required
                />
                 <input
                    type="tel"
                    // value={name}
                    // onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-black rounded-2xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Enter phone number"
                    maxLength={10}
                    required
                />
            </section>
        </div>
    )
}

export default NewAddStaff