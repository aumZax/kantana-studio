import { useEffect, useState } from "react";
import axios from "axios";
import ENDPOINTS from "../config";
import { useNavigate } from "react-router-dom";



export default function Login() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const lastPath = localStorage.getItem("lastPath") || "/Home";
      navigate(lastPath, { replace: true });
    } else {
      setChecking(false); // ไม่มี token → แสดง login ได้เลย
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
      const { data } = await axios.post(ENDPOINTS.LOGIN, {
        identifier,
        password,
      });

      // 
      // console.log("✅ Login response:", data);

      // เก็บข้อมูล user
      const user = data.user;
      if (!user) throw new Error("Invalid login response");
      // console.log("✅ Logged in user:", user);

      localStorage.clear();

      localStorage.setItem("authUser", JSON.stringify({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        imageURL: user.imageURL,
      }));

      localStorage.setItem("token", data.token);
      // console.log("✅ Login successful, navigating to /Home");
      navigate("/Home");

    } catch (err) {
      // console.error("❌ Login error:", err);
      if (axios.isAxiosError(err)) {
        // API ส่ง error message กลับมา
        const errorMsg = err.response?.data?.message || "Login failed";
        setError(errorMsg);
      } else {
        setError("Invalid username/email or password");
      }
    } finally {
      setLoading(false);
    }
  };


  
 /* ---------- styles ---------- */
const contentStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontFamily: "'Exo 2', sans-serif",
};

const cardStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "row",
  width: "720px",
  minHeight: "420px",
  borderRadius: "28px",
  overflow: "hidden",
  position: "relative",
  border: "1px solid rgba(120,160,255,0.18)",
  boxShadow: `
    0 0 0 1px rgba(79,107,255,0.08),
    0 0 60px rgba(79,107,255,0.25),
    0 0 120px rgba(168,85,247,0.15),
    0 40px 100px rgba(0,0,0,0.9)
  `,
};

const leftPanelStyle: React.CSSProperties = {
  width: "300px",
  flexShrink: 0,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  position: "relative",
  overflow: "hidden",
  background: `
    radial-gradient(ellipse at 60% 40%, rgba(79,107,255,0.22) 0%, transparent 65%),
    radial-gradient(ellipse at 20% 80%, rgba(168,85,247,0.18) 0%, transparent 55%),
    radial-gradient(ellipse at 80% 90%, rgba(6,182,212,0.12) 0%, transparent 50%),
    linear-gradient(170deg, rgba(10,10,35,0.95) 0%, rgba(5,5,20,0.98) 100%)
  `,
  borderRight: "1px solid rgba(79,107,255,0.15)",
  padding: "40px 28px",
};

const rightPanelStyle: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  padding: "44px 40px",
  background: `
    radial-gradient(ellipse at 80% 20%, rgba(79,107,255,0.08) 0%, transparent 60%),
    linear-gradient(170deg, rgba(8,8,25,0.97) 0%, rgba(5,5,18,0.99) 100%)
  `,
};

const titleStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, #e0e8ff 0%, #a5b8ff 50%, #7c9fff 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  fontSize: "2rem",
  fontWeight: 800,
  marginBottom: "4px",
  letterSpacing: "0.12em",
  fontFamily: "'Orbitron', sans-serif",
};

const subtitleStyle: React.CSSProperties = {
  color: "rgba(160,180,255,0.45)",
  fontSize: "0.75rem",
  marginBottom: "30px",
  letterSpacing: "0.22em",
  textTransform: "uppercase",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  color: "rgba(160,185,255,0.6)",
  fontSize: "0.68rem",
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  marginBottom: "6px",
  fontFamily: "'Orbitron', sans-serif",
};

const inputWrapStyle: React.CSSProperties = {
  position: "relative",
  marginBottom: "18px",
};

