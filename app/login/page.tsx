import { login } from "@/app/actions";
import Logo from "@/components/Logo";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : "/";
  const error = params.error === "1";

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-xl">
        <div className="flex items-center gap-2.5">
          <Logo className="h-8 w-8 shrink-0" color="#1a2740" />
          <div className="leading-tight">
            <p className="text-base font-semibold text-navy">My Tracker Ambassador</p>
            <p className="text-xs text-slate-400">Ambassador</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-500">Enter the team password to continue.</p>

        <form action={login} className="mt-6 space-y-4">
          <input type="hidden" name="next" value={next} />

          <div>
            <label className="text-sm font-medium text-slate-700">Your name</label>
            <input
              name="name"
              required
              placeholder="e.g. RJ"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Password</label>
            <input
              name="password"
              type="password"
              required
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">Wrong password. Try again.</p>
          )}

          <button
            type="submit"
            className="w-full rounded-md bg-brand py-2 text-sm font-medium text-white transition hover:bg-brand-dark"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}
