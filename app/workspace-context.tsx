"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { Entry, Profile, defaultProfile } from "@/lib/learning";
export async function api(path: string, body?: unknown, method = "POST") {
  const r = await fetch(
    `/api/${path}`,
    body === undefined
      ? { cache: "no-store" }
      : {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
  );
  const data: any = await r.json();
  if (!r.ok) throw new Error(data.error || "Request failed. Please retry.");
  return data;
}
type Workspace = {
  entries: Entry[];
  profile: Profile;
  files: any[];
  ready: boolean;
  hasProfile: boolean;
  loading: boolean;
  error: string;
  notice: string;
  setNotice: (s: string) => void;
  reload: () => Promise<void>;
  save: (
    kind: string,
    title: string,
    data: Record<string, any>,
  ) => Promise<Entry>;
  remove: (id: string) => Promise<void>;
  saveProfile: (p: Profile) => Promise<void>;
  addEntry: (e: Entry) => void;
  updateSheet: (id: string, status: string) => Promise<void>;
};
const Context = createContext<Workspace | null>(null);
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<Entry[]>([]),
    [profile, setProfile] = useState(defaultProfile),
    [files, setFiles] = useState<any[]>([]),
    [ready, setReady] = useState(false),
    [hasProfile, setHasProfile] = useState(true),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const reload = useCallback(async () => {
    setError("");
    try {
      const d = await api("workspace");
      setEntries(d.entries);
      setProfile(d.profile.timezoneMode === "manual" ? d.profile : {
        ...d.profile, timezoneMode: "automatic",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      });
      setFiles(d.files);
      setReady(d.aiReady);
      setHasProfile(d.hasProfile);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void reload();
  }, [reload]);
  useEffect(() => {
    const sync = () => setProfile(p => {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      return p.timezoneMode === "manual" || p.timezone === timezone ? p : { ...p, timezoneMode: "automatic", timezone };
    });
    const timer = setInterval(sync, 60000);
    window.addEventListener("focus", sync);
    return () => { clearInterval(timer); window.removeEventListener("focus", sync); };
  }, []);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 6500);
    return () => clearTimeout(t);
  }, [notice]);
  const addEntry = (e: Entry) => setEntries((p) => [e, ...p]);
  const save = async (
    kind: string,
    title: string,
    data: Record<string, any>,
  ) => {
    const r = await api("workspace", { kind, title, data });
    addEntry(r.entry);
    setNotice(r.githubSync?.status === "pushed" ? "Solution saved and pushed to GitHub." : r.githubSync?.status === "failed" ? "Solution saved. GitHub push failed; retry in GitHub settings." : "Saved to your workspace.");
    return r.entry;
  };
  const remove = async (id: string) => {
    await api("workspace", { id }, "DELETE");
    setEntries((p) => p.filter((e) => e.id !== id));
    setNotice("Entry deleted.");
  };
  const saveProfile = async (p: Profile) => {
    await api("workspace", { action: "profile", profile: p });
    setProfile(p);
    setHasProfile(true);
    setNotice("Preferences saved.");
  };
  const updateSheet = async (id: string, status: string) => {
    const r = await api("workspace", { id, status }, "PATCH");
    setEntries((p) => p.map((e) => (e.id === id ? r.entry : e)));
    setNotice("Sheet progress updated.");
  };
  return (
    <Context.Provider
      value={{
        entries,
        profile,
        files,
        ready,
        hasProfile,
        loading,
        error,
        notice,
        setNotice,
        reload,
        save,
        remove,
        saveProfile,
        addEntry,
        updateSheet,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useWorkspace() {
  const c = useContext(Context);
  if (!c) throw new Error("Missing workspace");
  return c;
}
