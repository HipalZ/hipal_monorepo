import {create} from "zustand"

type AspectRatio = "1:1" | "4:3" | "16:9" | "custom"


interface QrState {
    generateQr: boolean
    setGenerateQr: (generateQr: boolean) => void

    aspectRatio: AspectRatio
    setAspectRatio: (aspectRatio: AspectRatio) => void

    width: number
    setWidth: (width: number) => void

    height: number
    setHeight: (height: number) => void

    isPortrait: boolean
    setIsPortrait: (isPortrait: boolean) => void

    image: string | null
    setImage: (image: string | null) => void

    imageRotation: number
    setImageRotation: (imageRotation: number) => void

    qrSize: number
    setQrSize: (qrSize: number) => void

    tableName: string
    setTableName: (tableName: string) => void

    currentQrValue: string
    setCurrentQrValue: (currentQrValue: string) => void

    showTables: boolean
    setShowTables: (showTables: boolean) => void

    hideTableNames: boolean
    setHideTableNames: (hideTableNames: boolean) => void

    editTextModal: boolean
    setEditTextModal: (editTextModal: boolean) => void
    toggleEditTextModal: () => void

    textColor: string
    setTextColor: (color: string) => void

    textFont: string
    setTextFont: (font: string) => void

    hasBackground: boolean
    setHasBackground: (has: boolean) => void

    backgroundColor: string
    setBackgroundColor: (color: string) => void

    textSize: number
  setTextSize: (size: number) => void

  fontWeight: string
  setFontWeight: (weight: string) => void

  isItalic: boolean
  setIsItalic: (italic: boolean) => void

  isUnderlined: boolean
  setIsUnderlined: (underlined: boolean) => void

}

export const useQr = create<QrState>((set) => ({
    generateQr: false,
    setGenerateQr: (generateQr) => set({generateQr}),

    aspectRatio: "1:1",
    setAspectRatio: (aspectRatio) => set({aspectRatio}),

    width: 300,
    setWidth: (width) => set({width}),

    height: 300,
    setHeight: (height) => set({height}),

    isPortrait: false,
    setIsPortrait: (isPortrait) => set({isPortrait}),

    image: null,
    setImage: (image) => set({image}),

    imageRotation: 0,
    setImageRotation: (imageRotation) => set({imageRotation}),

    qrSize: 1080,
    setQrSize: (qrSize) => set({qrSize}),

    tableName: "Test",
    setTableName: (tableName) => set({tableName}),

    currentQrValue: "https://example.com",
    setCurrentQrValue: (currentQrValue) => set({currentQrValue}),

    showTables: false,
    setShowTables: (showTables) => set({showTables}),

    hideTableNames: false,
    setHideTableNames: (hideTableNames) => set({hideTableNames}),

    editTextModal: false,
    setEditTextModal: (editTextModal) => set({editTextModal}),
    toggleEditTextModal: () => set((state) => ({editTextModal: !state.editTextModal})),

    textColor: "black",
    setTextColor: (textColor) => set({textColor}),

    textFont: "Arial",
    setTextFont: (textFont) => set({textFont}),

    hasBackground: false,
    setHasBackground: (hasBackground) => set({hasBackground}),
    backgroundColor: "white",
    setBackgroundColor: (backgroundColor) => set({backgroundColor}),

    textSize: 16,
    setTextSize: (size) => set({ textSize: size }),
    
    fontWeight: "font-normal",
    setFontWeight: (weight) => set({ fontWeight: weight }),
    isItalic: false,
    setIsItalic: (italic) => set({ isItalic: italic }),
    isUnderlined: false,
    setIsUnderlined: (underlined) => set({ isUnderlined: underlined }),
}))