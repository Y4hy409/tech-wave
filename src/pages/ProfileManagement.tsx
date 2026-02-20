import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload } from "lucide-react";

import { AppLayout } from "@/components/AppLayout";
import { readSessionUser, writeSessionUser } from "@/lib/userProfile";

export default function ProfileManagement() {
  const navigate = useNavigate();
  const [name, setName] = useState("Priya Sharma");
  const [phone, setPhone] = useState("+91 9876543210");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"resident" | "admin" | "staff">("resident");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    const session = readSessionUser();
    if (!session) return;
    setName(session.name);
    setRole(session.role);
    if (session.phone) {
      setPhone(session.phone);
    }
    const image = localStorage.getItem("fixora_profile_image");
    if (image) setProfileImage(image);
  }, []);

  const saveProfile = () => {
    writeSessionUser({ name, role, phone });
    if (profileImage) {
      localStorage.setItem("fixora_profile_image", profileImage);
    }
  };

  return (
    <AppLayout role={role} userName={name}>
      <div className="mx-auto max-w-2xl space-y-5 p-6 lg:p-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="rounded-xl border border-border bg-card p-5">
          <h1 className="text-xl font-bold text-foreground">Profile Management</h1>
          <p className="text-sm text-muted-foreground">Update your details and login credentials.</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <label className="block text-sm font-medium text-foreground">
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm font-medium text-foreground">
            Phone
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm font-medium text-foreground">
            Change Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              placeholder="New password"
            />
          </label>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
            <Upload className="h-4 w-4" />
            Upload profile image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  if (typeof reader.result === "string") {
                    setProfileImage(reader.result);
                  }
                };
                reader.readAsDataURL(file);
              }}
            />
          </label>
          {profileImage && (
            <img src={profileImage} alt="Profile" className="h-24 w-24 rounded-full object-cover border border-border mx-auto" />
          )}
          <button onClick={saveProfile} className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">
            Save Profile
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
