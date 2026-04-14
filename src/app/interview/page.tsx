"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { account } from "@/lib/appwrite";
import { Bot, Send, User, Mic, MicOff, Camera, CameraOff, AlertCircle, Activity, Volume2, VolumeX } from "lucide-react";
import Link from "next/link";

interface Message {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
}

type VoiceMode = "system" | "female" | "male";

type ElevenLabsVoice = {
  id: string;
  name: string;
  accent: string;
};

const ELEVEN_LABS_VOICES: Record<string, ElevenLabsVoice> = {
  rachel: { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel", accent: "Bright, Engaging" },
  bella: { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella", accent: "Warm, Professional" },
  antoni: { id: "zcAOhNBS3c14rBihAFp1", name: "Antoni", accent: "Deep, Confident" },
  callum: { id: "N2lVS1Umrr6nrU35Eozj", name: "Callum", accent: "Clear, Measured" },
  charlotte: { id: "D38z5RcWu1voky8WZi1j", name: "Charlotte", accent: "Intelligent, Mature" },
  ethan: { id: "g395645FsrqBTM8qQkQH", name: "Ethan", accent: "Friendly, Energetic" },
};

export default function InterviewPage() {
  const [showEndDialog, setShowEndDialog] = useState(false);
  // End Interview handler
  const handleEndInterview = () => {
    setShowEndDialog(true);
  };
  const confirmEndInterview = () => {
    sessionStorage.removeItem("interview_role");
    sessionStorage.removeItem("interview_education");
    sessionStorage.removeItem("interview_cv");
    router.push("/dashboard");
  };
  // Browser compatibility warning state
  const [speechApiSupported, setSpeechApiSupported] = useState(true);
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
  const isTypingRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice State
  const [isListening, setIsListening] = useState(false);
  const isListeningRef = useRef(false);
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef("");
  const [handsFreeMic, setHandsFreeMic] = useState(false);
    // ...existing code...
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [voiceMode, setVoiceMode] = useState<VoiceMode>("system");
  const [speechRate, setSpeechRate] = useState(1);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [autoSendOnPause, setAutoSendOnPause] = useState(true);
  const [ttsMode, setTtsMode] = useState<"browser" | "elevenlabs">("browser");
  const [elevenLabsVoice, setElevenLabsVoice] = useState("rachel");
  const [elevenLabsStability, setElevenLabsStability] = useState(0.75);
  const [elevenLabsSimilarity, setElevenLabsSimilarity] = useState(0.85);
  const [micError, setMicError] = useState<string | null>(null);
  const restartDelayRef = useRef(300);
  const noSpeechCountRef = useRef(0);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const manualStopRef = useRef(false);
  const assistantSpeakingRef = useRef(false);
  const inputValueRef = useRef("");
  const autoSendOnPauseRef = useRef(true);
  const lastSpokenMessageIdRef = useRef<string | null>(null);
  const autoSendTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const micErrorRef = useRef<string | null>(null);

  const clearAutoSendTimer = () => {
    if (autoSendTimerRef.current) {
      clearTimeout(autoSendTimerRef.current);
      autoSendTimerRef.current = null;
    }
  };

  const queueAutoSendIfIdle = () => {
    if (!autoSendOnPauseRef.current) return;

    clearAutoSendTimer();
    autoSendTimerRef.current = setTimeout(() => {
      const transcript = inputValueRef.current.trim();
      if (!transcript || isTypingRef.current) return;
      void handleSendMessage(undefined, transcript);
    }, 1800);
  };

  const startListening = () => {
    const recognition = recognitionRef.current;
    const isSynthSpeaking = typeof window !== "undefined" && "speechSynthesis" in window && window.speechSynthesis.speaking;
    if (!recognition || isListeningRef.current || isTypingRef.current || assistantSpeakingRef.current || isSynthSpeaking) return;

    try {
      if (restartTimerRef.current) {
        clearTimeout(restartTimerRef.current);
        restartTimerRef.current = null;
      }
      recognition.start();
    } catch {
      // Ignore InvalidStateError when start() is called too quickly in some browsers.
    }
  };

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
      if (!SpeechRecognition) {
        setSpeechApiSupported(false);
        setMicError("Your browser does not support speech recognition. Please use Chrome or Edge.");
        return;
      } else {
        setSpeechApiSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          isListeningRef.current = true;
          setIsListening(true);
          setMicError(null);
          noSpeechCountRef.current = 0;
          manualStopRef.current = false;
        };

        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          noSpeechCountRef.current = 0;
          restartDelayRef.current = 300;

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const chunk = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscriptRef.current = `${finalTranscriptRef.current} ${chunk}`;
            } else {
              interimTranscript += chunk;
            }
          }

          const nextValue = `${finalTranscriptRef.current}${interimTranscript}`.replace(/\s+/g, ' ').trim();
          inputValueRef.current = nextValue;
          setInputValue(nextValue);

          // Only auto-send after sustained silence, not immediately when a phrase finalizes.
          if (event.results[event.results.length - 1]?.isFinal && finalTranscriptRef.current.trim()) {
            queueAutoSendIfIdle();
          } else {
            clearAutoSendTimer();
          }
        };

        recognition.onerror = (event: any) => {
          const errorType = event.error || "unknown";
          console.warn("Speech recognition error:", errorType);

          // Distinguish between recoverable and hard errors
          const isRecoverable = errorType === "no-speech" || errorType === "audio-capture";
          const isHardError = errorType === "network" || errorType === "service-unavailable";

          isListeningRef.current = false;
          setIsListening(false);

          if (errorType === "not-allowed") {
            setMicError("Microphone permission denied. Please allow mic access in your browser settings and reload the page.");
            restartDelayRef.current = 2000;
          } else if (isHardError) {
            setMicError("Mic service unavailable. Please check your browser.");
            restartDelayRef.current = 2000;
          } else if (isRecoverable && errorType === "no-speech") {
            // "no-speech" is expected in continuous mode; only show UI error if repeated.
            noSpeechCountRef.current += 1;
            if (noSpeechCountRef.current >= 3) {
              setMicError("No speech detected repeatedly. Check your microphone and background noise.");
            } else {
              setMicError(null);
            }
            restartDelayRef.current = Math.min(restartDelayRef.current + 200, 1500);
          } else if (isRecoverable) {
            setMicError("Mic input not detected. Please check microphone permission.");
            restartDelayRef.current = Math.min(restartDelayRef.current + 200, 1500);
          } else if (errorType === "aborted") {
            // "aborted" is common when we stop recognition intentionally.
            if (!manualStopRef.current) {
              restartDelayRef.current = 800;
            }
            setMicError(null);
            restartDelayRef.current = 800;
          } else {
            console.error("Unexpected speech error:", errorType);
            restartDelayRef.current = 1000;
          }
        };

        recognition.onend = () => {
          isListeningRef.current = false;
          setIsListening(false);
          manualStopRef.current = false;

          const isSynthSpeaking = typeof window !== "undefined" && "speechSynthesis" in window && window.speechSynthesis.speaking;
          if (handsFreeMic && !document.hidden && !micErrorRef.current && !isTypingRef.current && !assistantSpeakingRef.current && !isSynthSpeaking) {
            restartTimerRef.current = setTimeout(() => {
              restartDelayRef.current = 300;
              startListening();
            }, restartDelayRef.current);
          }
        };

        recognitionRef.current = recognition;
        if (handsFreeMic) {
          startListening();
        }
      }
    }
  }, [router]);

  useEffect(() => {
    if (handsFreeMic) {
      startListening();
    } else if (recognitionRef.current && isListeningRef.current) {
      recognitionRef.current.stop();
    }
  }, [handsFreeMic]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    isTypingRef.current = isTyping;
  }, [isTyping]);

  useEffect(() => {
    inputValueRef.current = inputValue;
  }, [inputValue]);

  useEffect(() => {
    autoSendOnPauseRef.current = autoSendOnPause;
  }, [autoSendOnPause]);

  useEffect(() => {
    micErrorRef.current = micError;
  }, [micError]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    const loadVoices = () => {
      setAvailableVoices(window.speechSynthesis.getVoices());
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speakWithNaturalProsody = (
    text: string,
    rate: number,
    voiceMode: string,
    availableVoices: SpeechSynthesisVoice[],
    pickVoice: () => SpeechSynthesisVoice | null,
    onDone?: () => void
  ) => {
    window.speechSynthesis.cancel();
  // Stop mic listening while TTS is active
    if (recognitionRef.current && isListeningRef.current) {
    recognitionRef.current.stop();
  }
  isListeningRef.current = false;
    setIsListening(false);
    // Split text into sentences for natural pausing
    const sentences = text.split(/([.!?]+)/g).reduce((acc: string[], curr, i) => {
      if (i % 2 === 0) {
        return [...acc, curr];
      }
      return acc.length > 0 ? [...acc.slice(0, -1), acc[acc.length - 1] + curr] : acc;
    }, []).filter((s) => s.trim().length > 0);

    const speakNext = (index: number) => {
      if (index >= sentences.length) {
        onDone?.();
        return;
      }

      const sentence = sentences[index];
      const utterance = new SpeechSynthesisUtterance(sentence);

      // Vary pitch subtly by sentence position (more natural sounding)
      const basePitch = 1;
      utterance.pitch = basePitch + (index % 3 === 0 ? 0.05 : index % 3 === 1 ? -0.05 : 0);
      utterance.rate = rate;
      utterance.volume = 0.95;
      utterance.lang = "en-US";

      const selectedVoice = pickVoice();
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang || utterance.lang;
      }

      utterance.onend = () => {
        setTimeout(() => {
          speakNext(index + 1);
        }, 300);
      };

      window.speechSynthesis.speak(utterance);
    };

    speakNext(0);
  };

  const speakWithElevenLabs = async (text: string, apiKey: string) => {
    try {
      assistantSpeakingRef.current = true;
      const voiceConfig = ELEVEN_LABS_VOICES[elevenLabsVoice];
      const voiceId = voiceConfig?.id || ELEVEN_LABS_VOICES.rachel.id;

      const response = await fetch("https://api.elevenlabs.io/v1/text-to-speech/" + voiceId, {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_turbo_v2",
          voice_settings: {
            stability: elevenLabsStability,
            similarity_boost: elevenLabsSimilarity,
          },
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.warn(`Eleven Labs API error (${response.status}):`, errorBody);
        console.warn("Falling back to browser TTS. Check your API key at https://elevenlabs.io/api");
        speakWithNaturalProsody(
          text,
          speechRate,
          voiceMode,
          availableVoices,
          () => availableVoices.find((v) => v.lang?.toLowerCase().startsWith("en")) || null,
          () => {
            assistantSpeakingRef.current = false;
            // Only restart mic after TTS is fully done
            if (handsFreeMic) setTimeout(() => startListening(), 250);
          }
        );
        return;
      }

      const audioBuffer = await response.arrayBuffer();
      const AudioContextCtor = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextCtor) {
        speakWithNaturalProsody(text, speechRate, voiceMode, availableVoices, () => null);
        return;
      }
      const audioContext = new AudioContextCtor();
      const sourceNode = audioContext.createBufferSource();
      const decodedBuffer = await audioContext.decodeAudioData(audioBuffer.slice(0));
      sourceNode.buffer = decodedBuffer;
      sourceNode.connect(audioContext.destination);
      sourceNode.onended = () => {
        assistantSpeakingRef.current = false;
        // Only restart mic after TTS is fully done
        if (handsFreeMic) setTimeout(() => startListening(), 250);
      };
      sourceNode.start();
    } catch (err) {
      console.error("Eleven Labs TTS critical error:", err);
      speakWithNaturalProsody(text, speechRate, voiceMode, availableVoices, () => null, () => {
        assistantSpeakingRef.current = false;
        // Only restart mic after TTS is fully done
        if (handsFreeMic) setTimeout(() => startListening(), 250);
      });
    }
  };

  // Speak assistant replies out loud so the interview feels conversational.
  useEffect(() => {
    if (!speechEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    const latest = messages[messages.length - 1];
    if (!latest || latest.role !== "assistant" || !latest.content?.trim()) {
      return;
    }

    if (lastSpokenMessageIdRef.current === latest.id) {
      return;
    }
    lastSpokenMessageIdRef.current = latest.id;

    if (ttsMode === "elevenlabs") {
      const elevenLabsKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
      if (elevenLabsKey) {
        void speakWithElevenLabs(latest.content, elevenLabsKey);
        return;
      }
    }

    const pickVoice = () => {
      if (voiceMode === "system") return null;
      const femaleRegex = /(female|woman|zira|samantha|victoria|aria|eva|joanna|susan|hazel|jenny)/i;
      const maleRegex = /(male|man|david|mark|alex|daniel|george|tom|matthew|liam)/i;
      const matcher = voiceMode === "female" ? femaleRegex : maleRegex;

      const exact = availableVoices.find((v) => matcher.test(`${v.name} ${v.voiceURI}`));
      if (exact) return exact;

      return availableVoices.find((v) => v.lang?.toLowerCase().startsWith("en")) || null;
    };

    assistantSpeakingRef.current = true;
    speakWithNaturalProsody(latest.content, speechRate, voiceMode, availableVoices, pickVoice, () => {
      assistantSpeakingRef.current = false;
      // Only restart mic after TTS is fully done
      if (handsFreeMic) setTimeout(() => startListening(), 250);
    });

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [messages, speechEnabled, speechRate, voiceMode, availableVoices, ttsMode, elevenLabsVoice, elevenLabsStability, elevenLabsSimilarity]);

  // Voice handler
  // Unified mic toggle: syncs button and hands-free checkbox
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice recognition is not supported in this browser. Try Chrome or Edge.");
      return;
    }
    if (handsFreeMic) {
      setHandsFreeMic(false);
      if (recognitionRef.current && isListeningRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      finalTranscriptRef.current = "";
      inputValueRef.current = "";
      setInputValue("");
      setHandsFreeMic(true);
      startListening();
      setIsListening(true);
    }
  };

  const toggleSpeech = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window && speechEnabled) {
      window.speechSynthesis.cancel();
    }
    setSpeechEnabled((prev) => !prev);
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
         setCameraError("Camera permission denied. Please allow camera access.");
      }
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, forcedText?: string) => {
    if (e) e.preventDefault();
    const textToSend = (forcedText ?? inputValue).trim();
    if (!textToSend) return;

    clearAutoSendTimer();

    if (isListening && recognitionRef.current) {
      manualStopRef.current = true;
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const payloadText = textToSend;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: payloadText };
    const newMessagesList = [...messages, userMsg];
    
    setMessages(newMessagesList);
    inputValueRef.current = "";
    finalTranscriptRef.current = "";
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
    } catch (err: any) {
      console.error("Chat API Error:", err);
      const friendlyMessage = err?.message
        ? `I could not generate a response: ${err.message}`
        : "Sorry, I had trouble processing that response. Could you try again?";

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: friendlyMessage,
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    if (!isTyping && handsFreeMic && !isListeningRef.current) {
      startListening();
    }
  }, [isTyping, handsFreeMic]);

  useEffect(() => {
    return () => {
      clearAutoSendTimer();
      if (restartTimerRef.current) {
        clearTimeout(restartTimerRef.current);
      }
      if (recognitionRef.current && isListeningRef.current) {
        manualStopRef.current = true;
        recognitionRef.current.stop();
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (loadingObj) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row h-screen font-sans">
      
      {/* Left Sidebar */}
      <div className="w-full md:w-80 border-r border-gray-200 bg-white flex flex-col p-6 space-y-6 shrink-0 relative z-20 shadow-sm">
        <div className="flex items-center justify-between mb-2">
           <Link href="/dashboard" className="text-sm font-bold text-gray-400 hover:text-black transition-colors">
             ← Dashboard
           </Link>
           <div className="flex items-center gap-2">
             <button
               type="button"
               onClick={toggleSpeech}
               className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border transition-colors ${
                 speechEnabled
                   ? "bg-green-50 text-green-700 border-green-200"
                   : "bg-gray-100 text-gray-600 border-gray-200"
               }`}
               title={speechEnabled ? "Mute AI voice" : "Enable AI voice"}
             >
               {speechEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
               Voice {speechEnabled ? "On" : "Off"}
             </button>

             {/* End Interview button moved to bottom */}
                    {/* End Interview Button at Bottom */}
             <div className="text-[10px] font-bold bg-blue-50 text-primary px-3 py-1 rounded-full uppercase tracking-wider">Active</div>
           </div>
        </div>

        {/* Camera Module */}
        <div className="rounded-2xl border-2 border-gray-100 overflow-hidden bg-gray-50 relative aspect-video flex items-center justify-center shadow-inner">
          {!isCameraOn && !cameraError && (
            <div className="text-center p-4 flex flex-col items-center">
              <CameraOff className="w-8 h-8 text-gray-300 mb-2" />
              <p className="text-xs text-gray-500 font-medium">Camera off.</p>
            </div>
          )}
          {cameraError && (
             <div className="text-center p-4 flex flex-col items-center">
                <AlertCircle className="w-6 h-6 text-red-500 mb-2" />
                <p className="text-xs text-red-500 font-medium">{cameraError}</p>
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
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-colors ${
              isCameraOn ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {isCameraOn ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
            {isCameraOn ? "Stop Camera" : "Start Camera"}
        </button>

        <div className="flex-1 flex flex-col pt-4 border-t border-gray-100">
           <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-4">Live Insights</h3>
           <div className="p-6 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex-1 flex flex-col items-center justify-center">
              {isCameraOn ? (
                 <>
                    <Activity className="w-8 h-8 text-primary mb-3 animate-pulse" />
                    <p className="text-xs font-bold text-gray-500 text-center uppercase tracking-wide">Analyzing expressions...</p>
                 </>
              ) : (
                 <p className="text-xs text-gray-400 text-center font-medium max-w-[150px]">No live data. Enable camera for insights.</p>
              )}
           </div>
        </div>
      </div>

      {/* Right Content */}
      <div className="flex-1 flex flex-col h-screen max-h-screen relative bg-gray-50/50">
        <div className="absolute inset-0 bg-dot-pattern opacity-[0.2] z-0 pointer-events-none"></div>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 relative z-10">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-4 max-w-3xl mx-auto ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <div className="shrink-0 mt-1">
                {message.role === "assistant" ? (
                   <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shadow-md">
                     <Bot className="w-4 h-4 text-white" />
                   </div>
                ) : (
                   <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-200 shadow-sm">
                     <User className="w-4 h-4 text-gray-600" />
                   </div>
                )}
              </div>

              <div className={`px-5 py-4 rounded-2xl text-[15px] font-medium leading-relaxed max-w-[85%] ${
                message.role === "user" 
                  ? "bg-primary text-white rounded-tr-sm shadow-md" 
                  : "bg-white border border-gray-100 text-gray-800 shadow-sm rounded-tl-sm whitespace-pre-wrap"
              }`}>
                {message.content}
              </div>
            </div>
          ))}
          
          {isTyping && (
             <div className="flex gap-4 max-w-3xl mx-auto flex-row">
                <div className="shrink-0 mt-1">
                   <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shadow-md">
                     <Bot className="w-4 h-4 text-white" />
                   </div>
                </div>
                <div className="px-5 py-4 rounded-2xl bg-white border border-gray-100 shadow-sm rounded-tl-sm flex items-center h-[52px]">
                  <div className="flex items-center gap-1.5 opacity-50">
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce"></div>
                  </div>
                </div>
             </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* Input Area */}
        {/* Browser compatibility warning */}
        {!speechApiSupported && (
          <div className="max-w-4xl mx-auto mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg text-center">
            <b>Warning:</b> Your browser does not support speech recognition. Please use Chrome or Edge for voice features.
          </div>
        )}
        <div className="p-4 bg-white border-t border-gray-100 relative z-20 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
          <div className="max-w-4xl mx-auto flex gap-3">
            
            <button
              type="button"
              onClick={toggleListening}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
               handsFreeMic ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/20" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              title={handsFreeMic ? "Turn off mic" : "Turn on mic"}
            >
              {handsFreeMic ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </button>

            {micError && (
              <button
                type="button"
                onClick={() => {
                  setMicError(null);
                  restartDelayRef.current = 300;
                  startListening();
                }}
                className="px-4 py-2 bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-semibold rounded-xl hover:bg-yellow-100 transition-colors"
              >
                Try Mic Again
              </button>
            )}

            <form onSubmit={handleSendMessage} className="relative flex-1 flex gap-3">
              <div className="relative flex-1">
                <textarea
                  rows={2}
                  value={inputValue}
                  onChange={(e) => {
                    inputValueRef.current = e.target.value;
                    setInputValue(e.target.value);
                  }}
                  placeholder={isListening ? "Listening..." : "Type your response or click the microphone..."}
                  className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-[15px] font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-gray-300 focus:ring-4 focus:ring-gray-50 resize-none shadow-sm"
                  onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
                className="bg-primary text-white rounded-2xl w-14 h-14 flex items-center justify-center shrink-0 hover:bg-primary/90 transition-all shadow-md shadow-primary/20 disabled:opacity-50"
              >
                <Send className="w-5 h-5 ml-1" />
              </button>
            </form>

          </div>
          <div className="max-w-4xl mx-auto text-center mt-3">
            {micError && (
              <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs rounded-lg">
                {micError}
              </div>
            )}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-left">
               <label className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                 <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">AI Voice</span>
                 <select
                   value={voiceMode}
                   onChange={(e) => setVoiceMode(e.target.value as VoiceMode)}
                   className="w-full bg-transparent text-xs font-semibold text-gray-700 outline-none"
                 >
                   <option value="system">System</option>
                   <option value="female">Female</option>
                   <option value="male">Male</option>
                 </select>
               </label>

               <label className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                 <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                   Speed {speechRate.toFixed(1)}x
                 </span>
                 <input
                   type="range"
                   min={0.8}
                   max={1.4}
                   step={0.1}
                   value={speechRate}
                   onChange={(e) => setSpeechRate(Number(e.target.value))}
                   className="w-full"
                 />
               </label>

               <label className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 flex items-center justify-between">
                 <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Auto-send on pause</span>
                 <input
                   type="checkbox"
                   checked={autoSendOnPause}
                   onChange={(e) => setAutoSendOnPause(e.target.checked)}
                   className="h-4 w-4"
                 />
               </label>

               <label className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 flex items-center justify-between">
                 <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Hands-free mic</span>
                 <input
                   type="checkbox"
                   checked={handsFreeMic}
                   onChange={(e) => {
                     setHandsFreeMic(e.target.checked);
                     if (e.target.checked) {
                       startListening();
                       setIsListening(true);
                     } else if (recognitionRef.current && isListeningRef.current) {
                       recognitionRef.current.stop();
                       setIsListening(false);
                     }
                   }}
                   className="h-4 w-4"
                 />
               </label>
               <label className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                 <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Voice Quality</span>
                 <select
                   value={ttsMode}
                   onChange={(e) => setTtsMode(e.target.value as "browser" | "elevenlabs")}
                   className="w-full bg-transparent text-xs font-semibold text-gray-700 outline-none"
                 >
                   <option value="browser">Natural (Browser)</option>
                   <option value="elevenlabs">Premium (Eleven Labs)</option>
                 </select>
               </label>

               {/* End Interview Button after Voice Quality */}
               <div className="flex justify-center mt-4 md:col-span-3 lg:col-span-3">
                 <button
                   type="button"
                   onClick={handleEndInterview}
                   className="flex items-center gap-1.5 text-[15px] font-bold px-8 py-3 rounded-full uppercase tracking-wider border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-all shadow"
                   title="End Interview"
                 >
                   End Interview
                 </button>
               </div>
      {/* Custom End Interview Confirmation Dialog */}
      {showEndDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center border">
            <div className="text-lg font-bold mb-4">End Interview?</div>
            <div className="text-sm text-gray-600 mb-6">Are you sure you want to end the interview? You will be redirected to the dashboard.</div>
            <div className="flex gap-4 justify-center">
              <button
                className="px-6 py-2 rounded-full font-semibold bg-red-500 text-white hover:bg-red-600 transition-all"
                onClick={confirmEndInterview}
              >
                Yes, End
              </button>
              <button
                className="px-6 py-2 rounded-full font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                onClick={() => setShowEndDialog(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

               {ttsMode === "elevenlabs" && (
                 <label className="rounded-xl border border-gray-200 bg-blue-50 px-3 py-2">
                   <span className="block text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-1">AI Voice</span>
                   <select
                     value={elevenLabsVoice}
                     onChange={(e) => setElevenLabsVoice(e.target.value)}
                     className="w-full bg-transparent text-xs font-semibold text-gray-700 outline-none"
                   >
                     {Object.entries(ELEVEN_LABS_VOICES).map(([key, voice]) => (
                       <option key={key} value={key}>
                         {voice.name} ({voice.accent})
                       </option>
                     ))}
                   </select>
                 </label>
               )}

               {ttsMode === "elevenlabs" && (
                 <label className="rounded-xl border border-gray-200 bg-blue-50 px-3 py-2">
                   <span className="block text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-1">
                     Stability {elevenLabsStability.toFixed(2)}
                   </span>
                   <input
                     type="range"
                     min={0.5}
                     max={1}
                     step={0.05}
                     value={elevenLabsStability}
                     onChange={(e) => setElevenLabsStability(Number(e.target.value))}
                     className="w-full"
                   />
                 </label>
               )}

               {ttsMode === "elevenlabs" && (
                 <label className="rounded-xl border border-gray-200 bg-blue-50 px-3 py-2">
                   <span className="block text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-1">
                     Clarity {elevenLabsSimilarity.toFixed(2)}
                   </span>
                   <input
                     type="range"
                     min={0.5}
                     max={1}
                     step={0.05}
                     value={elevenLabsSimilarity}
                     onChange={(e) => setElevenLabsSimilarity(Number(e.target.value))}
                     className="w-full"
                   />
                 </label>
               )}             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
