"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bot, ArrowLeft } from "lucide-react";
import { account } from "@/lib/appwrite";
import { ID, AppwriteException } from "appwrite";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (formData.password.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }
      
      try {
        // Try to delete any active session before creating a real one
        await account.deleteSession('current');
      } catch (e) {
        // Ignored if no session exists
      }

      // 1. Create account
      try {
        await account.create(
          ID.unique(),
          formData.email,
          formData.password,
          formData.name
        );
      } catch (createErr: any) {
        // If the user already exists, we can still try to log them in
        if (createErr.code !== 409) {
          throw createErr;
        }
      }

      // 2. Immediately log them in
      await account.createEmailPasswordSession(formData.email, formData.password);

      router.push("/dashboard");
    } catch (err: any) {
      if (err instanceof AppwriteException) {
        if (err.type === "user_session_already_exists") {
           // We are actually already logged in
           router.push("/dashboard");
        } else if (err.code === 401) {
           setError("Registration succeeded, but login requires email verification (Check Appwrite Auth settings).");
        } else {
           setError(err.message);
        }
      } else {
        setError(err.message || "Failed to create account.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8 bg-background relative overflow-hidden">
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#3b82f6] to-[#8b5cf6] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md absolute top-8 left-8">
         <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to home
         </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="rounded-xl bg-primary/10 p-3 ring-1 ring-primary/20">
            <Bot className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Level up your career with AI mock interviews today.
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="glass rounded-2xl px-6 py-10 shadow border sm:px-12 bg-card/50">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-destructive/10 p-4">
                <div className="text-sm text-destructive">{error}</div>
              </div>
            )}
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium leading-6 text-foreground">
                Full Name
              </label>
              <div className="mt-2">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="block w-full rounded-md border-0 py-2.5 px-4 text-foreground shadow-sm ring-1 ring-inset ring-border bg-input/50 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-foreground">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="block w-full rounded-md border-0 py-2.5 px-4 text-foreground shadow-sm ring-1 ring-inset ring-border bg-input/50 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 outline-none transition-all"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-foreground">
                Password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="block w-full rounded-md border-0 py-2.5 px-4 text-foreground shadow-sm ring-1 ring-inset ring-border bg-input/50 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md bg-primary px-3 py-2.5 text-sm font-semibold leading-6 text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Signing up..." : "Sign up"}
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold leading-6 text-primary hover:text-primary/80 transition-colors">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
