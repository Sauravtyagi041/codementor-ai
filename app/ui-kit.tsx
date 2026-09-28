"use client";
import { AnswerContent } from "./answer-content";
import { useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Sparkles,
  Copy,
  Download,
  LoaderCircle,
  Trash2,
  Volume2,
  Mic,
} from "lucide-react";
import { api, useWorkspace } from "./workspace-context";
export function Choice({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger aria-label={label}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((v) => (
            <SelectItem value={v} key={v}>
              {v}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}
export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
export function Heading({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">YOUR CODING JOURNEY</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children}
    </div>
  );
}
export function Empty({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="empty">
      <span className="empty-mark">&lt;/&gt;</span>
      <h3>{title}</h3>
      <p>{detail}</p>
    </div>
  );
}
export function download(name: string, text: string, type = "text/plain") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function speak(text: string) {
  if (!("speechSynthesis" in window))
    throw new Error("Speech playback is unavailable in this browser.");
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text.slice(0, 5000));
  speechSynthesis.speak(utterance);
}
export function VoiceInput({ onText }: { onText: (s: string) => void }) {
  const [listening, setListening] = useState(false);
  const { setNotice } = useWorkspace();
  function start() {
    const Speech =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!Speech) {
      setNotice(
        "Voice input is unavailable in this browser. You can type your question.",
      );
      return;
    }
    const recognition = new Speech();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.onresult = (e: any) => onText(e.results[0][0].transcript);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => {
      setListening(false);
      setNotice("Microphone input was unavailable or not permitted.");
    };
    try {
      recognition.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }
  return (
    <Button variant="outline" onClick={start} disabled={listening}>
      <Mic />
      {listening ? "Listening…" : "Use voice"}
    </Button>
  );
}
export function Result({
  text,
  label = "Result",
}: {
  text: string;
  label?: string;
}) {
  const { setNotice } = useWorkspace();
  return (
    <div className="result">
      <div className="result-toolbar">
        <span>{label}</span>
        <div>
          <Button
            size="icon"
            variant="ghost"
            aria-label="Copy result"
            onClick={() =>
              navigator.clipboard
                .writeText(text)
                .then(() => setNotice("Copied."))
                .catch(() =>
                  setNotice("Clipboard unavailable. Select and copy the text."),
                )
            }
          >
            <Copy />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            aria-label="Download result"
            onClick={() => download("codementor-result.md", text)}
          >
            <Download />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            aria-label="Read result aloud"
            onClick={() => {
              try {
                speak(text);
              } catch (e) {
                setNotice((e as Error).message);
              }
            }}
          >
            <Volume2 />
          </Button>
        </div>
      </div>
      <AnswerContent text={text} />
    </div>
  );
}
export function AIBox({
  mode,
  title,
  placeholder,
  initial = "",
  saveKind = "note",
}: {
  mode: string;
  title: string;
  placeholder: string;
  initial?: string;
  saveKind?: string;
}) {
  const { profile, ready, save } = useWorkspace();
  const [text, setText] = useState(initial),
    [result, setResult] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function run() {
    if (!text.trim()) return;
    setBusy(true);
    setError("");
    try {
      const d = await api("ai", { mode, text, level: profile.level });
      setResult(d.text);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="surface ai-box">
      <div className="section-head">
        <h3>
          <Sparkles size={18} />
          {title}
        </h3>
        <span className="tag">
          {ready ? "AI connected" : "AI setup needed"}
        </span>
      </div>
      <Field label="Context or question">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          rows={5}
        />
      </Field>
      <div className="actions">
        <Button disabled={busy || !text.trim()} onClick={run}>
          {busy ? <LoaderCircle className="spin" /> : <Sparkles />}
          {busy ? "Thinking…" : "Generate"}
        </Button>
        <VoiceInput onText={setText} />
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {result && (
        <>
          <Result text={result} label="AI generated · review for accuracy" />
          <Button
            variant="outline"
            onClick={() =>
              save(saveKind, title, {
                text: result,
                source: "AI",
                prompt: text,
              }).catch((e) => setError(e.message))
            }
          >
            Save result
          </Button>
        </>
      )}
    </section>
  );
}
export function DeleteEntry({ id }: { id: string }) {
  const { remove, setNotice } = useWorkspace();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="icon" variant="ghost" aria-label="Delete entry">
          <Trash2 size={16} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes it from your saved workspace and any progress
            calculated from it.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep entry</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => remove(id).catch((e) => setNotice(e.message))}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
