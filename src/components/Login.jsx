import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage("Login gagal: " + error.message);
    } else {
      setMessage("Login berjaya.");
    }

    setLoading(false);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background:
          "radial-gradient(circle at top, rgba(56,189,248,0.12), transparent 30%), linear-gradient(180deg, #020617 0%, #0f172a 100%)",
        color: "#e2e8f0",
        fontFamily: "Inter, Arial, sans-serif",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "24px",
          padding: "24px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
        }}
      >
        <h1 style={{ margin: 0, color: "white", fontSize: "32px" }}>
          Mizxartstudio
        </h1>
        <p style={{ color: "#94a3b8", marginTop: "8px" }}>
          Login untuk akses dashboard studio
        </p>

        <form onSubmit={handleLogin} style={{ marginTop: "20px" }}>
          <div style={{ display: "grid", gap: "12px" }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              required
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                background: "white",
                color: "#020617",
                border: "none",
                padding: "14px",
                borderRadius: "14px",
                fontWeight: "bold",
                cursor: "pointer",
                marginTop: "6px",
              }}
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </div>
        </form>

        {message ? (
          <p style={{ marginTop: "14px", color: "#fbbf24" }}>{message}</p>
        ) : null}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.05)",
  color: "white",
  outline: "none",
  boxSizing: "border-box",
};