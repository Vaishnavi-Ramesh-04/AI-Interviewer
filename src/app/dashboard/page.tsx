"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { account, databases } from "@/lib/appwrite";
import { Query } from "appwrite";
import Link from "next/link";
import { LogOut, Activity, Clock, BarChart3, Settings, Play } from "lucide-react";

const DB_ID = "interviews_db";
const COLL_ID = "interviews";

export default function Dashboard() {
  const router = useRouter();
   const initializedRef = useRef(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loadingObj, setLoadingObj] = useState(true);
  
  // Stats State
  const [interviews, setInterviews] = useState<any[]>([]);
  const [stats, setStats] = useState({
     total: 0,
     hours: 0,
     avgConfidence: 0
  });

   const isUnauthorizedError = (err: any) => {
      const code = Number(err?.code);
      const message = String(err?.message || "").toLowerCase();
      const type = String(err?.type || "").toLowerCase();

      return (
         code === 401 ||
         code === 403 ||
         type.includes("unauthorized") ||
         message.includes("not authorized") ||
         message.includes("unauthorized")
      );
   };

  useEffect(() => {
    async function init() {
      try {
        const u = await account.get();
        setUserProfile(u);

            try {
               // Fetch User's Interviews
               const response = await databases.listDocuments(DB_ID, COLL_ID, [
                   Query.equal("userId", u.$id),
                   Query.orderDesc("createdAt"),
                   Query.limit(50)
               ]);

               const docs = response.documents;
               setInterviews(docs);

               // Calculate Stats
               let totalHrs = 0;
               let totalConf = 0;
               let confCount = 0;

               docs.forEach((doc) => {
                   // Duration is assumed to be in minutes
                   totalHrs += (doc.duration || 0) / 60;
                   if (doc.confidence) {
                        totalConf += doc.confidence;
                        confCount++;
                   }
               });

               setStats({
                   total: response.total,
                   hours: Number(totalHrs.toFixed(1)),
                   avgConfidence: confCount > 0 ? Math.round(totalConf / confCount) : 0
               });
            } catch (err: any) {
               // Keep the user on dashboard if only interview data is blocked by collection/document permissions.
               if (isUnauthorizedError(err)) {
                  console.warn("Dashboard data permissions issue:", err?.message || err);
                  setInterviews([]);
                  setStats({ total: 0, hours: 0, avgConfidence: 0 });
               } else {
                  throw err;
               }
            }

         } catch (err: any) {
            console.error("Dashboard auth/init error:", err);
            if (isUnauthorizedError(err)) {
               router.push("/auth/login");
            }
      } finally {
        setLoadingObj(false);
      }
    }

      if (initializedRef.current) return;
      initializedRef.current = true;
    init();
  }, [router]);

  const handleLogout = async () => {
    await account.deleteSession("current");
    router.push("/");
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  if (loadingObj) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-dot-pattern opacity-[0.3] z-0"></div>
      
      <nav className="relative z-20 bg-background/80 backdrop-blur-md border-b sticky top-0">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="grid grid-cols-2 gap-[2px]">
               <div className="w-1.5 h-1.5 bg-primary rounded-sm"></div>
               <div className="w-1.5 h-1.5 bg-primary/60 rounded-sm"></div>
               <div className="w-1.5 h-1.5 bg-foreground rounded-sm"></div>
               <div className="w-1.5 h-1.5 bg-foreground/60 rounded-sm"></div>
            </div>
            <span className="font-bold text-lg tracking-tight">AuraMock</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground mr-2">
              Hello, {userProfile?.name?.split(" ")[0]}
            </span>
            <button
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive transition-colors p-2 rounded-full hover:bg-destructive/10"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-[1200px] mx-auto px-6 py-12 relative z-10">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
           <div>
             <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back, {userProfile?.name}</h1>
             <p className="text-muted-foreground">Ready to crush your next interview? Let's check your stats.</p>
           </div>
           <Link 
              href="/interview/setup" 
              className="flex items-center bg-primary text-white px-6 py-3 rounded-full font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all hover:-translate-y-0.5"
           >
              <Play className="w-4 h-4 mr-2 fill-current" />
              Start New Interview
           </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-card border rounded-3xl p-6 shadow-sm relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-muted-foreground">Total Sessions</h3>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><Activity className="w-4 h-4" /></div>
            </div>
            <div className="text-4xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground mt-2">Recorded overall</div>
          </div>

          <div className="bg-card border rounded-3xl p-6 shadow-sm relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-24 h-24 bg-purple-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-muted-foreground">Practice Time</h3>
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600"><Clock className="w-4 h-4" /></div>
            </div>
            <div className="text-4xl font-bold">{stats.hours}<span className="text-lg text-muted-foreground font-normal ml-1">hrs</span></div>
            <div className="text-xs text-muted-foreground mt-2">Across all technical topics</div>
          </div>

          <div className="bg-card border rounded-3xl p-6 shadow-sm relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-24 h-24 bg-green-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-muted-foreground">Avg Confidence</h3>
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600"><BarChart3 className="w-4 h-4" /></div>
            </div>
            <div className="text-4xl font-bold">{stats.avgConfidence}<span className="text-lg text-muted-foreground font-normal ml-1">%</span></div>
            <div className="text-xs text-muted-foreground mt-2">Based on emotion analysis</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           <div className="lg:col-span-2 space-y-6">
              <h2 className="text-lg font-bold flex items-center"><Activity className="w-5 h-5 mr-2 text-primary" /> Recent Interviews</h2>
              
              <div className="bg-card border rounded-3xl p-2 shadow-sm">
                 {interviews.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                       <p className="text-sm font-medium mb-2">No interviews recorded yet.</p>
                       <p className="text-xs">Click 'Start New Interview' to begin your first session.</p>
                    </div>
                 ) : (
                    interviews.slice(0, 5).map((interview) => (
                       <div key={interview.$id} className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-2xl transition-colors cursor-pointer border-b last:border-b-0">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-gray-500">
                                {interview.role ? interview.role.substring(0, 2).toUpperCase() : "NA"}
                             </div>
                             <div>
                                <div className="font-semibold text-sm">{interview.role || "General Interview"}</div>
                                <div className="text-xs text-muted-foreground">{formatDate(interview.createdAt)} • {interview.duration} mins</div>
                             </div>
                          </div>
                          <div className="flex items-center gap-3">
                             <div className="text-right hidden sm:block">
                                <div className={`text-xs font-semibold ${interview.score >= 80 ? 'text-success' : interview.score >= 60 ? 'text-warning' : 'text-destructive'}`}>
                                   Score: {interview.score}/100
                                </div>
                                <div className="text-[10px] text-muted-foreground truncate max-w-[150px]">{interview.feedback || "Pending review"}</div>
                             </div>
                             <div className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-background"><Settings className="w-4 h-4 text-muted-foreground" /></div>
                          </div>
                       </div>
                    ))
                 )}
              </div>
           </div>

           <div className="space-y-6">
              <h2 className="text-lg font-bold flex items-center"><Settings className="w-5 h-5 mr-2 text-primary" /> Recommended Focus</h2>
              <div className="bg-card border rounded-3xl p-6 shadow-sm space-y-4">
                 {interviews.length === 0 ? (
                    <p className="text-sm text-center text-muted-foreground py-4">Data is populated after your first complete AI session.</p>
                 ) : (
                    <>
                       {interviews[0]?.confidence < 70 && (
                          <div className="p-3 bg-red-50 text-red-900 border border-red-100 rounded-xl">
                             <div className="text-xs font-bold mb-1 uppercase tracking-wider text-red-700">Weakness Detected</div>
                             <p className="text-sm font-medium mb-1">Low Expressive Confidence</p>
                             <p className="text-xs opacity-80">Our camera feed detected high nervousness in your last session.</p>
                          </div>
                       )}

                       <div className="p-3 bg-blue-50 text-blue-900 border border-blue-100 rounded-xl">
                          <div className="text-xs font-bold mb-1 uppercase tracking-wider text-blue-700">Skill to review</div>
                          <p className="text-sm font-medium mb-1">Real-time Answering Strategy</p>
                          <p className="text-xs opacity-80">Make sure to structure your past experiences heavily around Results.</p>
                       </div>

                       <div className="p-3 border rounded-xl hover:bg-muted/30 cursor-pointer transition-colors text-center mt-4">
                          <span className="text-xs font-semibold text-muted-foreground">View Full Analytics Report</span>
                       </div>
                    </>
                 )}
              </div>
           </div>

        </div>

      </main>
    </div>
  );
}