const inputStyle: React.CSSProperties = {
  padding: "13px 16px 13px 42px",
  borderRadius: "10px",
  border: "1px solid rgba(79,107,255,0.22)",
  backgroundColor: "rgba(10,14,40,0.7)",
  color: "rgba(210,225,255,0.92)",
  fontSize: "14px",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
  fontFamily: "'Exo 2', sans-serif",
  letterSpacing: "0.04em",
  transition: "border-color 0.25s, box-shadow 0.25s",
};

const buttonStyle: React.CSSProperties = {
  padding: "14px",
  borderRadius: "12px",
  border: "1px solid rgba(100,140,255,0.35)",
  background: "linear-gradient(135deg, rgba(60,90,255,0.85) 0%, rgba(120,50,220,0.85) 100%)",
  fontWeight: 700,
  cursor: "pointer",
  width: "100%",
  color: "white",
  fontSize: "13px",
  marginTop: "8px",
  letterSpacing: "0.25em",
  textTransform: "uppercase",
  fontFamily: "'Orbitron', sans-serif",
  boxShadow: "0 4px 24px rgba(79,107,255,0.4), inset 0 1px 0 rgba(255,255,255,0.12)",
  transition: "box-shadow 0.25s, transform 0.15s",
  position: "relative",
  overflow: "hidden",
};

const buttonDisabledStyle: React.CSSProperties = {
  ...buttonStyle,
  background: "rgba(40,40,60,0.8)",
  border: "1px solid rgba(80,80,110,0.3)",
  boxShadow: "none",
  cursor: "not-allowed",
};

