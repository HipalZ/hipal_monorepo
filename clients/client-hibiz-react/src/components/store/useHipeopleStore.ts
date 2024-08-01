import { create } from "zustand"


export type HiPeoplePages = "SUMMARY" | "CLIENTS" | "TARGET GROUPS" | "ACTIONS"

interface IHiPeople {
    selectedPage: HiPeoplePages
    setSelectedPage: (page: HiPeoplePages) => void
}

const useHiPeopleStore = create<IHiPeople>((set) => ({
    selectedPage: "SUMMARY",
    setSelectedPage: (page:HiPeoplePages) => set({ selectedPage: page })
}))

export default useHiPeopleStore