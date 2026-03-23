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
    fontFamily: "Arial, sans-serif",
  };

  const cardStyle: React.CSSProperties = {
    background: "rgba(10, 10, 30, 0.30)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(18px) saturate(140%)",
    padding: "26px",
    borderRadius: "18px",
    width: "320px",
    textAlign: "center",
    border: "1px solid rgba(255,255,255,0.15)",
    boxShadow: `
      0 0 60px rgba(120, 100, 255, 0.35),
      0 25px 70px rgba(0,0,0,0.8)
    `,
  };

  const titleStyle: React.CSSProperties = {
    color: "#4f6bff",
    fontSize: "2rem",
    fontWeight: 800,
    marginBottom: "20px",
  };

  const inputStyle: React.CSSProperties = {
    padding: "10px",
    marginBottom: "12px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "rgba(0,0,0,0.65)",
    color: "white",
    fontSize: "16px",
    outline: "none",
    width: "100%",
  };

  const buttonStyle: React.CSSProperties = {
    padding: "10px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#0278f7",
    fontWeight: 700,
    cursor: "pointer",
    width: "100%",
    color: "white",
  };

  const buttonDisabledStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: "#555",
    cursor: "not-allowed",
  };

  const errorStyle: React.CSSProperties = {
    color: "#ff4d4f",
    marginBottom: "10px",
    fontSize: "0.9rem",
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
        <div style={cardStyle}>
          {/* Avatar Container */}
          <div style={{ position: "relative", width: 100, height: 100, margin: "0 auto 24px" }}>

            {/* Rotating dashed ring */}
            <div style={{
              position: "absolute", inset: -8,
              borderRadius: "50%",
              border: "2px dashed rgba(100, 130, 255, 0.5)",
              animation: "spin 6s linear infinite",
            }} />

            {/* Rotating solid ring (counter) */}
            <div style={{
              position: "absolute", inset: -14,
              borderRadius: "50%",
              border: "1.5px solid transparent",
              background: "linear-gradient(#0a0a1e, #0a0a1e) padding-box, linear-gradient(135deg, #4f6bff, #a855f7, #06b6d4) border-box",
              animation: "spinReverse 4s linear infinite",
            }} />

            {/* Glow pulse */}
            <div style={{
              position: "absolute", inset: -4,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(79,107,255,0.35) 0%, transparent 70%)",
              animation: "pulse 2.5s ease-in-out infinite",
            }} />

            {/* Dot orbiting */}
            <div style={{
              position: "absolute", inset: -10,
              borderRadius: "50%",
              animation: "spin 3s linear infinite",
            }}>
              <div style={{
                position: "absolute", top: "50%", left: -3,
                width: 6, height: 6,
                borderRadius: "50%",
                background: "#4f6bff",
                boxShadow: "0 0 8px #4f6bff, 0 0 16px #4f6bff",
                transform: "translateY(-50%)",
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
                border: "2px solid rgba(79,107,255,0.6)",
                boxShadow: "0 0 20px rgba(79,107,255,0.5), 0 0 40px rgba(168,85,247,0.3)",
                position: "relative", zIndex: 1,
              }}
            />
          </div>

          {/* Keyframes — ใส่ครั้งเดียวในไฟล์ */}
          <style>{`
  @keyframes spin         { from { transform: rotate(0deg) }   to { transform: rotate(360deg) } }
  @keyframes spinReverse  { from { transform: rotate(0deg) }   to { transform: rotate(-360deg) } }
  @keyframes pulse        { 0%,100% { opacity: 0.5; transform: scale(1) }  50% { opacity: 1; transform: scale(1.08) } }
`}</style>
          <h2 style={titleStyle}>SIGN IN</h2>

          {error && <div style={errorStyle}>{error}</div>}

          <input
            type="text"
            placeholder="Username or Email"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            style={inputStyle}
            autoComplete="username"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            autoComplete="current-password"
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            style={loading ? buttonDisabledStyle : buttonStyle}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* <p style={{ marginTop: 20, fontSize: "0.9rem", color: "white" }}>
            Don't have an account?{" "}
            <span
              style={{ color: "#667eea", cursor: "pointer" }}
              onClick={() => navigate("/register")}
            >
              sign up
            </span>
          </p> */}
        </div>
      </div>
    </>
  );
}