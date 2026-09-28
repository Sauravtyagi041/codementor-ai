import { PasswordForm } from "./password-form";
import {
  Code2,
  ArrowRight,
  Check,
  ShieldCheck,
  Terminal,
  BookOpen,
  GitBranch,
} from "lucide-react";
import { ChatGPTUser, chatGPTSignInPath } from "./chatgpt-auth";

export default function AuthScreen({
  user,
  mode = "login",
}: {
  user: ChatGPTUser | null;
  mode?: "login" | "signup";
}) {
  const signup = mode === "signup";
  return (
    <main className="auth-page">
      <section className="auth-story">
        <a href="/login" className="auth-brand">
          <span>
            <Code2 size={24} />
          </span>
          CodeMentor<span className="auth-ai">AI</span>
        </a>
        <div className="auth-story-body">
          <span className="auth-eyebrow">A LITTLE BETTER. EVERY DAY.</span>
          <h1>
            Your next
            <br />
            breakthrough
            <br />
            <em>starts here.</em>
          </h1>
          <p>
            Learn the foundations. Understand your code.
            <br />
            Build the confidence to solve what comes next.
          </p>
          <div className="auth-code" aria-label="A coding practice example">
            <div className="auth-code-header">
              <Terminal size={15} />
              <span>your-journey.cpp</span>
              <span>C++17</span>
            </div>
            <pre>
              <span className="code-purple">while</span>
              {" (learning) {\n  "}
              <span className="code-blue">practice</span>
              {"();\n  "}
              <span className="code-blue">reflect</span>
              {"();\n  "}
              <span className="code-blue">improve</span>
              {"();\n}"}
            </pre>
            <div className="auth-code-footer">
              <Check size={14} />
              Progress comes from showing up.
            </div>
          </div>
          <div className="auth-features">
            <span>
              <BookOpen size={17} />
              From basics to DSA
            </span>
            <span>
              <GitBranch size={17} />
              Practice with purpose
            </span>
          </div>
        </div>
        <footer>Made for the journey, not just the answer.</footer>
      </section>
      <section className="auth-entry">
        <div className="auth-entry-top">
          <span>
            {signup ? "Already have an account?" : "New to CodeMentor?"}
          </span>
          <a href={signup ? "/login" : "/signup"}>
            {signup ? "Sign in" : "Create account"}
            <ArrowRight size={15} />
          </a>
        </div>
        <div className="auth-card">
          <span className="auth-card-icon">
            <Code2 size={25} />
          </span>
          <span className="auth-eyebrow">YOUR PERSONAL CODING COACH</span>
          <h2>
            {user
              ? "You’re ready to continue."
              : signup
                ? "Create your account."
                : "Welcome back."}
          </h2>
          <p>
            {user
              ? `Signed in as ${user.displayName}`
              : signup
                ? "Choose how to get started."
                : "Sign in to your workspace."}
          </p>
          {user?<a className="auth-continue" href="/">Open my dashboard</a>:<PasswordForm signup={signup}/>}
        </div>
        <footer className="auth-entry-footer">
          <ShieldCheck size={14} />
          Your progress belongs to you.
        </footer>
      </section>
    </main>
  );
}
