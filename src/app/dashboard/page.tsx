"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { account } from "@/lib/appwrite";
import Link from "next/link";
import { LogOut, Activity, Clock, BarChart3 } from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const sessionUser = await account.get();
        setUser(sessionUser);
      } catch (err) {
        // Redirct to login if no active session is found
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
      router.push("/");
    } catch (err) {
      console.error("Failed to logout:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <Activity className="w-6 h-6 text-primary" />
              <span className="font-bold text-lg tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>AuraMock</span>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden md:inline-block">
                Welcome back, {user?.name || "User"}
              </span>
              <button 
                onClick={handleLogout}
                className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>Dashboard</h1>
          <p className="text-muted-foreground mt-1">Review your recent interview performance and start new sessions.</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border bg-card text-card-foreground shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Interviews</p>
                <h3 className="text-3xl font-bold mt-2">0</h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>
          
          <div className="p-6 rounded-2xl border bg-card text-card-foreground shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                <h3 className="text-3xl font-bold mt-2">—</h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Activity className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl border bg-card text-card-foreground shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Practice Time</p>
                <h3 className="text-3xl font-bold mt-2">0m</h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Clock className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Call to action section */}
        <div className="mt-8">
          <div className="glass rounded-2xl border p-8 md:p-12 text-center">
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>Ready for your next mock interview?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Our AI interviewer is ready. It will monitor your facial expressions and test your technical knowledge.
            </p>
            <Link href="/interview/setup" className="inline-flex justify-center items-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all duration-200">
              Start New Interview
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}
