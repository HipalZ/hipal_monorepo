// useDataStore.js
import {create} from 'zustand';
import type { Dish, Extra, IAddOn, ICategory, ICharges, IKitchen } from '../types/businessData';

export interface IData {
  categories?: ICategory[];
  dishes?: Dish[];
  extras?: Extra[];
  kitchens?: IKitchen[];
  charges?: ICharges[];
  addOns?: IAddOn[];
};

interface IItemStoreState {
    data: IData;
    setData: (newData: IData | ((prevData: IData) => IData)) => void;
  }
  const useItemStore = create<IItemStoreState>((set) => ({
    data: {
      categories: [],
      dishes: [],
      extras: [],
      kitchens: [],
      charges: [],
      addOns: [],
    },
    // The newData parameter can be an IData object or a function that returns an IData object
    setData: (newData) => set((state) => ({
      data: typeof newData === 'function' ? newData(state.data) : newData
    }))
  }));

export default useItemStore;
