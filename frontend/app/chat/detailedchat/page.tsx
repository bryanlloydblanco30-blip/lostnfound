"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Menu,
  Bell,
  X,
  MessageSquare,
  Image as ImageIcon,
  Mic,
  MicOff,
  ArrowUp,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  time: string;
  imageUrl?: string;
}

// Inner component that uses useSearchParams (must be wrapped in Suspense)
function DetailedChatInner() {
  const searchParams = useSearchParams();
  const receiverId = Number(searchParams.get("receiverId"));
  const receiverName = searchParams.get("name") ?? "Unknown";
  const receiverCode = searchParams.get("code") ?? "";

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Fetch message history on mount
  useEffect(() => {
    if (!receiverId) return;

    api
      .getMessages(String(receiverId))
      .then((data: any[]) => {
        const currentUser = api.getStoredUser();
        const mapped: Message[] = data.map((m: any) => ({
          id: m.id,
          text: m.text ?? "",
          isUser: m.sender?.id === currentUser?.id,
          time: new Date(m.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));
        setMessages(mapped);
      })
      .catch((err: Error) => {
        console.error("Failed to load messages:", err);
        // Don't keep spinning — show empty state
        setMessages([]);
      })
      .finally(() => setLoading(false));
  }, [receiverId]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending || !receiverId) return;

    const text = input.trim();
    setInput("");
    setSending(true);

    // Optimistic UI — add message immediately
    const optimistic: Message = {
      id: Date.now(),
      text,
      isUser: true,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      await api.sendMessage(receiverId, text);
    } catch (err) {
      console.error("Failed to send message:", err);
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setInput(text); // restore input
    } finally {
      setSending(false);
    }
  };

  // ── Image attach ────────────────────────────────────────────────────────────
  const handleImageAttach = () => {
    imageInputRef.current?.click();
  };

  const handleImageSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !receiverId) return;
    e.target.value = ""; // allow re-select same file

    try {
      setSending(true);
      // Upload image first
      const { url } = await api.uploadImage(file);
      const imageUrl = url.startsWith("/")
        ? `http://localhost:8081${url}`
        : url;

      // Optimistic UI with image
      const optimistic: Message = {
        id: Date.now(),
        text: "",
        imageUrl,
        isUser: true,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, optimistic]);

      // Send a message with the image URL as text so it persists
      await api.sendMessage(receiverId, `[image]${imageUrl}`);
    } catch (err) {
      console.error("Failed to send image:", err);
      alert("Failed to send image. Please try again.");
    } finally {
      setSending(false);
    }
  };

  // ── Voice recording ─────────────────────────────────────────────────────────
  const handleVoiceToggle = async () => {
    if (isRecording) {
      // Stop recording
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          stream.getTracks().forEach((t) => t.stop());
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          const audioFile = new File([audioBlob], "voice_message.webm", { type: "audio/webm" });

          try {
            setSending(true);
            const { url } = await api.uploadImage(audioFile);
            const audioUrl = url.startsWith("/")
              ? `http://localhost:8081${url}`
              : url;

            const optimistic: Message = {
              id: Date.now(),
              text: `🎤 Voice message`,
              isUser: true,
              time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            };
            setMessages((prev) => [...prev, optimistic]);
            await api.sendMessage(receiverId, `[voice]${audioUrl}`);
          } catch (err) {
            console.error("Failed to send voice message:", err);
          } finally {
            setSending(false);
          }
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        alert("Microphone access denied. Please allow microphone access in your browser.");
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target as Node)
      ) {
        setShowNotifications(false);
      }
    };
    if (showNotifications)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications]);

  return (
    <div
      style={{
        backgroundImage: "url('/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
        width: "100vw",
      }}
    >
      {/* Glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
        <div className="absolute right-0 top-24 h-96 w-96 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-lime-200/15 blur-3xl" />
      </div>

      {/* Hidden inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageSelected}
      />

      <Sidebar isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />

      {/* Header */}
      <header className="fixed top-0 left-0 z-50 w-full px-4 sm:px-6 pt-4">
        <div className="flex items-center justify-between rounded-full border border-white/30 bg-white/25 px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.12)] backdrop-blur-xl lg:[padding-left:calc(18rem+16px)]">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="lg:hidden p-2 text-black hover:bg-black/5 rounded-full transition"
          >
            <Menu size={28} strokeWidth={2.2} />
          </button>

          <div className="flex items-center gap-2">
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/75c8ab62870811c4b4e6b744abf4c9f3b6161c1a?width=330"
              alt="Lost and Found"
              className="h-10 w-auto object-contain"
            />
          </div>

          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-full p-2 text-black transition hover:bg-black/5"
          >
            <Bell size={30} strokeWidth={2.1} />
            <span className="absolute -right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[11px] font-bold text-white shadow-sm">
              1
            </span>
          </button>
        </div>

        {showNotifications && (
          <div
            ref={notificationRef}
            className="fixed top-24 right-8 z-[9999] w-80 rounded-3xl bg-white/25 backdrop-blur-2xl border border-white/30 shadow-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-xl text-black">Notifications</h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-black/70 hover:text-black"
              >
                <X size={22} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl bg-emerald-500/90 p-4 text-white">
                <p className="font-semibold">Daily Update</p>
                <p className="text-lg">1 object was found today</p>
                <p className="text-xs opacity-75 mt-2">
                  Just now • AirPods Pro 2nd Gen
                </p>
              </div>
              <div className="text-center text-sm text-black/60 py-2">
                No more notifications
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="relative z-10 pt-28 pl-0 lg:pl-80 px-6 sm:px-8 lg:px-12 pb-8">
        <div className="mx-auto max-w-7xl">
          {/* Chat area */}
          <div className="px-2 lg:px-4">
            <div className="bg-white/25 backdrop-blur-2xl border border-white/40 p-6 shadow-2xl flex flex-col h-[calc(100vh-180px)]">

              {/* Chat Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10">
                    <svg
                      width="56"
                      height="56"
                      viewBox="0 0 76 76"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-10 h-10"
                    >
                      <path
                        d="M38 12.6667C41.3594 12.6667 44.5812 14.0013 46.9566 16.3767C49.3321 18.7522 50.6666 21.974 50.6666 25.3334C50.6666 28.6928 49.3321 31.9146 46.9566 34.2901C44.5812 36.6656 41.3594 38.0001 38 38.0001C34.6405 38.0001 31.4187 36.6656 29.0433 34.2901C26.6678 31.9146 25.3333 28.6928 25.3333 25.3334C25.3333 21.974 26.6678 18.7522 29.0433 16.3767C31.4187 14.0013 34.6405 12.6667 38 12.6667ZM38 44.3334C51.9966 44.3334 63.3333 50.0017 63.3333 57.0001V63.3334H12.6666V57.0001C12.6666 50.0017 24.0033 44.3334 38 44.3334Z"
                        fill="#12FE45"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-2xl text-black">
                      {receiverName && receiverName !== "null" ? receiverName : "Unknown User"}
                    </p>
                    <p className="text-black/60 text-sm">
                      {receiverCode && receiverCode !== "null" ? `${receiverCode} • ` : ""}Online
                    </p>
                  </div>
                </div>
                <MessageSquare size={28} className="text-black" />
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-6 pr-4">
                {loading && (
                  <div className="flex items-center justify-center h-full text-black/50 text-base">
                    Loading messages…
                  </div>
                )}

                {!loading && messages.length === 0 && (
                  <div className="flex items-center justify-center h-full text-black/40 text-base">
                    No messages yet. Say hi! 👋
                  </div>
                )}

                {!loading &&
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[78%] px-6 py-4 rounded-3xl text-base leading-tight ${
                          msg.isUser
                            ? "bg-[#12FE45] text-black rounded-br-none"
                            : "bg-white/80 text-black rounded-bl-none"
                        }`}
                      >
                        {msg.imageUrl ? (
                          <img
                            src={msg.imageUrl}
                            alt="Sent image"
                            className="rounded-2xl max-w-full max-h-60 object-cover"
                          />
                        ) : (
                          <p>{msg.text}</p>
                        )}
                        <p className="text-xs mt-2 opacity-70 text-right">
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Bar */}
              <div className="mt-6">
                {isRecording && (
                  <div className="mb-2 text-center text-red-500 font-semibold animate-pulse text-sm">
                    🔴 Recording… tap mic again to send
                  </div>
                )}
                <div className="flex items-center gap-3 bg-white/75 backdrop-blur-xl border border-white/40 rounded-3xl px-6 py-4">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Type your message..."
                    className="flex-1 bg-transparent outline-none text-black placeholder:text-black/50 text-lg font-medium"
                    disabled={sending || isRecording}
                  />

                  <div className="flex items-center gap-2 text-black/70">
                    <button
                      onClick={handleImageAttach}
                      disabled={sending}
                      className="hover:text-black transition-colors p-1 disabled:opacity-40"
                      title="Attach image"
                    >
                      <ImageIcon size={20} />
                    </button>
                    <button
                      onClick={handleVoiceToggle}
                      disabled={sending}
                      className={`transition-colors p-1 disabled:opacity-40 ${
                        isRecording ? "text-red-500 hover:text-red-600" : "hover:text-black"
                      }`}
                      title={isRecording ? "Stop recording" : "Record voice message"}
                    >
                      {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>
                  </div>

                  <button
                    onClick={handleSend}
                    disabled={sending || !input.trim() || isRecording}
                    className="bg-[#12FE45] hover:bg-[#12FE45]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-black p-4 rounded-2xl flex items-center justify-center"
                  >
                    <ArrowUp size={24} strokeWidth={3} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Exported page wraps inner component in Suspense (required for useSearchParams in Next.js 13+)
export default function DetailedChat() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen text-black/50 text-xl">
          Loading chat…
        </div>
      }
    >
      <DetailedChatInner />
    </Suspense>
  );
}