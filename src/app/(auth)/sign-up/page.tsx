"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Lock, User, ArrowLeft } from "lucide-react";
import { signIn, signUp } from "@/lib/auth-client";
import { getSignUpAuthErrorFallbackMessage, getSignUpAuthErrorMessage } from "@/lib/auth-errors";

function getSafeRedirectPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }

  return value;
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
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
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpForm />
    </Suspense>
  );
}

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = useMemo(
    () => getSafeRedirectPath(searchParams.get("redirect")),
    [searchParams]
  );
  const loginHref = `/login?redirect=${encodeURIComponent(redirectPath)}`;
  const authError = searchParams.get("error");
  const errorCallbackURL = `/sign-up?redirect=${encodeURIComponent(redirectPath)}`;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
  const isEmailSignUpDisabled =
    loading ||
    !trimmedName ||
    !isEmailValid ||
    password.length < 8 ||
    confirmPassword.length < 8 ||
    password !== confirmPassword ||
    !acceptedTerms;

  useEffect(() => {
    const authErrorMessage = authError ? getSignUpAuthErrorFallbackMessage(authError) : "";

    if (authErrorMessage) {
      setError(authErrorMessage);
    }
  }, [authError]);

  async function handleEmailSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!trimmedName || !isEmailValid || password.length < 8 || confirmPassword.length < 8) {
      setError("Please complete all required fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!acceptedTerms) {
      setError("You must accept the terms and conditions");
      return;
    }

    setLoading(true);

    try {
      const res = await signUp.email({
        name: trimmedName,
        email: trimmedEmail,
        password,
      });

      if (res.error) {
        setError(getSignUpAuthErrorMessage(res.error.code) || res.error.message || "Sign up failed");
        return;
      }

      router.push(redirectPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignUp() {
    setError("");
    setLoading(true);

    try {
      const res = await signIn.social({
        provider: "google",
        callbackURL: redirectPath,
        errorCallbackURL,
        disableRedirect: true,
      });

      if (res.error) {
        setError(getSignUpAuthErrorMessage(res.error.code) || res.error.message || "Google sign up failed");
        setLoading(false);
        return;
      }

      if (res.data?.url) {
        window.location.assign(res.data.url);
        return;
      }

      setError("Google sign up failed");
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign up failed");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 text-slate-950">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-slate-950">Create Account</h1>
          <p className="text-sm leading-6 text-slate-500">
            Welcome to the world of Forex signals by creating an account
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleEmailSignUp}>
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-semibold text-slate-700">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white p-3 pl-10 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white p-3 pl-10 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white p-3 pl-10 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                placeholder="Minimum 8 characters"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                id="confirm-password"
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white p-3 pl-10 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                placeholder="Confirm password"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="terms"
              type="checkbox"
              required
              checked={acceptedTerms}
              onChange={(event) => setAcceptedTerms(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor="terms"
              className="ml-2 block text-sm text-slate-600"
            >
              I agree to the{" "}
              <Link href="#" className="font-medium text-blue-600 hover:text-blue-700 hover:underline">
                Terms and Conditions
              </Link>
            </label>
          </div>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <Button
            className="h-12 w-full rounded-lg bg-blue-600 text-base font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            disabled={isEmailSignUpDisabled}
          >
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 font-semibold text-slate-400">
                Or sign up with
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-700 shadow-sm hover:border-slate-400 hover:bg-slate-50 hover:text-slate-950"
              disabled={loading}
              onClick={handleGoogleSignUp}
            >
              {!loading && <GoogleIcon />}
              {loading ? "Connecting..." : "Sign up with Google"}
            </Button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm">
          <span className="text-slate-500">
            Already have an account?
          </span>
          <Link href={loginHref} className="ml-1 font-semibold text-blue-600 hover:text-blue-700 hover:underline">
            Sign In
            <ArrowLeft className="inline ml-1 h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
