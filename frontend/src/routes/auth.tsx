import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";
import { login, signup, setStoredAuthToken, getStoredAuthToken, getCurrentUser } from "@/lib/auth";
import { Loader2, LogIn, UserPlus } from "lucide-react";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin Sign In — SELFLESS ORGANIZATION BD" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = getStoredAuthToken();
    if (!token) return;

    let active = true;
    getCurrentUser(token)
      .then((user) => {
        if (active && user) {
          navigate({ to: "/admin", replace: true });
        }
      })
      .catch(() => {
        // token invalid or expired
      });
    return () => {
      active = false;
    };
  }, [navigate]);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const result = await signup(email, password, fullName);
        setStoredAuthToken(result.access, result.refresh);
        toast.success("Account created. You are now signed in.");
        navigate({ to: "/admin", replace: true });
      } else {
        const result = await login(email, password);
        setStoredAuthToken(result.access, result.refresh);
        toast.success("Welcome back!");
        navigate({ to: "/admin", replace: true });
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Authentication failed"));
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    toast.error("Social login is not available at this time.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-3 mb-8">
          <img src={logo} className="h-12 w-12 object-contain" alt="logo" />
          <div className="text-center">
            <div className="font-display font-bold text-lg text-emerald-900">
              SELFLESS ORGANIZATION BD
            </div>
            <div className="text-[10px] tracking-widest text-emerald-700">ADMIN PORTAL</div>
          </div>
        </Link>

        <div className="glass-strong rounded-3xl p-8 shadow-elevated border border-emerald-100">
          <div className="flex gap-1 p-1 bg-emerald-50 rounded-xl mb-6">
            <button
              onClick={() => setMode("signin")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                mode === "signin" ? "bg-white text-emerald-700 shadow-sm" : "text-emerald-600"
              }`}
            >
              <LogIn className="inline h-4 w-4 mr-1.5" /> Sign In
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                mode === "signup" ? "bg-white text-emerald-700 shadow-sm" : "text-emerald-600"
              }`}
            >
              <UserPlus className="inline h-4 w-4 mr-1.5" /> Sign Up
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="text-xs font-semibold text-emerald-900 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full mt-1.5 px-4 py-2.5 rounded-xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>
            )}
            <div>
              <label className="text-xs font-semibold text-emerald-900 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full mt-1.5 px-4 py-2.5 rounded-xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-emerald-900 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full mt-1.5 px-4 py-2.5 rounded-xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>
            <button
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white py-3 rounded-xl font-semibold hover:shadow-glow transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-[11px] text-center text-emerald-700/70">
            Admin access only. Public visitors should return to the{" "}
            <Link to="/" className="underline">
              main site
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
