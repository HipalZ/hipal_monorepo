import BottomButton from "@/components/atom/bottomButton"
import PopUp from "@/components/atom/popUp"
import useZoneStore from "@/components/store/useZone"
import { useCallback } from "react"
import AddTables from "./AddTables"

const TablesMain = () => {

    const {createTableModal,setCreateTableModal} = useZoneStore()

    const openTableModalFunc = useCallback(() => {
        setCreateTableModal(true)
    },[setCreateTableModal])

    return (
        <div>
              {createTableModal && (
        <PopUp
          width="w-[30rem]"
          height="h-[100dvh] lg:h-[80dvh]"
          hide
          show={createTableModal}
          onClose={() => setCreateTableModal(false)}
        >
          <AddTables />
        </PopUp>
      )}
            <BottomButton
                fixed
                buttons={[
                    {
                        text: "Add Table",
                        onClick: openTableModalFunc,
                    },
                ]}
            />
        </div>
    )
}

export default TablesMain
