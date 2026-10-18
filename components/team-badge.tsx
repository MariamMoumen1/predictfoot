"use client";

import { useState } from "react";

export function slug(name: string) {
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-");
}

// Le logo vient de l'API football-data.org (champ Team.logo). Sans logo : initiales.
export function TeamBadge({ name, size = 40, logo }: { name: string; size?: number; logo?: string | null }) {
  const [failed, setFailed] = useState(false);
  if (logo && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logo}
        alt={name}
        style={{ width: size, height: size }}
        className="shrink-0 object-contain"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <span
      style={{ width: size, height: size, fontSize: size * 0.3 }}
      className="grid shrink-0 place-items-center rounded-full border bg-white font-bold text-ink shadow-sm"
    >
      {name.slice(0, 3).toUpperCase()}
    </span>
  );
}
