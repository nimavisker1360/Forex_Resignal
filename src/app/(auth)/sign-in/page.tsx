import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mail, Lock, LogIn, ArrowRight } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="bg-card border rounded-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Sign In</h1>
          <p className="text-muted-foreground">
            Sign in to your account to access exclusive signals
          </p>
        </div>

        <form className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                id="email"
                type="email"
                className="w-full p-3 pl-10 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <Link href="#" className="text-xs text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                id="password"
                type="password"
                className="w-full p-3 pl-10 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="********"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="remember"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label
              htmlFor="remember"
              className="ml-2 block text-sm text-muted-foreground"
            >
              Remember me
            </label>
          </div>

          <Button className="w-full flex items-center justify-center">
            <LogIn className="mr-2 h-5 w-5" />
            Sign In
          </Button>
        </form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or sign in with
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3">
            <Button variant="outline" className="w-full">
              Sign in with Google
            </Button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">Don't have an account?</span>
          <Link href="/sign-up" className="ml-1 text-primary hover:underline">
            Sign Up
            <ArrowRight className="inline ml-1 h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
