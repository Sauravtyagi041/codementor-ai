"use client";
import { useEffect, useState } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Code2,
  LayoutDashboard,
  BrainCircuit,
  ChartNoAxesCombined,
  Route,
  BookOpen,
  Trophy,
  GitBranch,
  UserRound,
  Settings,
  Flame,
  Sparkles,
  ChevronRight,
  GraduationCap,
  ListChecks,
  Swords,
  Network,
  NotebookPen,
  Users,
  Mic,
  Moon,
  Sun,
} from "lucide-react";
import { WorkspaceProvider, useWorkspace } from "./workspace-context";
import { statistics } from "@/lib/learning";
import { CodeStudio } from "./code-tools";
import { Overview, Practice, Insights, Roadmap } from "./learning-views";
import { Curriculum, Sheets, Competitive } from "./curriculum-views";
import {
  Contests,
  Notes,
  GitHubView,
  Portfolio,
  Peers,
  SettingsView,
} from "./journey-tools";
import { VisualLab, Interview } from "./visual-tools";
import Onboarding from "./onboarding";
import { FloatingMentor } from "./floating-mentor";
const groups = [
  [
    "WORKSPACE",
    [
      ["Overview", LayoutDashboard],
      ["Code studio", Code2],
    ],
  ],
  [
    "LEARN & PRACTISE",
    [
      ["Zero to hero", GraduationCap],
      ["Practice & quizzes", BookOpen],
      ["Competitive coding", Swords],
      ["Sheet library", ListChecks],
      ["Visual lab", Network],
      ["Notes", NotebookPen],
    ],
  ],
  [
    "YOUR GROWTH",
    [
      ["Insights", ChartNoAxesCombined],
      ["My roadmap", Route],
      ["Contests", Trophy],
      ["Mock interviews", Mic],
      ["Peer challenges", Users],
    ],
  ],
  [
    "YOUR PROFILE",
    [
      ["GitHub", GitBranch],
      ["Portfolio", UserRound],
      ["Settings", Settings],
    ],
  ],
] as const;
function Shell() {
  const w = useWorkspace();
  const [active, setActive] = useState("Overview"),
    [dark, setDark] = useState(false);
  const s = statistics(w.entries, w.profile);
  function navigate(name: string) {
    setActive(name);
    history.replaceState(null, "", "#" + encodeURIComponent(name));
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  useEffect(()=>{const listener=(e:Event)=>{const name=(e as CustomEvent).detail;if(groups.some(g=>g[1].some(i=>i[0]===name)))navigate(name);};window.addEventListener("codementor-navigate",listener);return()=>window.removeEventListener("codementor-navigate",listener);},[]);
  useEffect(() => {
    const hash = decodeURIComponent(location.hash.slice(1));
    if (groups.some((g) => g[1].some((i) => i[0] === hash))) setActive(hash);
    const preference = localStorage.getItem("codementor-theme");
    setDark(preference === "dark");
    document.documentElement.classList.toggle("dark", preference === "dark");
  }, []);
  function theme() {
    setDark(!dark);
    localStorage.setItem("codementor-theme", dark ? "light" : "dark");
    document.documentElement.classList.toggle("dark", !dark);
  }
  useEffect(() => {
    const context = (document as any).modelContext;
    if (!context?.registerTool) return;
    const life = new AbortController();
    Promise.resolve(
      context.registerTool(
        {
          name: "open_coding_section",
          title: "Open coding section",
          description:
            "Navigate to a CodeMentor learning section. Does not create or change progress.",
          inputSchema: {
            type: "object",
            properties: {
              section: {
                type: "string",
                enum: groups.flatMap((g) => g[1].map((i) => i[0])),
              },
            },
            required: ["section"],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: true },
          execute: (input: any) => {
            if (!groups.some((g) => g[1].some((i) => i[0] === input.section)))
              throw new Error("Unknown section");
            navigate(input.section);
            return { opened: input.section };
          },
        },
        { signal: life.signal },
      ),
    ).catch(() => {});
    return () => life.abort();
  }, []);
  const views: Record<string, React.ReactNode> = {
    Overview: <Overview navigate={navigate} />,
    "Code studio": <CodeStudio />,
    "Zero to hero": <Curriculum />,
    "Practice & quizzes": <Practice />,
    "Competitive coding": <Competitive />,
    "Sheet library": <Sheets />,
    "Visual lab": <VisualLab />,
    Notes: <Notes />,
    Insights: <Insights />,
    "My roadmap": <Roadmap />,
    Contests: <Contests />,
    "Mock interviews": <Interview />,
    "Peer challenges": <Peers />,
    GitHub: <GitHubView />,
    Portfolio: <Portfolio />,
    Settings: <SettingsView />,
  };
  return (
    <SidebarProvider>
      <Onboarding />
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Sidebar className="studio-sidebar">
        <SidebarHeader>
          <a className="brand" href="/">
            <span className="brand-icon">
              <Code2 size={22} />
            </span>
            CodeMentor<span className="ai-mark">AI</span>
          </a>
        </SidebarHeader>
        <SidebarContent>
          {groups.map(([label, items]) => (
            <SidebarGroup key={label}>
              <SidebarGroupLabel>{label}</SidebarGroupLabel>
              <SidebarMenu>
                {items.map(([name, Icon]) => (
                  <SidebarMenuItem key={name}>
                    <SidebarMenuButton
                      isActive={active === name}
                      onClick={() => navigate(name)}
                    >
                      <Icon />
                      <span>{name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarFooter>
          <button
            type="button"
            className="profile"
            onClick={() => navigate("Settings")}
            aria-label="Open your profile settings"
            style={{ textAlign: "left", width: "100%", cursor: "pointer" }}
          >
            <div className="avatar">
              {w.profile.name.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <strong>{w.profile.name}</strong>
              <small>{w.profile.level} · personal workspace</small>
            </div>
          </button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="studio-main">
        <header className="topbar">
          <div>
            <SidebarTrigger />
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>{active}</strong>
          </div>
          <div>
            <span className="top-label">
              <Flame size={16} />
              {s.streak} day streak
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={theme}
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {dark ? <Sun /> : <Moon />}
            </Button>
          </div>
        </header>
        <main id="main-content" className="content">
          {w.loading && (
            <p className="notice-inline" role="status">
              Loading your saved workspace…
            </p>
          )}
          {w.error && (
            <div className="error" role="alert">
              {w.error}
              <div className="actions">
                <Button variant="outline" onClick={w.reload}>
                  Retry connection
                </Button>
                <a href="/login" target="_top">
                  Sign in
                </a>
              </div>
            </div>
          )}
          <div className="view-enter" key={active}>
            {views[active]}
          </div>
        </main>
        <footer className="app-footer">
          <span>Small steps. Stronger foundations.</span>
          <span>CodeMentor AI / Practice with purpose</span>
        </footer>
        {w.notice && (
          <div className="toast" role="status">
            {w.notice}
            <button
              onClick={() => w.setNotice("")}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        )}
        <FloatingMentor page={active} />
      </SidebarInset>
    </SidebarProvider>
  );
}
export default function Workbench() {
  return (
    <WorkspaceProvider>
      <Shell />
    </WorkspaceProvider>
  );
}
