import { login } from "@/app/actions";

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
        <h1 className="text-xl font-semibold text-navy">Ambassador Project Tracker</h1>
        <p className="mt-1 text-sm text-slate-500">Enter the team password to continue.</p>

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
