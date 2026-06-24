import { FormEvent, useState } from "react";
import type { Channel } from "@/data/channels";
import { saveBrokenChannelReport, type BrokenChannelIssue } from "@/lib/reportBrokenChannel";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

const ISSUE_OPTIONS: Array<{ value: BrokenChannelIssue; label: string }> = [
  { value: "not-playing", label: "Not playing" },
  { value: "wrong-channel", label: "Wrong channel" },
  { value: "buffering", label: "Buffering" },
  { value: "audio", label: "Audio issue" },
  { value: "other", label: "Other" },
];

export default function BrokenChannelReport({ channel }: { channel: Channel }) {
  const [issue, setIssue] = useState<BrokenChannelIssue>("not-playing");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    saveBrokenChannelReport(channel, issue, message);
    setSubmitted(true);
    setMessage("");
  };

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.035] p-4 md:p-5">
      <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-white">
        <AlertTriangle className="h-4 w-4 text-amber-400" />
        Report broken channel
      </div>
      <p className="mt-2 text-xs leading-5 text-zinc-500">
        Submit a local report if this stream is not working. Reports are stored in this browser until a backend is connected.
      </p>

      {submitted && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-300">
          <CheckCircle2 className="h-4 w-4" />
          Report saved locally.
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
          Issue type
          <select
            value={issue}
            onChange={(event) => setIssue(event.target.value as BrokenChannelIssue)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm normal-case tracking-normal text-white outline-none focus:border-red-500"
          >
            {ISSUE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
          Message
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Example: stream loads but keeps buffering"
            className="mt-1 min-h-20 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm normal-case tracking-normal text-white outline-none placeholder:text-zinc-600 focus:border-red-500"
          />
        </label>

        <button
          type="submit"
          className="rounded-full bg-red-600 px-4 py-2 text-xs font-black uppercase tracking-wider text-white transition hover:bg-red-700"
        >
          Submit report
        </button>
      </form>
    </div>
  );
}
