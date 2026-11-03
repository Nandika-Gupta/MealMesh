
"use client";

import { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
  const [role, setRole] = useState("recipient");
  const [message, setMessage] = useState("");

  const handleSignup = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    const form = event.currentTarget;
    const data = new FormData(form);

    const password = data.get("password") as string;
    const confirmPassword = data.get("confirmPassword") as string;

    if (password.length < 8) {
      setMessage("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setMessage(
      "Your form is valid! Account creation will be enabled after backend integration."
    );
  };

  return (
    <main className="auth-page">
      <div className="auth-left">
        <Link href="/" className="brand auth-brand">
          <span className="brand-icon">🥬</span>
          <span>
            Meal<span className="brand-highlight">Mesh</span>
          </span>
        </Link>

        <div className="auth-left-content">
          <span className="section-tag">A COMMUNITY THAT CARES</span>
          <h1>
            Share more.
            <br />
            Waste less.
            <br />
            <span>Live better.</span>
          </h1>
          <p>
            Join a growing community connecting surplus food
            with people who need it. Every small contribution
            makes a difference.
          </p>

          <div className="auth-benefits">
            <div><span>✓</span> Give surplus food a purpose</div>
            <div><span>✓</span> Discover food in your community</div>
            <div><span>✓</span> Be part of a sustainable future</div>
          </div>
        </div>

        <p className="auth-left-footer">
          Together, we can make every meal count. 🌱
        </p>
      </div>

      <div className="auth-right">
        <div className="auth-form-container">
          <div className="auth-heading">
            <span className="section-tag">GET STARTED</span>
            <h2>Create your account</h2>
            <p>Join MealMesh and become part of the change.</p>
          </div>

          <form onSubmit={handleSignup} className="auth-form">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              required
              autoComplete="name"
            />

            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
            />

            <label>I want to join as a</label>
            <div className="role-options">
              <button
                type="button"
                className={`role-option ${role === "recipient" ? "selected" : ""}`}
                onClick={() => setRole("recipient")}
                aria-pressed={role === "recipient"}
              >
                <span className="role-icon">🧑‍🤝‍🧑</span>
                <strong>Recipient</strong>
                <small>Find and claim food</small>
              </button>

              <button
                type="button"
                className={`role-option ${role === "provider" ? "selected" : ""}`}
                onClick={() => setRole("provider")}
                aria-pressed={role === "provider"}
              >
                <span className="role-icon">🍱</span>
                <strong>Provider</strong>
                <small>Share surplus food</small>
              </button>
            </div>

            <input type="hidden" name="role" value={role} />

            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="At least 8 characters"
              minLength={8}
              required
              autoComplete="new-password"
            />

            <label htmlFor="confirmPassword">Confirm password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              required
              autoComplete="new-password"
            />

            <label className="terms-label">
              <input type="checkbox" required />
              <span>
                I agree to the terms of service and privacy policy.
              </span>
            </label>

            {message && (
              <p className="auth-message" role="status">
                {message}
              </p>
            )}

            <button type="submit" className="auth-submit">
              Create account <span>→</span>
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link href="/login">Log in</Link>
          </p>

          <Link href="/" className="back-home">
            ← Back to homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
