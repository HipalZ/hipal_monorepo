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
  setSelectedRange: (selectedRange:string) => set({ selectedRange }),
  setInTime: (inTime:string) => set({ inTime }),
  setOutTime: (outTime:string) => set({ outTime }),
  setTimeStampStart: (timeStampStart:number) => set({ timeStampStart }),
  setTimeStampEnd: (timeStampEnd:number) => set({ timeStampEnd }),
  setDayIn: (dayIn:string) => set({ dayIn }),
  setPickDate: (pickDate:string) => set({ pickDate }),
  setDayOut: (dayOut:string) => set({ dayOut }),
  setStatus: (status:string) => set({ status }),
  setRating: (rating:string) => set({ rating }),
}));

export default useTimings;