const errorStyle: React.CSSProperties = {
  color: "#ff6b7a",
  marginBottom: "16px",
  fontSize: "0.8rem",
  background: "rgba(255,60,80,0.08)",
  border: "1px solid rgba(255,60,80,0.25)",
  borderRadius: "10px",
  padding: "10px 14px",
  letterSpacing: "0.04em",
};

  /* ---------- render ---------- */
  return (
    <>
      {/* ===== Space BG ===== */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -2,
          overflow: "hidden",
        }}
      >
        <iframe
          src="/bg.html"
          title="space-bg"
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* ===== Dark Overlay ===== */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -1,
          background:
            "radial-gradient(circle at center, rgba(0,0,0,0.35), rgba(0,0,0,0.85))",
        }}
      />

      {/* ===== Login Content ===== */}
   <div style={contentStyle}>

  {/* Google Fonts — Orbitron + Exo 2 */}
  <link
    href="https://fonts.googleapis.com/css2?family=Orbitron:wght@600;800&family=Exo+2:wght@300;400;600&display=swap"
    rel="stylesheet"
  />

  <div style={cardStyle}>

    {/* ═══════════ LEFT PANEL ═══════════ */}
    <div style={leftPanelStyle}>

      {/* Star field dots */}
      {[...Array(28)].map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          width: i % 4 === 0 ? 2.5 : 1.5,
          height: i % 4 === 0 ? 2.5 : 1.5,
          borderRadius: "50%",
          background: `rgba(${i % 3 === 0 ? "180,200,255" : i % 3 === 1 ? "200,180,255" : "180,230,255"}, ${0.25 + (i % 5) * 0.12})`,
          top: `${(i * 37 + 11) % 100}%`,
          left: `${(i * 53 + 7) % 100}%`,
          animation: `starBlink ${2.5 + (i % 4) * 0.8}s ease-in-out ${(i * 0.3) % 2}s infinite`,
          boxShadow: i % 5 === 0 ? "0 0 4px rgba(180,200,255,0.8)" : "none",
        }} />
      ))}

      {/* Constellation lines SVG */}
      <svg style={{
        position: "absolute", inset: 0, width: "100%", height: "100%",
        opacity: 0.12, pointerEvents: "none",
      }}>
        <line x1="20%" y1="15%" x2="55%" y2="28%" stroke="#8ab0ff" strokeWidth="0.8" />
        <line x1="55%" y1="28%" x2="80%" y2="12%" stroke="#8ab0ff" strokeWidth="0.8" />
        <line x1="10%" y1="70%" x2="35%" y2="58%" stroke="#b08aff" strokeWidth="0.8" />
        <line x1="35%" y1="58%" x2="65%" y2="75%" stroke="#b08aff" strokeWidth="0.8" />
        <line x1="75%" y1="85%" x2="90%" y2="65%" stroke="#8adfff" strokeWidth="0.8" />
      </svg>

      {/* Nebula glow bottom */}
      <div style={{
        position: "absolute", bottom: -40, left: "50%",
        transform: "translateX(-50%)",
        width: 200, height: 120,
        borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(168,85,247,0.2) 0%, transparent 70%)",
        filter: "blur(18px)",
        pointerEvents: "none",
      }} />

      {/* ── Avatar ── */}
      <div style={{ position: "relative", width: 172, height: 172, zIndex: 2 }}>

        {/* Outermost slow aurora ring */}
        <div style={{
          position: "absolute", inset: -24,
          borderRadius: "50%",
          background: "conic-gradient(from 0deg, transparent 0%, rgba(79,107,255,0.5) 20%, transparent 40%, rgba(168,85,247,0.4) 60%, transparent 80%, rgba(6,182,212,0.4) 95%, transparent 100%)",
          animation: "spin 8s linear infinite",
          filter: "blur(4px)",
        }} />

        {/* Gradient border ring */}
        <div style={{
          position: "absolute", inset: -16,
          borderRadius: "50%",
          background: "linear-gradient(#05051a,#05051a) padding-box, conic-gradient(from 0deg, #4f6bff, #a855f7, #06b6d4, #4f6bff) border-box",
          border: "1.5px solid transparent",
          animation: "spinReverse 5s linear infinite",
        }} />

        {/* Dashed orbit ring */}
        <div style={{
          position: "absolute", inset: -9,
          borderRadius: "50%",
          border: "1.5px dashed rgba(140,170,255,0.3)",
          animation: "spin 12s linear infinite",
        }} />

        {/* Pulse glow */}
        <div style={{
          position: "absolute", inset: -6,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(79,107,255,0.35) 0%, transparent 70%)",
          animation: "pulse 3s ease-in-out infinite",
        }} />

        {/* Blue orbiting dot */}
        <div style={{
          position: "absolute", inset: -18, borderRadius: "50%",
          animation: "spin 3s linear infinite",
        }}>
          <div style={{
            position: "absolute", top: "50%", left: -5,
            width: 9, height: 9, borderRadius: "50%",
            background: "radial-gradient(circle, #a0c0ff, #4f6bff)",
            boxShadow: "0 0 12px #4f6bff, 0 0 28px rgba(79,107,255,0.7)",
            transform: "translateY(-50%)",
          }} />
        </div>

        {/* Purple orbiting dot (counter) */}
        <div style={{
          position: "absolute", inset: -18, borderRadius: "50%",
          animation: "spinReverse 4.5s linear infinite",
        }}>
          <div style={{
            position: "absolute", bottom: -5, left: "50%",
            width: 7, height: 7, borderRadius: "50%",
            background: "radial-gradient(circle, #e0a0ff, #a855f7)",
            boxShadow: "0 0 10px #a855f7, 0 0 22px rgba(168,85,247,0.6)",
          }} />
        </div>

        {/* Cyan orbiting dot (medium) */}
        <div style={{
          position: "absolute", inset: -22, borderRadius: "50%",
          animation: "spin 7s linear infinite",
        }}>
          <div style={{
            position: "absolute", top: "15%", right: -4,
            width: 6, height: 6, borderRadius: "50%",
            background: "radial-gradient(circle, #a0f0ff, #06b6d4)",
            boxShadow: "0 0 8px #06b6d4, 0 0 18px rgba(6,182,212,0.5)",
          }} />
        </div>

        {/* Avatar image */}
        <img
          src="/patR.png"
          alt="logo"
          style={{
            width: "100%", height: "100%",
            borderRadius: "50%",
            objectFit: "cover",
            border: "2.5px solid rgba(100,140,255,0.7)",
            boxShadow: `
              0 0 20px rgba(79,107,255,0.6),
              0 0 50px rgba(79,107,255,0.3),
              0 0 80px rgba(168,85,247,0.2),
              inset 0 0 20px rgba(79,107,255,0.1)
            `,
            position: "relative", zIndex: 1,
          }}
        />
      </div>

      {/* Name / tagline */}
      <div style={{ zIndex: 2, textAlign: "center", marginTop: 24 }}>
        <p style={{
          color: "rgba(180,205,255,0.75)",
          fontSize: "0.7rem",
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          fontFamily: "'Orbitron', sans-serif",
          marginBottom: 6,
        }}>
          ✦ Mission Control ✦
        </p>
        <div style={{
          width: 60, height: 1, margin: "0 auto",
          background: "linear-gradient(90deg, transparent, rgba(79,107,255,0.6), transparent)",
        }} />
      </div>
    </div>

    {/* ═══════════ RIGHT PANEL ═══════════ */}
    <div style={rightPanelStyle}>

      {/* Keyframes */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600;800&family=Exo+2:wght@300;400;600&display=swap');
        @keyframes spin        { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes spinReverse { from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }
        @keyframes pulse       { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.1)} }
        @keyframes starBlink   { 0%,100%{opacity:.2} 50%{opacity:1} }
        @keyframes shimmer     { 0%{left:-100%} 100%{left:200%} }
        .space-input:focus {
          border-color: rgba(100,140,255,0.6) !important;
          box-shadow: 0 0 0 3px rgba(79,107,255,0.12), 0 0 20px rgba(79,107,255,0.15) !important;
        }
        .login-btn:hover:not(:disabled) {
          box-shadow: 0 6px 32px rgba(79,107,255,0.6), inset 0 1px 0 rgba(255,255,255,0.18) !important;
          transform: translateY(-1px);
        }
        .login-btn:active:not(:disabled) { transform: translateY(0px); }
        .login-btn::after {
          content:''; position:absolute;
          top:0; left:-100%; width:60%; height:100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
          animation: shimmer 3s ease-in-out 1s infinite;
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={titleStyle}>SIGN IN</h2>
        <p style={subtitleStyle}>authenticate to access your universe</p>
        {/* Decorative line */}
        <div style={{
          width: "100%", height: 1,
          background: "linear-gradient(90deg, rgba(79,107,255,0.5), rgba(168,85,247,0.3), transparent)",
        }} />
      </div>

      {error && <div style={errorStyle}>⚠ {error}</div>}

      {/* Input: Username */}
      <div style={inputWrapStyle}>
        <label style={labelStyle}>Identifier</label>
        <div style={{ position: "relative" }}>
          {/* Icon */}
          <svg style={{
            position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
            opacity: 0.45, pointerEvents: "none",
          }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(140,170,255,1)" strokeWidth="2">
            <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
          <input
            type="text"
            placeholder="username or email"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            style={inputStyle}
            className="space-input"
            autoComplete="username"
          />
        </div>
      </div>

      {/* Input: Password */}
      <div style={inputWrapStyle}>
        <label style={labelStyle}>Access Code</label>
        <div style={{ position: "relative" }}>
          {/* Icon */}
          <svg style={{
            position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
            opacity: 0.45, pointerEvents: "none",
          }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(140,170,255,1)" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <input
            type="password"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            className="space-input"
            autoComplete="current-password"
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
        </div>
      </div>

      {/* Button */}
      <button
        onClick={handleLogin}
        disabled={loading}
        style={loading ? buttonDisabledStyle : buttonStyle}
        className="login-btn"
      >
        {loading ? "◌  AUTHENTICATING..." : "⟶  LAUNCH"}
      </button>

      {/* Footer hint */}
      <p style={{
        marginTop: 20, fontSize: "0.7rem",
        color: "rgba(100,130,200,0.35)",
        textAlign: "center",
        letterSpacing: "0.1em",
      }}>
      
      </p>
    </div>

  </div>
</div>
    </>
  );
}