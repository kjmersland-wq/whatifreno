"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

const INITIAL: LoginState = { error: null };

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(login, INITIAL);

  return (
    <form action={action} className="mt-8 space-y-5">
      <input type="hidden" name="next" value={next} />

      <label className="block">
        <span className="text-[11px] uppercase tracking-wider text-zinc-500">Email</span>
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          autoFocus
          className="mt-1.5 w-full rounded-xl border border-white/10 bg-zinc-900/70 px-3 py-2.5 text-sm text-zinc-100 outline-none transition focus:border-sky-300/50"
        />
      </label>

      <label className="block">
        <span className="text-[11px] uppercase tracking-wider text-zinc-500">Password</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-1.5 w-full rounded-xl border border-white/10 bg-zinc-900/70 px-3 py-2.5 text-sm text-zinc-100 outline-none transition focus:border-sky-300/50"
        />
      </label>

      {state.error && (
        <p role="alert" className="text-sm text-red-300">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-sky-200 px-6 py-3 text-sm font-medium text-zinc-950 transition hover:bg-sky-100 disabled:opacity-60"
      >
        {pending ? "Checking…" : "Enter"}
      </button>
    </form>
  );
}
