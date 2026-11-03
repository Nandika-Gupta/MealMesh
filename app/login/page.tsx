
"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [message, setMessage] = useState("");

  function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email || !password) {
      setMessage("Please enter your email and password.");
      return;
    }

    setMessage(
      "Login form validated! Authentication will be enabled after backend integration."
    );
  }

  return (
    <main className="auth-page">
      <div className="auth-left">
        <Link href="/" className="brand auth-brand">
          <span className="brand-icon">🥬</span>
          <span>Meal<span className="brand-highlight">Mesh</span></span>
        </Link>

        <div className="auth-left-content">
          <div className="eyebrow">A COMMUNITY THAT CARES</div>

          <h1>
            Welcome
            <br />
            <span>back.</span>
          </h1>

          <p>
            Good to see you again! Continue being part of a community
            that believes in sharing more, wasting less and making
            every meal count.
          </p>

          <div className="auth-benefits">
            <div><span>✓</span> Discover surplus food nearby</div>
            <div><span>✓</span> Share food with your community</div>
            <div><span>✓</span> Make a meaningful difference</div>
          </div>
        </div>

        <p className="auth-left-footer">
          Together, we can make every meal count. 🌱
        </p>
      </div>

      <div className="auth-right">
        <div className="auth-form-container">
          <div className="auth-heading">
            <div className="section-tag">WELCOME BACK</div>
            <h2>Log in to MealMesh</h2>
            <p>Enter your details to access your account.</p>
          </div>

          <form className="auth-form" onSubmit={handleLogin}>
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label htmlFor="password">Password</label>
            <div style={{ position: "relative" }}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingRight: "65px" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  border: "none",
                  background: "transparent",
                  color: "#39734b",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "10px",
              fontSize: "12px",
            }}>
              <label className="terms-label" style={{ margin: 0 }}>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Remember me
              </label>

              <Link href="/forgot-password" style={{ color: "#39734b" }}>
                Forgot password?
              </Link>
            </div>

            {message && (
              <div className="auth-message">{message}</div>
            )}

            <button type="submit" className="auth-submit">
              Log in <span>→</span>
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?{" "}
            <Link href="/signup">Create account</Link>
          </p>

          <Link href="/" className="back-home">
            ← Back to homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
