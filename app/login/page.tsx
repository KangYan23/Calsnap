"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const cn = (
  ...classes: Array<string | undefined | null | false>
) => classes.filter(Boolean).join(" ");

export default function LoginPage() {
  const [showSignup, setShowSignup] = useState(false);
  const [loginData, setLoginData] = useState({
    username: "",
    password: ""
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Login failed");
      }

      // Login successful - redirect to calculator
      window.location.href = "/calculator";
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setLoginData(prev => ({
      ...prev,
      [field]: value
    }));
    setLoginError(null); // Clear error when user types
  };

  return (
    <main>
      <div
        className={cn(
          "relative flex min-h-[100vh] items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-white text-slate-950"
        )}
      >
        {/* Floating abstract shapes */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 0.5, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeInOut" }}
            className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-green-200 blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 0.4, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: "easeInOut" }}
            className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-blue-200 blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 0.25, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.3, ease: "easeInOut" }}
            className="absolute left-1/3 top-1/4 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-300/70 blur-[60px]"
          />
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 w-full max-w-md rounded-3xl bg-white/80 p-8 shadow-xl backdrop-blur-md border border-white/60"
        >
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-slate-800">Welcome back</h1>
            <p className="mt-1 text-sm text-slate-500">Log in to continue your journey</p>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            {loginError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 text-red-600">⚠️</div>
                  <p className="text-red-700 text-sm">{loginError}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-slate-700">
                Username
              </label>
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={loginData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-slate-800 placeholder-slate-400 shadow-sm outline-none transition focus:border-green-400 focus:ring-2 focus:ring-green-200"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={loginData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-slate-800 placeholder-slate-400 shadow-sm outline-none transition focus:border-green-400 focus:ring-2 focus:ring-green-200"
                required
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={isLoggingIn}
                size="lg"
                className="w-full rounded-full px-6 py-3 text-lg font-semibold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
              >
                {isLoggingIn ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Logging in...
                  </div>
                ) : (
                  "Login"
                )}
              </Button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don’t have an account?{" "}
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setShowSignup(true);
              }}
              className="font-medium text-green-700 underline-offset-4 hover:text-green-800 hover:underline"
            >
              Create one
            </Link>
          </p>
        </motion.div>

        {/* Signup Modal */}
        {showSignup && (
          <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="signup-title"
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h2 id="signup-title" className="text-xl font-semibold text-slate-800">
                    Create your account
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">It only takes a moment.</p>
                </div>
                <button
                  onClick={() => setShowSignup(false)}
                  className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <form
                className="space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.currentTarget as HTMLFormElement;
                  const usernameInput = form.querySelector<HTMLInputElement>("#signup-username");
                  const passwordInput = form.querySelector<HTMLInputElement>("#signup-password");
                  const username = usernameInput?.value.trim() ?? "";
                  const password = passwordInput?.value.trim() ?? "";

                  const res = await fetch("/api/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password }),
                  });
                  const data = await res.json();
                  if (!res.ok) {
                    alert(data?.error ?? "Registration failed");
                    return;
                  } 
                  alert("Account created successfully");
                  setShowSignup(false);
                }}
              >
                <div className="space-y-2">
                  <label htmlFor="signup-username" className="text-sm font-medium text-slate-700">
                    Username
                  </label>
                  <input
                    id="signup-username"
                    type="text"
                    placeholder="Choose a username"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 placeholder-slate-400 shadow-sm outline-none transition focus:border-green-400 focus:ring-2 focus:ring-green-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="signup-password" className="text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 placeholder-slate-400 shadow-sm outline-none transition focus:border-green-400 focus:ring-2 focus:ring-green-200"
                    required
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    type="submit"
                    size="lg"
                    className="flex-1 rounded-full px-3 py-1 text-lg font-semibold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Create account
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full px-3 py-1"
                    onClick={() => setShowSignup(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </main>
  );
}


