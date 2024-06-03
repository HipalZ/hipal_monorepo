import MainTypes from '@components/molecules/categoryTypes/mainTypes'
import SubTypes from '@components/molecules/categoryTypes/subTypes'
import { _useAllBusiness } from '@components/store/useAllBusiness'
import { useDishTypes } from '@components/store/useDishTypes'
import { memo, useEffect, useMemo } from 'react'

function DishesTypes({
	hideMainTypes,
	hideSubTypes,
}: {
	hideMainTypes?: boolean
	hideSubTypes?: boolean
}) {
	const setActiveDishTypes = useDishTypes((s) => s.setActiveDishTypes)
	const activeDishTypes = useDishTypes((s) => s.activeDishTypes)
	const data = _useAllBusiness((s) => s.data)
	const allCategoriesTypes = useMemo(() => data?.allCategoriesTypes, [data?.allCategoriesTypes])
	const mainTypes = useMemo(() => allCategoriesTypes?.main, [allCategoriesTypes?.main])
	const subTypes = useMemo(() => allCategoriesTypes?.sub, [allCategoriesTypes?.sub])

	useEffect(() => {
		if (
			!activeDishTypes.activeMainType &&
			!activeDishTypes.activeSubType &&
			window &&
			!window.location.href.includes('#')
		) {
			const activeMainType = Object.keys(mainTypes || {})?.[0] || null
			const activeSubType = Object.keys(subTypes?.[activeMainType || ''] || {})?.[0] || null

			setActiveDishTypes({
				activeMainType: activeMainType,
				activeSubType: activeSubType,
			})
		}
	}, [data])

	return (
		<div className="flex flex-col w-full">
			<MainTypes />
			<SubTypes />
		</div>
	)
}

export default memo(DishesTypes)
