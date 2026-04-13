"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { account, ID } from "@/lib/appwrite";
import Link from "next/link";
import { Mail, Lock, EyeOff, Eye, UserPlus, User } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      try {
        await account.deleteSession("current");
      } catch (e) {}

      await account.create(ID.unique(), email, password, name);
      await account.createEmailPasswordSession(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      if (err?.type === "user_already_exists") {
        setError("An account with this email already exists.");
      } else {
        setError(err.message || "Failed to create account. Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center font-sans overflow-hidden">
      
      {/* Background Image: Blue Sky & Clouds */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80&w=2500&auto=format&fit=crop')",
        }}
      ></div>
      {/* Soft overlay to ensure readability */}
      <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] z-0"></div>

      {/* Decorative Concentric Arcs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border-[1px] border-white/40 rounded-full z-0 opacity-50"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] border-[1px] border-white/20 rounded-full z-0 opacity-30"></div>

      {/* Top Left Logo */}
      <div className="absolute top-8 left-8 z-20 flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
        <div className="bg-black text-white p-1.5 rounded-lg flex items-center justify-center">
           <div className="grid grid-cols-2 gap-[2px]">
             <div className="w-1.5 h-1.5 bg-white rounded-sm"></div>
             <div className="w-1.5 h-1.5 bg-white/60 rounded-sm"></div>
             <div className="w-1.5 h-1.5 bg-white rounded-sm"></div>
             <div className="w-1.5 h-1.5 bg-white/60 rounded-sm"></div>
           </div>
        </div>
        <span className="font-bold text-lg text-black tracking-tight">AuraMock</span>
      </div>

      {/* Register Card Container */}
      <div className="relative z-10 w-full max-w-[420px] px-6">
        <div className="bg-gradient-to-b from-blue-50/90 to-white/95 backdrop-blur-xl rounded-[32px] p-8 md:p-10 shadow-2xl border border-white/50">
          
          {/* Card Header Content */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-6">
              <UserPlus className="w-6 h-6 text-black" strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Create an account</h1>
            <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-[250px]">
              Join us to transform your interview prep into a structured success story.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-semibold text-center border border-red-100">
                {error}
              </div>
            )}

            {/* Name Input */}
            <div className="relative flex items-center">
               <div className="absolute left-4 opacity-50"><User className="w-4 h-4 text-gray-700" /></div>
               <input
                 type="text"
                 required
                 value={name}
                 onChange={(e) => setName(e.target.value)}
                 className="w-full bg-gray-100/80 border border-transparent rounded-xl py-3.5 pl-11 pr-4 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-blue-100 transition-all"
                 placeholder="Full Name"
                 autoComplete="name"
               />
            </div>

            {/* Email Input */}
            <div className="relative flex items-center">
               <div className="absolute left-4 opacity-50"><Mail className="w-4 h-4 text-gray-700" /></div>
               <input
                 type="email"
                 required
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 className="w-full bg-gray-100/80 border border-transparent rounded-xl py-3.5 pl-11 pr-4 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-blue-100 transition-all"
                 placeholder="Email"
                 autoComplete="email"
               />
            </div>

            {/* Password Input */}
            <div className="relative flex items-center">
               <div className="absolute left-4 opacity-50"><Lock className="w-4 h-4 text-gray-700" /></div>
               <input
                 type={showPassword ? "text" : "password"}
                 required
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 className="w-full bg-gray-100/80 border border-transparent rounded-xl py-3.5 pl-11 pr-12 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-blue-100 transition-all"
                 placeholder="Password (min. 8 characters)"
                 autoComplete="new-password"
                 minLength={8}
               />
               <button 
                 type="button" 
                 onClick={() => setShowPassword(!showPassword)}
                 className="absolute right-4 opacity-50 hover:opacity-100 transition-opacity"
               >
                 {showPassword ? <Eye className="w-4 h-4 text-gray-700" /> : <EyeOff className="w-4 h-4 text-gray-700" />}
               </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a1a1a] text-white rounded-xl py-3.5 text-sm font-bold shadow-md hover:bg-black hover:shadow-lg focus:ring-4 focus:ring-gray-200 transition-all disabled:opacity-50 mt-4"
            >
              {loading ? "Creating Account..." : "Sign Up Free"}
            </button>
          </form>

          {/* Social Logins Splitter */}
          <div className="mt-8 relative flex items-center justify-center">
            <div className="absolute w-full border-t border-gray-200"></div>
            <span className="relative bg-white px-3 text-[10px] uppercase font-bold text-gray-400 tracking-wider">Or register with</span>
          </div>

          <div className="mt-6 flex items-center justify-center gap-3">
             <button type="button" className="flex-1 bg-white border border-gray-100 shadow-sm rounded-xl py-3 flex justify-center items-center hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
             </button>
             <button type="button" className="flex-1 bg-white border border-gray-100 shadow-sm rounded-xl py-3 flex justify-center items-center hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.26-.74 3.58-.79 2.12-.04 3.53.64 4.5 1.58-3.26 1.84-2.61 5.71.69 6.84-1.04 2.59-2.31 4.29-3.85 4.54zm-2.87-14.1c-.81-1.22-2.21-1.9-3.43-1.87-.22 1.53.51 2.92 1.38 3.86 1.05 1.14 2.47 1.75 3.65 1.57-.14-1.48-.68-2.6-1.6-3.56z"/></svg>
             </button>
          </div>

          <p className="mt-8 text-center text-xs text-gray-500 font-medium">
            Already have an account? <Link href="/auth/login" className="text-black font-bold hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
