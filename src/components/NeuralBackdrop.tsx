import Image from "next/image";

export default function NeuralBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-28 -right-32 h-96 w-96 rounded-full bg-[#00e5ff]/60 blur-3xl pulse-aura" />
      <div className="absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-[#00e5ff]/35 blur-3xl " />

      <svg
        className="absolute inset-0 h-full w-full opacity-40"
        viewBox="0 0 1200 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path className="spline-base" d="M120 170 C 280 120, 360 230, 520 190" />
        <path className="spline-base" d="M520 190 C 700 150, 790 260, 980 210" />
        <path className="spline-base spline-soft" d="M180 120 C 330 65, 470 95, 640 110" />
        <path className="spline-base spline-soft" d="M640 110 C 820 130, 940 95, 1110 140" />

        <path className="spline-base" d="M220 630 C 380 580, 470 700, 650 650" />
        <path className="spline-base" d="M650 650 C 790 610, 920 710, 1070 670" />
        <path className="spline-base spline-soft" d="M130 560 C 320 515, 500 565, 710 548" />
        <path className="spline-base spline-soft" d="M710 548 C 890 540, 990 585, 1130 560" />
        <path className="spline-base spline-faint" d="M330 290 C 500 250, 650 295, 820 270" />
        <path className="spline-base spline-faint" d="M350 470 C 530 440, 700 500, 890 470" />

        <path className="spline-pulse" d="M120 170 C 280 120, 360 230, 520 190" />
        <path className="spline-pulse pulse-delay-1" d="M520 190 C 700 150, 790 260, 980 210" />
        <path className="spline-pulse pulse-delay-2" d="M220 630 C 380 580, 470 700, 650 650" />
        <path className="spline-pulse pulse-delay-3" d="M650 650 C 790 610, 920 710, 1070 670" />
        <path className="spline-pulse pulse-delay-1" d="M330 290 C 500 250, 650 295, 820 270" />
        <path className="spline-pulse pulse-delay-2" d="M350 470 C 530 440, 700 500, 890 470" />
      </svg>

      <Image src="/drone1.png" alt="" width={74} height={74} className="absolute left-[10%] top-[21.2%] z-20 h-auto w-[72px] -translate-x-1/2 -translate-y-1/2 opacity-95 drop-shadow-[0_0_12px_rgba(0,229,255,0.65)]" />

      <Image src="/drone2.png" alt="" width={88} height={88} className="absolute left-[43.3%] top-[23.7%] z-20 h-auto w-[84px] -translate-x-1/2 -translate-y-1/2 opacity-95 drop-shadow-[0_0_12px_rgba(0,229,255,0.65)]" />

      <Image src="/drone3.png" alt="" width={78} height={78} className="absolute left-[81.7%] top-[26.2%] z-20 h-auto w-[76px] -translate-x-1/2 -translate-y-1/2 opacity-95 drop-shadow-[0_0_12px_rgba(0,229,255,0.65)]" />

      <Image src="/drone4.png" alt="" width={76} height={76} className="absolute left-[18.3%] top-[78.7%] z-20 h-auto w-[72px] -translate-x-1/2 -translate-y-1/2 opacity-95 drop-shadow-[0_0_12px_rgba(0,229,255,0.65)]" />

      <Image src="/drone5.png" alt="" width={92} height={92} className="absolute left-[54.2%] top-[81.2%] z-20 h-auto w-[90px] -translate-x-1/2 -translate-y-1/2 opacity-95 drop-shadow-[0_0_12px_rgba(0,229,255,0.65)]" />

      <Image src="/drone6.png" alt="" width={78} height={78} className="absolute left-[89.2%] top-[83.7%] z-20 h-auto w-[76px] -translate-x-1/2 -translate-y-1/2 opacity-95 drop-shadow-[0_0_12px_rgba(0,229,255,0.65)]" />
    </div>
  );
}