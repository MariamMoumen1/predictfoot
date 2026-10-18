"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Trash2 } from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";

const PRESETS = ["Felix", "Aneka", "Mia", "Leo", "Zoe", "Max", "Nina", "Omar", "Sara", "Yass"].map(
  (s) => `https://api.dicebear.com/9.x/avataaars/svg?seed=${s}&backgroundColor=b6e3f4`
);

// Recadre au carré (centre) et réduit à 256 px : une photo de 5 Mo devient ~20 Ko.
function toSquareJpeg(file: File, side = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const s = Math.min(img.width, img.height);
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = side;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas indisponible"));
      ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, side, side);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image illisible (utilise un fichier JPG, PNG ou WebP)"));
    };
    img.src = url;
  });
}

export function AvatarPicker({ name, current }: { name: string; current: string | null }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(current);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function save(value: string | null) {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/me/avatar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: value }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setPreview(value);
        setMsg({ ok: true, text: value ? "Photo enregistrée ✅" : "Photo supprimée" });
        router.refresh();
      } else setMsg({ ok: false, text: data.error ?? `Erreur ${res.status}` });
    } catch {
      setMsg({ ok: false, text: "Impossible de joindre le serveur" });
    }
    setBusy(false);
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return setMsg({ ok: false, text: "Choisis un fichier image" });
    if (file.size > 15 * 1024 * 1024) return setMsg({ ok: false, text: "Image trop lourde (15 Mo maximum)" });
    try {
      await save(await toSquareJpeg(file));
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Erreur" });
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-5">
        <UserAvatar name={name} avatar={preview} size={96} />
        <div className="space-y-2">
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={onFile} className="hidden" />
          <button
            type="button"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-300 hover:bg-blue-700 disabled:opacity-60"
          >
            <Upload size={16} /> Importer une photo
          </button>
          {preview && (
            <button
              type="button"
              disabled={busy}
              onClick={() => save(null)}
              className="flex items-center gap-2 text-sm font-medium text-red-600 hover:underline disabled:opacity-60"
            >
              <Trash2 size={14} /> Supprimer ma photo
            </button>
          )}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-slate-600">Ou choisis un avatar</p>
        <div className="grid grid-cols-5 gap-3 sm:grid-cols-10">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              disabled={busy}
              onClick={() => save(p)}
              className={`overflow-hidden rounded-full ring-2 transition hover:scale-105 ${preview === p ? "ring-brand" : "ring-transparent"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p} alt="" className="aspect-square w-full" />
            </button>
          ))}
        </div>
      </div>

      {msg && <p className={`text-sm ${msg.ok ? "text-green-600" : "text-red-600"}`}>{msg.text}</p>}
    </div>
  );
}
