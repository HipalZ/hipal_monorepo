import { memo } from "react";

function MemoExploreSkelton() {
  return (
    <main
      role="status"
      className="min-h-dvh w-full bg-[#F8F4EF] pb-[5rem] plus-jakarta-font"
    >
      <div className="mx-auto w-full max-w-[30rem] animate-pulse px-3 pt-3">
        <div className="relative h-[16.25rem] w-full overflow-hidden rounded-[1.25rem] bg-[#E7DDD4]">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        </div>

        <div className="mt-5 px-1">
          <div className="h-5 w-[38%] rounded-full bg-[#D8CCC1]" />
          <div className="mt-2 h-3 w-[46%] rounded-full bg-[#E4D9CE]" />
        </div>

        <section className="mt-4 grid grid-cols-4 gap-2">
          <div className="h-12 rounded-2xl bg-white shadow-[0_6px_16px_rgba(72,49,37,0.05)]" />
          <div className="h-12 rounded-2xl bg-[#D8A9BC] shadow-[0_6px_16px_rgba(72,49,37,0.05)]" />
          <div className="h-12 rounded-2xl bg-white shadow-[0_6px_16px_rgba(72,49,37,0.05)]" />
          <div className="h-12 rounded-2xl bg-white shadow-[0_6px_16px_rgba(72,49,37,0.05)]" />
        </section>

        <div className="mt-6 h-4 w-[42%] rounded-full bg-[#D8CCC1]" />

        <section className="mt-4 grid grid-cols-2 gap-3">
          <div className="aspect-square rounded-[1.75rem] bg-[#E3D7CB]" />
          <div className="aspect-square rounded-[1.75rem] bg-[#DDD5CD]" />
          <div className="aspect-square rounded-[1.75rem] bg-[#DDD5CD]" />
          <div className="aspect-square rounded-[1.75rem] bg-[#E3D7CB]" />
        </section>
      </div>
    </main>
  );
}
const ExploreSkelton = memo(MemoExploreSkelton);
export default ExploreSkelton;
