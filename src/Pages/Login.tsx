import { useEffect, useState } from "react";
import axios from "axios";
import ENDPOINTS from "../config";
import { useNavigate } from "react-router-dom";
import { Camera, Film, Lightbulb, Monitor, Settings, Sparkles, Theater } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const lastPath = localStorage.getItem("lastPath") || "/Home";
      navigate(lastPath, { replace: true });
    } else {
      setChecking(false);
    }
  }, []);

  if (checking) return null;

  const handleLogin = async () => {
    if (!identifier || !password) {
      setError("Please enter username/email and password");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.post(ENDPOINTS.LOGIN, { identifier, password });
      const user = data.user;
      if (!user) throw new Error("Invalid login response");
      localStorage.clear();
      localStorage.setItem("authUser", JSON.stringify({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        imageURL: user.imageURL,
      }));
      localStorage.setItem("token", data.token);
      navigate("/Home");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Login failed");
      } else {
        setError("Invalid username/email or password");
      }
    } finally {
      setLoading(false);
    }
  };

  const pipelineSteps = ["PRE-VIZ", "LAYOUT", "ANIM", "LIGHTING", "RENDER", "COMP"];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');

        @keyframes filmScroll {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes nodePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(56,189,248,0.5); }
          50%       { box-shadow: 0 0 0 5px rgba(56,189,248,0); }
        }
        @keyframes scanline {
          0%   { top: -2px; }
          100% { top: 100%; }
        }
        @keyframes dotRun {
          0%   { left: -20px; opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { left: calc(100% + 20px); opacity: 0; }
        }
        @keyframes frameFlicker {
          0%,89%,91%,100% { opacity: 1; }
          90% { opacity: 0.55; }
        }
        @keyframes cardFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .login-root {
          font-family: 'DM Sans', sans-serif;
        }

        .card-anim {
          animation: cardFadeUp 0.55s cubic-bezier(0.22,1,0.36,1) both;
        }

        /* Film strip scroll */
        .film-track {
          position: absolute;
          top: 0; left: 18px; right: 18px;
          animation: filmScroll 16s linear infinite;
        }
        .film-frame {
          height: 96px;
          margin: 3px 0;
          border-radius: 2px;
          border: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
          animation: frameFlicker 8s ease-in-out infinite;
          background: #181818;
        }

        /* Sprocket holes */
        .sprocket {
          position: absolute;
          top: 0; bottom: 0;
          width: 18px;
          background: #090909;
          z-index: 3;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 10px 0;
          gap: 12px;
        }
        .sprocket.left  { left: 0;  border-right: 1px solid rgba(255,255,255,0.05); }
        .sprocket.right { right: 0; border-left:  1px solid rgba(255,255,255,0.05); }

        /* Film fades */
        .film-fade {
          position: absolute;
          left: 18px; right: 18px;
          height: 70px;
          z-index: 4;
          pointer-events: none;
        }
        .film-fade.top    { top: 0;    background: linear-gradient(to bottom, #101012, transparent); }
        .film-fade.bottom { bottom: 0; background: linear-gradient(to top,   #101012, transparent); }

        /* Grid background */
        .grid-bg::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 44px 44px;
          pointer-events: none;
        }

        /* Scanline */
        .right-panel-inner::after {
          content: '';
          position: absolute;
          left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(56,189,248,0.05), transparent);
          animation: scanline 6s linear infinite;
          pointer-events: none;
          z-index: 0;
        }

        /* Pipeline connector */
        .pipe-conn {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin-bottom: 16px;
          position: relative;
          overflow: hidden;
        }
        .pipe-conn::after {
          content: '';
          position: absolute;
          top: 0; bottom: 0;
          width: 24px;
          background: linear-gradient(90deg, transparent, rgba(56,189,248,0.45), transparent);
          animation: dotRun 2.8s ease-in-out infinite;
        }

        /* Pipe dot pulse */
        .pipe-dot-active {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #38bdf8;
          border: 1px solid rgba(56,189,248,0.4);
          animation: nodePulse 2s ease infinite;
        }
        .pipe-dot-inactive {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #252528;
          border: 1px solid rgba(255,255,255,0.1);
        }

        /* Input focus */
        .field-input {
          width: 100%;
          padding: 11px 13px 11px 38px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 3px;
          color: rgba(255,255,255,0.85);
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px;
          font-weight: 400;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          letter-spacing: 0.02em;
        }
        .field-input::placeholder { color: rgba(255,255,255,0.13); font-size: 13px; }
        .field-input:focus {
          border-color: rgba(56,189,248,0.35);
          background: rgba(56,189,248,0.015);
        }

        /* Button */
        .submit-btn {
          width: 100%;
          padding: 13px;
          margin-top: 10px;
          border: none;
          border-radius: 3px;
          background: #38bdf8;
          color: #040c14;
          font-family: 'Syne', sans-serif;
          font-size: 12.5px;
          font-weight: 800;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          position: relative; z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .submit-btn:hover:not(:disabled) {
          background: #7dd3fc;
          box-shadow: 0 4px 28px rgba(56,189,248,0.25);
          transform: translateY(-1px);
        }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled {
          background: rgba(56,189,248,0.12);
          color: rgba(56,189,248,0.25);
          cursor: not-allowed;
        }
      `}</style>

      {/* Root */}
      <div className="login-root grid-bg min-h-screen flex items-center justify-center bg-[#0c0c0e] relative overflow-hidden">

        {/* Card */}
        <div className="card-anim flex w-[780px] min-h-[480px] rounded-[4px] overflow-hidden border border-white/[0.07] shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_40px_120px_rgba(0,0,0,0.95),0_0_60px_rgba(56,189,248,0.03)]">

          {/* ─── LEFT: FILMSTRIP ─── */}
          <div className="relative w-[200px] flex-shrink-0 overflow-hidden bg-[#101012] border-r border-white/[0.06] flex flex-col">
            {/* Sprockets */}
            <div className="sprocket left">
              {[...Array(32)].map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-[1.5px] bg-[#1e1e20] border border-white/[0.06] flex-shrink-0" />
              ))}
            </div>
            <div className="sprocket right">
              {[...Array(32)].map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-[1.5px] bg-[#1e1e20] border border-white/[0.06] flex-shrink-0" />
              ))}
            </div>

            {/* Film frames */}
            <div className="film-track">
              {[...Array(2)].map((_, rep) =>
                [
                  { icon: <Film size={24} />, num: "001", delay: "0s" },
                  { icon: <Lightbulb size={24} />, num: "002", delay: "0.3s" },
                  { icon: <Camera size={24} />, num: "003", delay: "0.6s" },
                  { icon: <Settings size={24} />, num: "004", delay: "0.9s" },
                  { icon: <Monitor size={24} />, num: "005", delay: "1.2s" },
                  { icon: <Sparkles size={24} />, num: "006", delay: "1.5s" },
                  { icon: <Theater size={24} />, num: "007", delay: "1.8s" },
                ].map((f, i) => (
                  <div key={`${rep}-${i}`} className="film-frame" style={{ animationDelay: f.delay }}>
                    <span className="opacity-30 text-white">{f.icon}</span>
                    <span className="absolute bottom-[5px] right-[6px] font-mono text-[8px] text-sky-400/40 tracking-widest"
                      style={{ fontFamily: "'DM Mono', monospace" }}>
                      {f.num}
                    </span>
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-sky-400/10" />
                  </div>
                ))
              )}
            </div>

            <div className="film-fade top" />
            <div className="film-fade bottom" />

            {/* Studio tag */}
            <div className="absolute bottom-0 left-0 right-0 z-10 px-[14px] pt-[18px] pb-[20px] text-center"
              style={{ background: "linear-gradient(to top, rgba(8,8,10,1) 60%, transparent)" }}>
              <div className="flex items-center justify-center gap-[6px] mb-[5px]">
                <div className="w-5 h-[2px] rounded-[1px] bg-sky-400/50" />
                <span className="text-[11px] font-extrabold tracking-[0.25em] text-white/70 uppercase"
                  style={{ fontFamily: "'Syne', sans-serif" }}>Pipeline</span>
                <div className="w-5 h-[2px] rounded-[1px] bg-sky-400/50" />
              </div>
              <div className="flex items-center justify-center gap-[6px]">
                <div className="w-5 h-[2px] rounded-[1px] bg-sky-400/25" />
                <span className="text-[11px] font-extrabold tracking-[0.25em] text-sky-400/75 uppercase"
                  style={{ fontFamily: "'Syne', sans-serif" }}>Animation</span>
                <div className="w-5 h-[2px] rounded-[1px] bg-sky-400/25" />
              </div>
              <span className="block mt-[2px] text-[8.5px] tracking-[0.2em] text-sky-400/50 uppercase"
                style={{ fontFamily: "'DM Mono', monospace" }}>Thailand</span>
            </div>
          </div>

          {/* ─── RIGHT: FORM ─── */}
          <div className="right-panel-inner flex-1 bg-[#0e0e10] flex flex-col justify-center px-[42px] py-[44px] relative overflow-hidden">

            {/* Pipeline progress strip */}
            <div className="flex items-center mb-8 relative z-10">
              {pipelineSteps.map((step, i) => (
                <div key={step} className="flex items-center" style={{ flex: i < pipelineSteps.length - 1 ? 1 : "none" }}>
                  <div className="flex flex-col items-center gap-[5px]">
                    <div className={i === 0 ? "pipe-dot-active" : "pipe-dot-inactive"} />
                    <span className={`text-[7px] tracking-[0.1em] uppercase whitespace-nowrap ${
                      i === 0 ? "text-sky-400/65" : "text-white/[0.18]"
                    }`} style={{ fontFamily: "'DM Mono', monospace" }}>{step}</span>
                  </div>
                  {i < pipelineSteps.length - 1 && <div className="pipe-conn" />}
                </div>
              ))}
            </div>

            {/* Header */}
            <h1 className="text-[30px] font-extrabold text-white tracking-[-0.01em] mb-[5px] relative z-10"
              >Sign In</h1>
            <p className="text-[12px] text-white/[0.28] tracking-[0.04em] font-light mb-6 relative z-10"
              style={{ fontFamily: "'DM Sans', sans-serif" }}>Access your production pipeline</p>

            {/* Divider */}
            <div className="h-px mb-6 relative z-10"
              style={{ background: "linear-gradient(90deg, rgba(56,189,248,0.25), rgba(56,189,248,0.04), transparent)" }} />

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-500/5 border border-red-500/20 rounded-[3px] px-3 py-[9px] mb-[14px] text-red-400/85 text-[12px] relative z-10">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="13"/>
                  <circle cx="12" cy="16.5" r="0.6" fill="currentColor"/>
                </svg>
                {error}
              </div>
            )}

            {/* Identifier */}
            <div className="mb-[15px] relative z-10">
              <label className={`block text-[8.5px] tracking-[0.2em] uppercase mb-[6px] transition-colors duration-200 ${
                focusedField === "id" ? "text-sky-400/55" : "text-white/[0.28]"
              }`} style={{ fontFamily: "'DM Mono', monospace" }}>
                Identifier
              </label>
              <div className="relative">
                <svg className={`absolute left-[13px] top-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-200 ${
                  focusedField === "id" ? "opacity-60" : "opacity-25"
                }`}
                  width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="rgb(56,189,248)" strokeWidth="1.8">
                  <circle cx="12" cy="8" r="4"/>
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
                <input
                  type="text"
                  placeholder="username or email"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  onFocus={() => setFocusedField("id")}
                  onBlur={() => setFocusedField(null)}
                  className="field-input"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-[15px] relative z-10">
              <label className={`block text-[8.5px] tracking-[0.2em] uppercase mb-[6px] transition-colors duration-200 ${
                focusedField === "pw" ? "text-sky-400/55" : "text-white/[0.28]"
              }`} style={{ fontFamily: "'DM Mono', monospace" }}>
                Access Code
              </label>
              <div className="relative">
                <svg className={`absolute left-[13px] top-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-200 ${
                  focusedField === "pw" ? "opacity-60" : "opacity-25"
                }`}
                  width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="rgb(56,189,248)" strokeWidth="1.8">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  type="password"
                  placeholder="••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("pw")}
                  onBlur={() => setFocusedField(null)}
                  className="field-input"
                  autoComplete="current-password"
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="submit-btn"
            >
              {loading ? (
                <>
                  <div className="w-[5px] h-[5px] rounded-full bg-[#040c14] opacity-40" />
                  <div className="w-[5px] h-[5px] rounded-full bg-[#040c14] opacity-40" />
                  <div className="w-[5px] h-[5px] rounded-full bg-[#040c14] opacity-40" />
                  Rendering...
                </>
              ) : (
                <>
                  Enter
                  <span className="text-[15px] opacity-60">→</span>
                </>
              )}
            </button>

            {/* Timecode */}
            <div className="absolute bottom-[18px] right-[22px] text-[9px] text-white/10 tracking-[0.1em] z-10"
              style={{ fontFamily: "'DM Mono', monospace" }}>
              F001 · 24fps · PAT
            </div>
          </div>

        </div>
      </div>
    </>
  );
}