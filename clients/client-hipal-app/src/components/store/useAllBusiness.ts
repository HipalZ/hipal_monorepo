//@ts-nocheck
"use client"
import type { IBusinessData } from "@/components/types/businessData"
import { isEqual } from "lodash-es"
import { useCallback, useMemo } from "react"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

interface IUseAllBusiness {
	data: IBusinessData
	setData: (data: IBusinessData) => void
}

export const _useAllBusiness = create<IUseAllBusiness>()(
	persist(
		(set) => ({
			data: {} as IBusinessData,
			setData: (d: IBusinessData) => set(() => ({ data: d })),
		}),
		{
			name: "businessStore",
			storage:createJSONStorage(()=>localStorage)
		},
	),
)

export function useAllBusiness() {
	const { data: _data, setData: _setData } = _useAllBusiness()

	const data = useMemo(() => _data, [_data])
	const setData = useCallback((d: IBusinessData) => _setData(d), [_setData])

	const setState = useCallback(
		(d: Partial<IBusinessData>) => {
			if (isEqual(data, d)) return

			const newData = { ...data, ...d }
			Object.keys(d).forEach((key) => {
				if (!data[key]) {
					newData[key] = d[key]
				}
			})

			_setData(newData)
		},
		[_setData, data],
	)
	return {
		data,
		setData,
		setState,
	}
}

export const initializeAllBusiness = (data: IBusinessData) => {
	_useAllBusiness.setState({ data })
}
