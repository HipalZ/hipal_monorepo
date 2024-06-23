import { create } from 'zustand';

interface State {
  inTime: string;
  outTime: string;
  timeStampStart: number;
  timeStampEnd: number;
  dayIn: string;
  dayOut: string;
  pickDate: string;
  status: string;
  rating: string;
  selectedRange: string;
  setSelectedRange: (selectedRange: string) => void;
  setInTime: (inTime: string) => void;
  setOutTime: (outTime: string) => void;
  setTimeStampStart: (timeStampStart: number) => void;
  setTimeStampEnd: (timeStampEnd: number) => void;
  setPickDate: (pickDate: string) => void;
  setDayIn: (dayIn: string) => void;
  setDayOut: (dayOut: string) => void;
  setStatus: (status: string) => void;
  setRating: (rating: string) => void;
}

const useTimings = create<State>((set) => ({
  inTime: '',
  outTime: '',
  timeStampStart: 0,
  timeStampEnd: 0,
  dayIn: '',
  dayOut: '',
  pickDate: '',
  status: '',
  rating: '',
  selectedRange: 'today',
  setSelectedRange: (selectedRange) => set({ selectedRange }),
  setInTime: (inTime) => set({ inTime }),
  setOutTime: (outTime) => set({ outTime }),
  setTimeStampStart: (timeStampStart) => set({ timeStampStart }),
  setTimeStampEnd: (timeStampEnd) => set({ timeStampEnd }),
  setDayIn: (dayIn) => set({ dayIn }),
  setPickDate: (pickDate) => set({ pickDate }),
  setDayOut: (dayOut) => set({ dayOut }),
  setStatus: (status) => set({ status }),
  setRating: (rating) => set({ rating }),
}));

export default useTimings;
