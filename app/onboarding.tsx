"use client";
import { branches } from "@/lib/branches";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, Choice } from "./ui-kit";
import { useWorkspace } from "./workspace-context";
import { GitHubConnect } from "./github-connect";
export default function Onboarding() {
  const w = useWorkspace();
  const [name, setName] = useState(""),
    [branch, setBranch] = useState(branches[0]),
    [github, setGithub] = useState(""),
    [level, setLevel] = useState("Beginner"),
    [minutes, setMinutes] = useState("30"),
    [dismissed, setDismissed] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <Dialog
      open={!w.loading && !w.error && !w.hasProfile && !dismissed}
      onOpenChange={(open) => {
        if (!open) setDismissed(true);
      }}
    >
      <DialogContent className="onboarding-dialog">
        <DialogHeader>
          <DialogTitle>Make your first step count.</DialogTitle>
          <DialogDescription>
            Your sign-in is complete. Set up your personal learning profile.
          </DialogDescription>
        </DialogHeader>

        <form className="onboarding-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              await w.saveProfile({
                ...w.profile,
                name: name.trim(),
                branch,
                github: github.trim(),
                level,
                minutes: Number(minutes),
              });
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <div className="onboarding-scroll">
          <Field label="What should we call you?">
            <input
              required
              maxLength={80}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="given-name"
            />
          </Field>
          <Choice
            label="Where are you starting?"
            value={level}
            options={["Beginner", "Intermediate", "Advanced"]}
            onChange={setLevel}
          />
          <Choice
            label="Engineering branch"
            value={branch}
            options={branches}
            onChange={setBranch}
          />
          <Field label="GitHub username · optional">
            <input
              value={github}
              maxLength={39}
              pattern="[a-zA-Z0-9-]*"
              onChange={(e) => setGithub(e.target.value)}
              placeholder="Your GitHub username"
            />
          </Field>
          <p className="fine-print">
            Skills can come from any field. A GitHub username links your public
            profile; repository write access requires authorization.
          </p>
          <Choice
            label="Daily practice minutes"
            value={minutes}
            options={["15", "30", "45", "60", "90"]}
            onChange={setMinutes}
          />
          <details className="onboarding-github"><summary>Connect GitHub for code sync · optional</summary><GitHubConnect /></details>
          {error && <p role="alert" className="error">{error}</p>}
          </div>
          <div className="actions onboarding-actions">
            <Button type="submit" disabled={busy}>
              {busy ? "Creating profile…" : "Create my learning profile"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDismissed(true)}
            >
              Explore first
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
