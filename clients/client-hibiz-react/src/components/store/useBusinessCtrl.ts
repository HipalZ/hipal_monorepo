import {create} from 'zustand';

interface BusinessCtrl {
    step:number;
    setStep:(step:number)=>void;
    exploreLayout:string;
    menuLayout:string;
    setExploreLayout:(layout:string)=>void;
    setMenuLayout:(layout:string)=>void;
    primaryColor:string;
    setPrimaryColor:(color:string)=>void;
    secondaryColor:string;
    setSecondaryColor:(color:string)=>void;

    //create business
    businessType:string;
    setBusinessType:(type:string)=>void;
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
    exploreLayout:'',
    menuLayout:'',
    setExploreLayout:(layout:string)=>set({exploreLayout:layout}),
    setMenuLayout:(layout:string)=>set({menuLayout:layout}),
    primaryColor:'',
    setPrimaryColor:(color:string)=>set({primaryColor:color}),
    secondaryColor:'',
    setSecondaryColor:(color:string)=>set({secondaryColor:color}),
    businessType:'',
    setBusinessType:(type:string)=>set({businessType:type}),
    outletType:'',
    setOutletType:(type:string)=>set({outletType:type}),
    businessName:'',
    setBusinessName:(name:string)=>set({businessName:name}),
    customLink:'',
    setCustomLink:(link:string)=>set({customLink:link}),
}));

export default useBusinessCtrl;