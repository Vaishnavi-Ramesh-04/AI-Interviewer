"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, FileText, Briefcase, GraduationCap, Play } from "lucide-react";
import Link from "next/link";

export default function InterviewSetupPage() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [education, setEducation] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvText, setCvText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCvFile(file);
    setParsing(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload/cv", {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Failed to parse file. Please paste text instead.");
      }
      setCvText(data.text);
    } catch (err: any) {
      setError(err.message);
      setCvFile(null);
    } finally {
      setParsing(false);
    }
  };

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !education) {
      setError("Please fill out your target role and education level.");
      return;
    }

    // Save context to sessionStorage
    sessionStorage.setItem("interview_role", role);
    sessionStorage.setItem("interview_education", education);
    sessionStorage.setItem("interview_cv", cvText || "");

    router.push("/interview");
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 shadow-inner relative overflow-hidden font-sans">
      
      {/* Background Dots */}
      <div className="absolute inset-0 bg-dot-pattern opacity-[0.3] z-0"></div>

      <div className="max-w-3xl mx-auto relative z-10 w-full">
        <Link href="/dashboard" className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-black transition-colors mb-8 bg-white px-4 py-2 rounded-full border shadow-sm">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>
        
        <header className="mb-10 text-center">
          <div className="mx-auto w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-6">
            <FileText className="w-6 h-6 text-primary" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-3">Configure Your Interview</h1>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto">
            Tell our AI about the role, your background, and upload your CV so it can generate highly relevant technical and behavioral questions.
          </p>
        </header>

        <form className="space-y-8" onSubmit={handleStart}>
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold border border-red-100 text-center">
              {error}
            </div>
          )}

          <div className="bg-white/90 backdrop-blur-md p-8 md:p-10 rounded-[32px] shadow-xl border border-gray-100 space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Role */}
               <div>
                 <label htmlFor="role" className="flex items-center text-sm font-bold mb-3">
                   <Briefcase className="w-4 h-4 mr-2 text-primary" /> Target Role
                 </label>
                 <input
                   id="role"
                   type="text"
                   placeholder="e.g. Frontend Engineer"
                   value={role}
                   onChange={(e) => setRole(e.target.value)}
                   required
                   className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all"
                 />
               </div>

               {/* Education */}
               <div>
                 <label htmlFor="education" className="flex items-center text-sm font-bold mb-3">
                   <GraduationCap className="w-4 h-4 mr-2 text-primary" /> Education Level
                 </label>
                 <input
                   id="education"
                   type="text"
                   placeholder="e.g. B.S. Comp Sci"
                   value={education}
                   onChange={(e) => setEducation(e.target.value)}
                   required
                   className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all"
                 />
               </div>
            </div>

            <hr className="border-gray-100" />

            {/* CV Upload */}
            <div>
              <label className="flex items-center text-sm font-bold mb-2">
                <Upload className="w-4 h-4 mr-2 text-primary" /> Upload Resume / CV (Optional)
              </label>
              <p className="text-xs text-gray-500 mb-4 font-medium">We extract text from your PDF to contextually enrich questions.</p>
              
              <div className="border-2 border-dashed border-gray-300 rounded-[20px] p-8 text-center relative hover:bg-gray-50 transition-colors bg-white">
                <input
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                  {parsing ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                  ) : cvFile ? (
                    <FileText className="w-8 h-8 text-primary mb-2" />
                  ) : (
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-2">
                       <Upload className="w-6 h-6 text-primary" />
                    </div>
                  )}
                  
                  <span className="text-sm font-bold text-gray-900">
                    {parsing ? "Parsing document..." : cvFile ? `Selected: ${cvFile.name}` : "Click or drag file to upload"}
                  </span>
                  {!cvFile && !parsing && <span className="text-xs text-gray-500 font-medium">PDF or TXT up to 5MB</span>}
                </div>
              </div>
              
              {/* Fallback Text Area */}
              <div className="mt-6">
                <p className="text-[10px] font-bold mb-2 text-gray-400 uppercase tracking-wider">Or paste CV text directly:</p>
                <textarea
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                  placeholder="Paste the text content of your resume here to bypass PDF parser..."
                  rows={4}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all resize-y"
                />
              </div>
            </div>

          </div>

          <div className="flex justify-center mt-8">
            <button
              type="submit"
              disabled={parsing}
              className="bg-[#1a1a1a] text-white px-10 py-4 rounded-full font-bold shadow-xl hover:bg-black hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center"
            >
              Initialize Interview Engine <Play className="w-4 h-4 ml-2 fill-current" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
