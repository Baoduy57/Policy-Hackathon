"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Role } from "../types";
import { useAppContext } from "../contexts/AppContext";

import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineUsers,
  HiOutlineIdentification,
  HiOutlineChevronDown,
  HiOutlineShieldCheck,
} from "react-icons/hi";

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
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="flex flex-col items-center text-center">
          {/* BƯỚC 2.3: Icon đã được thay thế */}
          <HiOutlineShieldCheck className="w-12 h-12 text-sky-600" />
          <h1 className="text-3xl font-bold text-gray-900 mt-4">
            {isRegister ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-gray-600 mt-2">
            {isRegister
              ? "Sign up to join the Policy Hackathon."
              : "Sign in to continue."}
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200">
              <p className="text-sm text-red-700 font-medium text-center">
                {error}
              </p>
            </div>
          )}

          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {/* BƯỚC 2.3: Icon đã được thay thế */}
                <HiOutlineMail className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 text-gray-900 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {/* BƯỚC 2.3: Icon đã được thay thế */}
                <HiOutlineLockClosed className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 text-gray-900 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          {isRegister && (
            <>
              {/* Role Select */}
              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Role
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {/* BƯỚC 2.3: Icon đã được thay thế */}
                    <HiOutlineIdentification className="w-5 h-5 text-gray-400" />
                  </div>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="block w-full pl-10 pr-10 py-3 text-gray-900 bg-white border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  >
                    <option value={Role.Contestant}>Contestant</option>
                    <option value={Role.Judge}>Judge</option>
                    <option value={Role.Admin}>Admin</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    {/* BƯỚC 2.3: Icon đã được thay thế */}
                    <HiOutlineChevronDown className="w-5 h-5 text-gray-500" />
                  </div>
                </div>
              </div>

              {/* Team Name Input (conditional) */}
              {role === Role.Contestant && (
                <div>
                  <label
                    htmlFor="teamName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Team Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {/* BƯỚC 2.3: Icon đã được thay thế */}
                      <HiOutlineUsers className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="teamName"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 text-gray-900 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      placeholder="e.g. The Policy Makers"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {!isRegister && (
            <div className="flex items-center justify-end">
              <a
                href="#"
                className="text-sm font-medium text-sky-600 hover:text-sky-700 hover:underline"
              >
                Forgot password?
              </a>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full px-4 py-3 font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors duration-150"
          >
            {isRegister ? "Register" : "Sign In"}
          </button>
        </form>

        {/* Toggle between Login/Register */}
        <div className="text-center text-sm text-gray-600">
          {isRegister ? "Already have an account?" : "Don't have an account?"}
          <button
            onClick={() => router.push(isRegister ? "/login" : "/register")}
            className="ml-1 font-semibold text-sky-600 hover:text-sky-700 hover:underline"
          >
            {isRegister ? "Sign in" : "Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
