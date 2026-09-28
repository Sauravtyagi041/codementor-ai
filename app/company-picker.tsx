"use client";
import { useState } from "react";
import { companyTopics } from "@/lib/learning";
import { Button } from "@/components/ui/button";
export function CompanyPicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [search, setSearch] = useState("");
  const [custom, setCustom] = useState("");
  const [other, setOther] = useState(false);
  const [error, setError] = useState("");
  const selected = (name: string) => value.some(v => v.toLowerCase() === name.toLowerCase());
  function toggle(name: string) {
    if (selected(name)) {
      onChange(value.filter(v => v.toLowerCase() !== name.toLowerCase()));
      setError("");
    } else if (value.length >= 100) {
      setError("You can select up to 100 companies. Remove one first.");
    } else {
      onChange([...value, name]);
      setError("");
    }
  }
  function addCustom() {
    const name = custom.trim();
    if (!name) return;
    if (selected(name)) { setError("This company is already selected."); return; }
    if (value.length >= 100) { setError("You can select up to 100 companies. Remove one first."); return; }
    const canonical = Object.keys(companyTopics).find(v => v.toLowerCase() === name.toLowerCase());
    onChange([...value, canonical || name]);
    setCustom("");
    setError("");
  }
  const options = [...new Set([...Object.keys(companyTopics), ...value])]
    .filter(n => n !== "General" && n.toLowerCase().includes(search.trim().toLowerCase())).sort();
  return (
    <section>
      <h4>Target companies</h4>
      <details className="skill-select">
        <summary>Select companies <span>{value.length} selected ▾</span></summary>
        <div className="field">
          <label>Search companies
            <input value={search} maxLength={100} placeholder="Find a company" onChange={e => setSearch(e.target.value)} onKeyDown={e => { if (e.key === "Enter") e.preventDefault(); }} />
          </label>
        </div>
        <div className="skill-options">
          {options.map(name => (
            <label className="skill-option" key={name}>
              <input type="checkbox" checked={selected(name)} onChange={() => toggle(name)} />
              <span>{name}</span>
            </label>
          ))}
          {options.length === 0 && <p>No matching companies. Add your own below.</p>}
          <Button type="button" variant="outline" aria-expanded={other} onClick={() => setOther(!other)}>Other / add your own</Button>
        </div>
      </details>
      {other && <div className="actions">
        <input aria-label="Custom company" placeholder="Company name" value={custom} maxLength={100} onChange={e => setCustom(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }} />
        <Button type="button" onClick={addCustom}>Add company</Button>
      </div>}
      <p>Selected companies · {value.length}. Save your profile below to keep changes.</p>
      <div className="skill-tags">
        {value.map(name => <button type="button" className="skill-tag" key={name} aria-label={`Remove ${name}`} onClick={() => toggle(name)}>{name} ×</button>)}
      </div>
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
