"use client";

import { clubColors } from "@/components/football/club-crest";
import { MEDIA } from "@/lib/media";
import { useActiveCareer, useStoreHydrated } from "@/state/career-store";

/**
 * Luz ambiente fixa atrás do vidro: refletores tingidos com a cor do clube da
 * carreira ativa. Quando houver foto em `MEDIA.backdrop`, ela entra por baixo.
 */
export function Backdrop() {
  const career = useActiveCareer();
  const hydrated = useStoreHydrated();
  const [club] = clubColors(hydrated ? career.currentClub : "");
  const tint = hydrated ? club : "#1f9d5a";

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-bg"
    >
      {MEDIA.backdrop ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={MEDIA.backdrop}
          alt=""
          className="absolute inset-0 size-full object-cover opacity-45"
        />
      ) : null}
      <div
        className="absolute inset-0 transition-[background] duration-700"
        style={{
          background: [
            `radial-gradient(60% 45% at 12% 0%, ${tint}aa 0%, transparent 70%)`,
            "radial-gradient(40% 35% at 95% 8%, rgb(255 214 150 / 0.28) 0%, transparent 70%)",
            "radial-gradient(60% 50% at 70% 100%, rgb(60 100 220 / 0.30) 0%, transparent 70%)",
          ].join(","),
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgb(5_11_24/0.35)_60%,rgb(5_11_24/0.7)_100%)]" />
    </div>
  );
}
