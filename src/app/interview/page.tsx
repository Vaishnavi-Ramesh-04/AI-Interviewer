"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { account } from "@/lib/appwrite";
import { Bot, Send, User, Mic, MicOff, Camera, CameraOff, AlertCircle, Activity } from "lucide-react";
import Link from "next/link";

interface Message {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
}

export default function InterviewPage() {
  const router = useRouter();
  const [loadingObj, setLoadingObj] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Context State
  const [interviewContext, setInterviewContext] = useState({
    role: "",
    education: "",
    cvText: ""
  });

  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Camera State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState("");

  // Check auth and setup context
  useEffect(() => {
    async function init() {
      try {
        const u = await account.get();
        setUserProfile(u);

        // Load context from setup page
        const role = sessionStorage.getItem("interview_role") || "General Candidate";
        const education = sessionStorage.getItem("interview_education") || "Not specified";
        const cvText = sessionStorage.getItem("interview_cv") || "";
        
        setInterviewContext({ role, education, cvText });

        // Initial Greeting
        setMessages([
          {
            id: "1",
            role: "assistant",
            content: `Hello ${u.name.split(" ")[0]}! I'm Aura, your AI interviewer. I have your profile here for the ${role} position. Whenever you're ready, say hello and we can begin!`,
          }
        ]);

      } catch (err) {
        router.push("/auth/login");
      } finally {
        setLoadingObj(false);
      }
    }
    init();

    // Setup Speech Recognition
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setInputValue((prev) => prev ? prev + " " + currentTranscript : currentTranscript);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          // If stopped automatically, reset state
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [router]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Voice handler
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice recognition is not supported in this browser. Try Chrome or Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInputValue(""); // Clear input when starting to talk fresh
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Camera handling
  const toggleCamera = async () => {
    if (isCameraOn) {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach((track) => track.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
      setIsCameraOn(false);
    } else {
      try {
        setCameraError("");
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsCameraOn(true);
      } catch (err: any) {
         setCameraError("Camera permission denied. Please allow camera access in your browser.");
      }
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    // Stop listening if currently speaking
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const payloadText = inputValue.trim();
    // Add user message immediately
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: payloadText };
    const newMessagesList = [...messages, userMsg];
    
    setMessages(newMessagesList);
    setInputValue("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/interview/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessagesList.map(m => ({ role: m.role, content: m.content })),
          context: interviewContext
        }),
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: data.reply,
        }
      ]);
    } catch (err) {
      console.error("Chat API Error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Sorry, I had trouble processing that response. Could you try again?",
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  if (loadingObj) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row h-screen">
      
      {/* Left Sidebar */}
      <div className="w-full md:w-80 border-r bg-card flex flex-col p-4 space-y-4 shrink-0">
        <div className="flex items-center justify-between mb-2">
           <Link href="/dashboard" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
             ← Dashboard
           </Link>
           <div className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded">Session Active</div>
        </div>

        {/* Camera Module */}
        <div className="rounded-xl border overflow-hidden bg-background relative aspect-video flex items-center justify-center shadow-sm">
          {!isCameraOn && !cameraError && (
            <div className="text-center p-4 flex flex-col items-center">
              <CameraOff className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground">Camera off. Enable to track emotions.</p>
            </div>
          )}
          {cameraError && (
             <div className="text-center p-4 flex flex-col items-center">
                <AlertCircle className="w-6 h-6 text-destructive mb-2" />
                <p className="text-xs text-destructive">{cameraError}</p>
             </div>
          )}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${isCameraOn ? "block" : "hidden"}`}
            style={{ transform: "scaleX(-1)" }}
          />
        </div>

        <button
            onClick={toggleCamera}
            className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              isCameraOn ? "bg-destructive/10 text-destructive hover:bg-destructive/20" : "bg-primary/10 text-primary hover:bg-primary/20"
            }`}
          >
            {isCameraOn ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
            {isCameraOn ? "Stop Camera" : "Start Camera"}
        </button>

        <div className="flex-1 flex flex-col mt-4">
           <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">Live Insights</h3>
           <div className="p-4 rounded-xl border bg-background/50 flex-1">
              {isCameraOn ? (
                 <div className="flex flex-col h-full justify-center items-center opacity-50">
                    <Activity className="w-8 h-8 text-primary mb-2 animate-pulse" />
                    <p className="text-xs font-mono text-center">Analyzing facial expressions...</p>
                 </div>
              ) : (
                <div className="flex flex-col h-full justify-center items-center opacity-50">
                    <p className="text-xs text-center">No live data. Enable camera for insights.</p>
                 </div>
              )}
           </div>
        </div>
      </div>

      {/* Right Content */}
      <div className="flex-1 flex flex-col h-screen max-h-screen relative bg-background/50">
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-4 max-w-3xl mx-auto ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <div className="shrink-0 mt-1">
                {message.role === "assistant" ? (
                   <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
                     <Bot className="w-5 h-5 text-primary-foreground" />
                   </div>
                ) : (
                   <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center border shadow-sm">
                     <User className="w-5 h-5 text-foreground" />
                   </div>
                )}
              </div>

              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                message.role === "user" 
                  ? "bg-primary text-primary-foreground rounded-tr-sm" 
                  : "bg-card border text-card-foreground shadow-sm rounded-tl-sm whitespace-pre-wrap"
              }`}>
                {message.content}
              </div>
            </div>
          ))}
          
          {isTyping && (
             <div className="flex gap-4 max-w-3xl mx-auto flex-row opacity-50">
                <div className="shrink-0 mt-1">
                   <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
                     <Bot className="w-5 h-5 text-primary-foreground" />
                   </div>
                </div>
                <div className="p-4 rounded-2xl text-sm leading-relaxed bg-card border text-card-foreground shadow-sm rounded-tl-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-foreground rounded-full animate-bounce"></div>
                  </div>
                </div>
             </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-background border-t">
          <div className="max-w-3xl mx-auto flex gap-2">
            
            <button
               type="button"
               onClick={toggleListening}
               className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                 isListening ? "bg-destructive text-destructive-foreground animate-pulse" : "bg-accent border border-border text-foreground hover:bg-accent/80"
               }`}
               title={isListening ? "Stop listening" : "Start speaking"}
            >
               {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            <form onSubmit={handleSendMessage} className="relative flex-1 flex gap-2">
              <div className="relative flex-1">
                <textarea
                  rows={2}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={isListening ? "Listening..." : "Type your response or click the microphone..."}
                  className="w-full bg-input/20 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="bg-primary text-primary-foreground rounded-xl w-12 h-12 flex items-center justify-center shrink-0 hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Send className="w-5 h-5 ml-1" />
              </button>
            </form>

          </div>
          <div className="max-w-3xl mx-auto text-center mt-2">
             <p className="text-[10px] text-muted-foreground">Voice mode is enabled. Click the microphone icon to speak naturally.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
