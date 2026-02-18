"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error logging in:", error);
      alert("Failed to login. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#F4F6FA" }}
    >
      <div
        className="w-full max-w-sm p-8 rounded-[5px] bg-white"
        style={{ border: "1px solid #1F2937" }}
      >
        {/* Icon + Title */}
        <div className="flex flex-col items-center text-center mb-8">
          <div
            className="w-12 h-12 flex items-center justify-center mb-4 rounded-[5px]"
            style={{ backgroundColor: "#1E2A5A" }}
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </div>
          <h1
            className="text-xl font-bold tracking-tight"
            style={{ color: "#1E2A5A" }}
          >
            My Library
          </h1>
          <p className="text-xs mt-1" style={{ color: "#6B7280" }}>
            Save and organize your favorite links
          </p>
        </div>

        {/* Divider */}
        <div className="mb-6" style={{ borderTop: "1px solid #F4F6FA" }} />

        {/* Google Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-white px-5 py-2.5 text-sm font-medium rounded-[5px] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ border: "1px solid #1F2937", color: "#1E2A5A" }}
        >
          {isLoading ? (
            <div
              className="w-4 h-4 border-2 border-gray-200 rounded-full animate-spin"
              style={{ borderTopColor: "#1E2A5A" }}
            ></div>
          ) : (
            <>
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        <p
          className="text-[10px] text-center mt-5 leading-relaxed"
          style={{ color: "#6B7280" }}
        >
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
