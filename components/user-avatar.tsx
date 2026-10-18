"use client";

import { useState } from "react";

const EXTS = ["svg", "png", "webp", "jpg"];

// Ordre : photo choisie par l'utilisateur -> fichier public/avatars/<prénom>.* -> initiales
export function UserAvatar({ name, size = 36, avatar }: { name: string; size?: number; avatar?: string | null }) {
  const [bad, setBad] = useState(false);
  const [i, setI] = useState(0);
  const style = { width: size, height: size };

  if (avatar && !bad) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={avatar} alt="" style={style} className="shrink-0 rounded-full object-cover" onError={() => setBad(true)} />
    );
  }
  if (i < EXTS.length) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`/avatars/${name.toLowerCase()}.${EXTS[i]}`}
        alt=""
        style={style}
        className="shrink-0 rounded-full object-cover"
        onError={() => setI(i + 1)}
      />
    );
  }
  return (
    <span
      style={{ ...style, fontSize: size * 0.36 }}
      className="grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 font-semibold text-blue-700"
    >
      {name.slice(0, 2).toUpperCase()}
    </span>
  );
}
