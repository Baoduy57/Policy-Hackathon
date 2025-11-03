"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Role } from "../types";
import { useAppContext } from "../contexts/AppContext";

interface AuthFormProps {
  mode: "login" | "register";
}

const AuthForm: React.FC<AuthFormProps> = ({ mode }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [teamName, setTeamName] = useState("");
  const [role, setRole] = useState<Role>(Role.Contestant);
  const [error, setError] = useState("");
  const router = useRouter();
  const { handleAuthSuccess } = useAppContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !email ||
      !password ||
      (mode === "register" && role === Role.Contestant && !teamName)
    ) {
      setError("All fields are required.");
      return;
    }
    setError("");

    try {
      const endpoint =
        mode === "register" ? "/api/auth/register" : "/api/auth/login";
      const body: any = { email, password };

      if (mode === "register") {
        body.role = role;
        if (role === Role.Contestant) {
          body.teamName = teamName;
        }
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      console.log("[AuthForm] Response status:", response.status);

      const data = await response.json();
      console.log("[AuthForm] Response data:", data);

      if (!response.ok) {
        setError(data.error || "Authentication failed");
        return;
      }

      // Transform API response to match User type
      const user: User = {
        id: data.user.id,
        email: data.user.email,
        role: data.user.role as Role,
        teamId: data.user.teamId,
        teamName: data.user.teamName,
      };

      console.log("[AuthForm] Login successful, user:", user.email, user.role);
      console.log("[AuthForm] Calling handleAuthSuccess");
      handleAuthSuccess(user, mode);
    } catch (err: any) {
      console.error("[AuthForm] Error:", err);
      setError(err.message || "An error occurred. Please try again.");
    }
  };

  const isRegister = mode === "register";

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
      <div className="w-full max-w-md p-8 md:p-10 space-y-6 bg-white rounded-xl shadow-xl border border-slate-200">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            {isRegister ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-slate-500 mt-2">
            {isRegister
              ? "Sign up to join the hackathon."
              : "Sign in to continue."}
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <p className="text-red-500 text-sm text-center font-medium">
              {error}
            </p>
          )}

          <div className="relative">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block px-4 py-3 w-full text-base text-slate-900 bg-slate-50 rounded-lg border-2 border-slate-200 appearance-none focus:outline-none focus:ring-0 focus:border-sky-500 peer"
              placeholder=" "
            />
            <label
              htmlFor="email"
              className="absolute text-base text-slate-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-slate-50 px-2 peer-focus:px-2 peer-focus:text-sky-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-2"
            >
              Email Address
            </label>
          </div>

          <div className="relative">
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block px-4 py-3 w-full text-base text-slate-900 bg-slate-50 rounded-lg border-2 border-slate-200 appearance-none focus:outline-none focus:ring-0 focus:border-sky-500 peer"
              placeholder=" "
            />
            <label
              htmlFor="password"
              className="absolute text-base text-slate-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-slate-50 px-2 peer-focus:px-2 peer-focus:text-sky-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-2"
            >
              Password
            </label>
          </div>

          {isRegister && (
            <>
              <div>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="block w-full px-4 py-3 text-base text-slate-900 bg-slate-50 rounded-lg border-2 border-slate-200 appearance-none focus:outline-none focus:ring-0 focus:border-sky-500"
                >
                  <option value={Role.Contestant}>Role: Contestant</option>
                  <option value={Role.Judge}>Role: Judge</option>
                  <option value={Role.Admin}>Role: Admin</option>
                </select>
              </div>
              {role === Role.Contestant && (
                <div className="relative">
                  <input
                    type="text"
                    id="teamName"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="block px-4 py-3 w-full text-base text-slate-900 bg-slate-50 rounded-lg border-2 border-slate-200 appearance-none focus:outline-none focus:ring-0 focus:border-sky-500 peer"
                    placeholder=" "
                  />
                  <label
                    htmlFor="teamName"
                    className="absolute text-base text-slate-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-slate-50 px-2 peer-focus:px-2 peer-focus:text-sky-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-2"
                  >
                    Team Name
                  </label>
                </div>
              )}
            </>
          )}

          {!isRegister && (
            <div className="flex items-center justify-end">
              <a
                href="#"
                className="text-sm font-medium text-sky-600 hover:underline"
              >
                Forgot password?
              </a>
            </div>
          )}

          <button
            type="submit"
            className="w-full px-4 py-3 font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all"
          >
            {isRegister ? "Register" : "Sign In"}
          </button>
        </form>
        <div className="text-center text-sm text-slate-500">
          {isRegister ? "Already have an account?" : "Don't have an account?"}
          <button
            onClick={() => router.push(isRegister ? "/login" : "/register")}
            className="ml-1 font-semibold text-sky-600 hover:underline"
          >
            {isRegister ? "Sign in" : "Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
