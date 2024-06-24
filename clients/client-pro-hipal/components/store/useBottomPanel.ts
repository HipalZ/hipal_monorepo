import { useRef } from 'react'
import { create } from 'zustand'

interface IUseBottomPanel {
	openedBottomPanels: object
	openBottomPanel: (panelName: string) => void
	closeBottomPanel: (panelName: string) => void
	isBottomPanelOpened: (panelName: string) => boolean
	validationRef: boolean
	setValidationRef: (validationRef: boolean) => void
	validationExtras: Array<boolean>
	setValidationExtras: (validationExtras: Array<boolean>) => void
	bounceButton: boolean
	setBounceButton: (bounceButton: boolean) => void
	variantType: string | undefined
	setVariantType: (variantType: string | undefined) => void
	displayAlert: boolean
	setDisplayAlert: (displayAlert: boolean) => void
}

export const useBottomPanel = create<IUseBottomPanel>((set, get) => ({
	openedBottomPanels: {},
	openBottomPanel: (panelId: string) =>
		set((state) => ({
			openedBottomPanels: {
				...state.openedBottomPanels,
				[`${panelId}`]: true,
			},
		})),
	closeBottomPanel: (panelId: string) =>
		set((state) => ({
			openedBottomPanels: {
				...state.openedBottomPanels,
				[`${panelId}`]: false,
			},
		})),
	isBottomPanelOpened: (panelId: string) => get().openedBottomPanels[`${panelId}`] || false,
	validationRef: false,
	setValidationRef: (validationRef: boolean) => set((state) => ({ ...state, validationRef })),
	validationExtras: [],
	setValidationExtras: (extras) => set({ validationExtras: extras }),
	bounceButton: true,
	setBounceButton: (bounceButton) => set({ bounceButton }),
	variantType: '',
	setVariantType: (variantType) => set({ variantType: variantType }),
	displayAlert: false,
	setDisplayAlert: (displayAlert) => set({ displayAlert: displayAlert }),
}))
