import { FLOW, FLOW_TYPES, PAGE_TYPES, routePaths } from '@components/utils/routes'
import { isEmpty } from 'lodash-es'
import { useRouter } from 'next/router'
import { useCallback, useMemo } from 'react'
import { _useAllBusiness } from './useAllBusiness'

function useRoutingFlow() {
	const router = useRouter()
	const businessId = useMemo(() => router?.query?.businessId as string, [router])
	const businessData = _useAllBusiness((s) => s.data)

	/**
	 * Get business flow type from the api's store
	 * @returns {string} flow type
	 */
	const businessFlowType = useMemo(() => {
		if (isEmpty(businessData?.settings?.navigation?.to)) return FLOW_TYPES.DEFAULT

		const _flowType = businessData?.settings?.navigation?.to?.toLowerCase()
		for (let type in FLOW_TYPES)
			if (FLOW_TYPES[type].toLowerCase() === _flowType) return FLOW_TYPES[type]

		return FLOW_TYPES.DEFAULT
	}, [businessData?.settings?.navigation?.to])

	/**
	 * Get current path key from the router
	 * @returns {string} path key
	 */
	const pathKey = useMemo(() => {
		const dishId = (router?.query?.dishId || '') as string
		const currentPath = (router.asPath || '').split('#')?.[0]

		for (const key in routePaths) {
			if (routePaths[key](businessId, dishId) === currentPath) return key
		}

		return PAGE_TYPES.EXPLORER
	}, [businessId, router])

	const getNextPath = useCallback(
		(dishIdOrCategoryId?: string) =>
			FLOW?.[businessFlowType]?.[pathKey]?.to(businessId, dishIdOrCategoryId)
				? `${FLOW[businessFlowType][pathKey].to(businessId, dishIdOrCategoryId)}`
				: undefined,
		[businessFlowType, businessId, pathKey],
	)

	const getPreviousPath = useCallback(
		(dishIdOrCategoryId?: string) =>
			FLOW?.[businessFlowType]?.[pathKey]?.from(businessId, dishIdOrCategoryId)
				? `${FLOW[businessFlowType][pathKey].from(businessId, dishIdOrCategoryId)}`
				: undefined,
		[businessFlowType, businessId, pathKey],
	)

	return { getNextPath, getPreviousPath }
}

export { useRoutingFlow }
