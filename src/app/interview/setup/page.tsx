"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, FileText, Briefcase, GraduationCap } from "lucide-react";
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

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to parse file");

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

    // Save context to sessionStorage so the Interview page can pick it up
    sessionStorage.setItem("interview_role", role);
    sessionStorage.setItem("interview_education", education);
    sessionStorage.setItem("interview_cv", cvText || "");

    router.push("/interview");
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 shadow-inner">
      <div className="max-w-3xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>
        
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ fontFamily: "var(--font-heading)" }}>Configure Your Interview</h1>
          <p className="text-muted-foreground">Tell our AI about the role, your background, and upload your CV so it can generate highly relevant technical and behavioral questions.</p>
        </header>

        <form className="space-y-8" onSubmit={handleStart}>
          {error && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-md text-sm border border-destructive/20">
              {error}
            </div>
          )}

          <div className="glass p-8 rounded-2xl border space-y-6">
            
            {/* Role */}
            <div>
              <label htmlFor="role" className="flex items-center text-sm font-medium mb-2">
                <Briefcase className="w-4 h-4 mr-2 text-primary" /> Target Role / Position
              </label>
              <input
                id="role"
                type="text"
                placeholder="e.g. Senior Frontend Engineer, Product Manager"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="w-full bg-input/50 border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

            {/* Education */}
            <div>
              <label htmlFor="education" className="flex items-center text-sm font-medium mb-2">
                <GraduationCap className="w-4 h-4 mr-2 text-primary" /> Level of Education
              </label>
              <input
                id="education"
                type="text"
                placeholder="e.g. B.S. in Computer Science, Self-taught"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                required
                className="w-full bg-input/50 border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

            <hr className="border-border/50" />

            {/* CV Upload */}
            <div>
              <label className="flex items-center text-sm font-medium mb-2">
                <FileText className="w-4 h-4 mr-2 text-primary" /> Upload Resume / CV (Optional)
              </label>
              <p className="text-xs text-muted-foreground mb-4">We extract text from your PDF to provide context about past projects to the AI.</p>
              
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center relative hover:bg-muted/50 transition-colors">
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
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  )}
                  
                  <span className="text-sm font-medium">
                    {parsing ? "Parsing document..." : cvFile ? `Selected: ${cvFile.name}` : "Click or drag file to upload"}
                  </span>
                  {!cvFile && !parsing && <span className="text-xs text-muted-foreground">PDF or TXT up to 5MB</span>}
                </div>
              </div>
              
              {/* Fallback Text Area */}
              <div className="mt-4">
                <p className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider">Or paste CV text directly:</p>
                <textarea
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                  placeholder="Paste the text content of your resume here..."
                  rows={4}
                  className="w-full bg-input/50 border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-y"
                />
              </div>
            </div>

          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={parsing}
              className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              Initialize Interview Engine
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
