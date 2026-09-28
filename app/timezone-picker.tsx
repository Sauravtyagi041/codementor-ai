"use client";
import { useEffect, useState } from "react";
import { Profile } from "@/lib/learning";
export function TimezonePicker({value, onChange}: {value: Profile; onChange: (p: Profile) => void}) {
  const [now, setNow] = useState<Date | null>(null);
  const [device, setDevice] = useState("UTC");
  const [zones, setZones] = useState<string[]>([]);
  useEffect(() => {
    const tick = () => { setNow(new Date()); setDevice(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"); };
    tick();
    setZones(Intl.supportedValuesOf("timeZone"));
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);
  const automatic = value.timezoneMode !== "manual";
  const zone = automatic ? device : value.timezone;
  return <section>
    <h4>Timezone</h4>
    <label className="skill-option"><input type="checkbox" checked={automatic} onChange={e => onChange({...value, timezoneMode: e.target.checked ? "automatic" : "manual", timezone: zone})} />Use my device timezone automatically</label>
    {!automatic && <label className="field">Choose timezone<select value={value.timezone} onChange={e => onChange({...value, timezone: e.target.value})}>{[...new Set([value.timezone, "UTC", ...zones])].map(z => <option key={z} value={z}>{z.replaceAll("_", " ")}</option>)}</select></label>}
    <p>{zone.replaceAll("_", " ")} · {now ? new Intl.DateTimeFormat(undefined, {timeZone: zone, dateStyle: "medium", timeStyle: "long"}).format(now) : "Detecting local time…"}</p>
    <small>Your activity streak and daily progress use this timezone. Save preferences to keep your choice.</small>
  </section>;
}
