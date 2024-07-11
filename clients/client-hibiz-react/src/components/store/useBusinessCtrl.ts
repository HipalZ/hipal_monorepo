import {create} from 'zustand';
export type businessType = "FOOD" | "OTHER" | ""
export type MenuLayout = 'MAIN_CATEGORY'|'MAIN_AND_SUB_CATEGORY'
export type exploreLayout ='BUTTER'| 'SUNFLOWER'
interface BusinessCtrl {
    step:number;
    setStep:(step:number)=>void;
    exploreLayout:exploreLayout;
    menuLayout:MenuLayout;
    setExploreLayout:(layout:exploreLayout)=>void;
    setMenuLayout:(layout:MenuLayout)=>void;
    primaryColor:string;
    setPrimaryColor:(color:string)=>void;
    secondaryColor:string;
    setSecondaryColor:(color:string)=>void;

    //create business
    businessType:businessType;
    setBusinessType:(type:businessType)=>void;
    outletType:string;
    setOutletType:(type:string)=>void;
    businessName:string;
    setBusinessName:(name:string)=>void;
    customLink:string;
    setCustomLink:(link:string)=>void;
}

const useBusinessCtrl = create<BusinessCtrl>((set)=>({
    step:0,
    setStep:(step:number)=>set({step}),
    exploreLayout:'BUTTER',
    setExploreLayout:(layout:exploreLayout)=>set({exploreLayout:layout}),
    menuLayout:'MAIN_AND_SUB_CATEGORY',
    setMenuLayout:(layout:MenuLayout)=>set({menuLayout:layout}),
    primaryColor:'',
    setPrimaryColor:(color:string)=>set({primaryColor:color}),
    secondaryColor:'',
    setSecondaryColor:(color:string)=>set({secondaryColor:color}),
    businessType:'',
    setBusinessType:(type:businessType)=>set({businessType:type}),
    outletType:'',
    setOutletType:(type:string)=>set({outletType:type}),
    businessName:'',
    setBusinessName:(name:string)=>set({businessName:name}),
    customLink:'',
    setCustomLink:(link:string)=>set({customLink:link}),
}));

export default useBusinessCtrl;