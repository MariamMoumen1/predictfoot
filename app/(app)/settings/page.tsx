import { Camera, User, Lock, Bell, Settings2, ChevronRight } from "lucide-react";
import { requireUser } from "@/lib/data";
import { LogoutButton } from "@/components/logout-button";
import { ProfileForm, PasswordForm } from "@/components/settings-forms";
import { AvatarPicker } from "@/components/avatar-picker";

export default async function SettingsPage() {
  const user = await requireUser();

  const rows = [
    { Icon: Camera, title: "Photo de profil", open: true, body: <AvatarPicker name={user.name} current={user.avatar} /> },
    { Icon: User, title: "Informations personnelles", open: false, body: <ProfileForm initial={{ name: user.name, username: user.username, email: user.email }} /> },
    { Icon: Lock, title: "Mot de passe", open: false, body: <PasswordForm /> },
    { Icon: Bell, title: "Notifications", open: false, body: <p className="text-sm text-slate-500">Les notifications arrivent bientôt.</p> },
    { Icon: Settings2, title: "Préférences", open: false, body: <p className="text-sm text-slate-500">Langue : Français</p> },
  ];

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-3xl font-bold">Paramètres</h1>
      {rows.map(({ Icon, title, open, body }) => (
        <details key={title} open={open} className="group rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
          <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-5 font-semibold [&::-webkit-details-marker]:hidden">
            <Icon size={22} className="text-slate-600" />
            <span className="flex-1">{title}</span>
            <ChevronRight size={20} className="text-slate-400 transition group-open:rotate-90" />
          </summary>
          <div className="px-5 pb-5">{body}</div>
        </details>
      ))}
      <div className="pt-6"><LogoutButton variant="row" /></div>
    </div>
  );
}
