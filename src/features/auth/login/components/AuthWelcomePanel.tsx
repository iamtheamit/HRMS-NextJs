import { ShieldCheck, Users, CheckCircle2, Sparkles } from 'lucide-react';

export function AuthWelcomePanel() {
  return (
    <div className="relative hidden w-1/2 overflow-hidden bg-[#04091d] lg:flex">
      <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_15%_20%,rgba(56,189,248,0.14),transparent),radial-gradient(900px_500px_at_90%_80%,rgba(59,130,246,0.2),transparent),linear-gradient(165deg,#04091d_15%,#09153a_55%,#0b1a46_100%)]" />
      <div className="absolute -left-28 top-12 h-80 w-80 rounded-full border border-white/10 bg-white/[0.03]" />
      <div className="absolute right-8 top-16 h-24 w-24 rotate-12 rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-sm" />
      <div className="absolute right-16 top-48 h-14 w-14 -rotate-6 rounded-xl border border-cyan-200/30 bg-cyan-200/10" />
      <div className="absolute bottom-16 left-12 h-20 w-20 rotate-[16deg] rounded-2xl border border-brand-200/30 bg-brand-200/10" />

      <div className="relative z-10 flex w-full items-center px-14 py-12">
        <div className="w-full max-w-[620px]">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-100">
            <Sparkles className="h-3.5 w-3.5 text-cyan-200" />
            Welcome to HRMS
          </div>

          <h2 className="mt-8 max-w-xl text-[46px] font-semibold leading-[1.02] text-white">
            One login for everyone,
            <span className="block text-cyan-200">built for your whole organization.</span>
          </h2>

          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-slate-300">
            Whether you are a Super Admin, HR, Manager, or Employee, you can sign in from here and continue your day with the tools you need.
          </p>

          <div className="mt-9 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-md">
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-300">Shared entry point</p>
              <p className="mt-2 text-2xl font-semibold text-white">1 login page</p>
              <p className="mt-1 text-xs text-slate-300">easy access for every role</p>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-cyan-300 to-brand-400" />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md">
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-300">Built for daily work</p>
              <div className="mt-2 space-y-2 text-sm text-slate-200">
                <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-200" /> Safe and reliable sign in</div>
                <div className="flex items-center gap-2"><Users className="h-4 w-4 text-cyan-200" /> People and team updates</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-brand-200" /> Attendance, leave, and payroll in one place</div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {['Common login page', 'Simple experience', 'For all teams', 'Secure by default'].map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/15 bg-white/[0.05] px-3 py-1.5 text-xs text-slate-200"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthWelcomePanel;
