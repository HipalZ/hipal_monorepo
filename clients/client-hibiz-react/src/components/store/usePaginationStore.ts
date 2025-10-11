import { createWithEqualityFn } from "zustand/traditional";

interface IPagination {
  pageNumber: number;
  setPageNumber: (pageNumber: number) => void;

  handleClick: (page: number) => void;
  dataLength: number;
  setDateLength: (dataLength: number) => void;

  selectedQrId?: string | undefined;
  setSelectedQrId: (id?: string) => void;
}

const usePaginationStore = createWithEqualityFn<IPagination>((set) => ({
  pageNumber: 1,
  setPageNumber: (pageNumber: number) => set({ pageNumber }),

  selectedQrId: undefined,
  setSelectedQrId: (id?: string) => set({ selectedQrId: id }),

  handleClick: (page: number) => {
    if (page < 1) return;
    set({ pageNumber: page });
  },

  dataLength: 1,
  setDateLength: (dataLength: number) => set({ dataLength }),
}));

export default usePaginationStore;
