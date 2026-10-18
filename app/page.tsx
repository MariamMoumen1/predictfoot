import Link from "next/link";
import { Users, ShieldCheck, CalendarDays, Pencil, Trophy } from "lucide-react";
import { Logo } from "@/components/logo";

const heroBg = {
  backgroundColor: "#0b2447",
  backgroundImage:
    "linear-gradient(90deg, rgba(8,27,63,.75) 0%, rgba(8,27,63,.35) 50%, rgba(8,27,63,.1) 100%), linear-gradient(180deg, rgba(8,27,63,.45) 0%, rgba(8,27,63,0) 40%, rgba(8,40,30,.35) 100%), url('/hero.png'), linear-gradient(180deg,#0b2447 0%,#12407a 60%,#1d6b3a 100%)",
  backgroundSize: "cover",
  backgroundPosition: "center",
};

const steps = [
  { Icon: CalendarDays, t: "1. Choisissez un match", d: "Parmi les matchs disponibles" },
  { Icon: Pencil, t: "2. Faites votre prédiction", d: "Score, vainqueur, etc." },
  { Icon: Trophy, t: "3. Gagnez des points", d: "Et grimpez au classement !" },
];

const stats = [
  { Icon: Users, v: "1 250+", l: "Joueurs" },
  { Icon: ShieldCheck, v: "350", l: "Matchs" },
  { Icon: Users, v: "45", l: "Ligues" },
];

export default function Landing() {
  return (
    <div className="min-h-screen w-full bg-white">
      <section style={heroBg} className="relative flex min-h-screen w-full flex-col px-6 pb-40 pt-6 text-white sm:px-10 lg:px-16 xl:px-24">
        <header className="flex w-full items-center justify-between gap-4">
          <Logo light size={40} />
          <nav className="hidden gap-10 text-base lg:flex">
            <a href="#" className="border-b-2 border-sky-400 pb-1">Accueil</a>
            <a href="#how" className="pb-1 text-white/90 hover:text-white">Comment ça marche ?</a>
            <Link href="/login" className="pb-1 text-white/90 hover:text-white">Classement</Link>
          </nav>
          <div className="flex gap-3">
            <Link href="/login" className="rounded-xl border border-white/70 px-6 py-2.5 text-sm font-medium hover:bg-white/10">Connexion</Link>
            <Link href="/register" className="rounded-xl bg-sky-100 px-6 py-2.5 text-sm font-semibold text-blue-700 hover:bg-white">S&apos;inscrire</Link>
          </div>
        </header>

        <div className="my-auto max-w-3xl py-16">
          <h1 className="text-5xl font-bold leading-[1.1] sm:text-6xl xl:text-7xl">
            Prédisez. Gagnez des points. Grimpez au classement.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/90 sm:text-xl">
            Rejoignez la communauté des passionnés de football et testez vos connaissances !
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/register" className="rounded-full bg-brand px-9 py-4 text-base font-semibold shadow-lg shadow-blue-900/40 hover:bg-blue-600">Commencer maintenant</Link>
            <a href="#how" className="rounded-full border border-white/70 px-9 py-4 text-base font-medium hover:bg-white/10">Découvrir</a>
          </div>
        </div>

        <div className="absolute inset-x-6 bottom-0 translate-y-1/2 sm:inset-x-10 lg:inset-x-16 xl:inset-x-24">
          <div className="grid grid-cols-3 gap-4 rounded-3xl bg-white p-6 text-ink shadow-2xl ring-1 ring-slate-100 sm:p-8">
            {stats.map(({ Icon, v, l }, i) => (
              <div key={i} className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-4">
                <Icon size={34} className="text-brand" />
                <div className="text-center sm:text-left">
                  <p className="text-2xl font-bold sm:text-3xl">{v}</p>
                  <p className="text-sm text-slate-500">{l}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="w-full px-6 pb-24 pt-44 sm:px-10 lg:px-16 xl:px-24">
        <h2 className="mb-14 text-2xl font-bold sm:text-3xl">Comment ça marche ?</h2>
        <div className="relative grid gap-12 md:grid-cols-3">
          <div className="absolute left-[17%] right-[17%] top-8 hidden h-px bg-blue-100 md:block" />
          {steps.map(({ Icon, t, d }) => (
            <div key={t} className="relative text-center">
              <span className="mx-auto mb-5 grid size-16 place-items-center rounded-full bg-blue-50 ring-8 ring-blue-50/60">
                <span className="grid size-11 place-items-center rounded-full bg-brand text-white"><Icon size={20} /></span>
              </span>
              <p className="text-lg font-bold text-[#0b3a9e]">{t}</p>
              <p className="mt-1 text-slate-500">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
