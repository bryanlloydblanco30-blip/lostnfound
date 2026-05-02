"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Menu, Bell, X } from "lucide-react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

interface Contact {
  id: string | number;
  name: string;
  code: string;
  hasMessage?: boolean;
  convId?: string;
}

interface ContactRowProps {
  contact: Contact;
  isActive: boolean;
}

function ContactRow({ contact, isActive }: ContactRowProps) {
  const router = useRouter();

  return (
    <div
      className="flex items-center justify-between px-4 lg:px-8 py-4 border border-white/47 transition-all mb-0 last:mb-0"
      style={{
        background: isActive
          ? "rgba(255,255,255,0.35)"
          : "rgba(255,255,255,0.01)",
        backdropFilter: "blur(9.9px)",
        minHeight: "106px",
      }}
    >
      <div className="flex items-center gap-4 lg:gap-6">
        {/* Avatar + unread dot */}
        <div className="relative w-14 h-14 lg:w-[76px] lg:h-[76px] shrink-0 flex items-center justify-center">
          <svg
            width="56"
            height="56"
            viewBox="0 0 76 76"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-14 h-14 lg:w-[72px] lg:h-[72px]"
          >
            <path
              d="M38 12.6667C41.3594 12.6667 44.5812 14.0013 46.9566 16.3767C49.3321 18.7522 50.6666 21.974 50.6666 25.3334C50.6666 28.6928 49.3321 31.9146 46.9566 34.2901C44.5812 36.6656 41.3594 38.0001 38 38.0001C34.6405 38.0001 31.4187 36.6656 29.0433 34.2901C26.6678 31.9146 25.3333 28.6928 25.3333 25.3334C25.3333 21.974 26.6678 18.7522 29.0433 16.3767C31.4187 14.0013 34.6405 12.6667 38 12.6667ZM38 44.3334C51.9966 44.3334 63.3333 50.0017 63.3333 57.0001V63.3334H12.6666V57.0001C12.6666 50.0017 24.0033 44.3334 38 44.3334Z"
              fill="black"
            />
          </svg>

          {contact.hasMessage && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#12FE45] rounded-full border-2 border-white flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full" />
            </div>
          )}
        </div>

        {/* Name and code */}
        <div>
          <p className="text-black font-semibold text-lg lg:text-xl leading-tight">
            {contact.name || "Unknown User"}
          </p>
          <p className="text-black font-semibold text-sm lg:text-base leading-tight mt-0.5">
            {contact.code}
          </p>
        </div>
      </div>

      {/* Message button — passes receiverId to detailedchat */}
      <button
        className="shrink-0 flex items-center justify-center h-10 lg:h-[38px] px-6 lg:px-8 rounded-full border border-[#12FE45] font-semibold text-black text-base lg:text-[22px] transition-all hover:bg-[#12FE45]/20"
        style={{
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(15px)",
        }}
        onClick={() =>
          router.push(
            `/chat/detailedchat?receiverId=${contact.id}&name=${encodeURIComponent(contact.name || "")}&code=${encodeURIComponent(contact.code)}`
          )
        }
      >
        Message
      </button>
    </div>
  );
}

export default function Messages() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Fetch conversations from backend
  useEffect(() => {
    api
      .getConversations()
      .then((data: any[]) => {
        // Backend returns ConversationDto with nested otherUser
        const mapped: Contact[] = data.map((c: any) => ({
          id: c.otherUser?.id ?? c.id,
          name: c.otherUser?.name ?? c.name ?? "Unknown",
          code: c.otherUser?.srCode ?? c.srCode ?? c.code ?? "",
          hasMessage: (c.unreadCount ?? 0) > 0,
          convId: c.id, // Keep the actual conversation ID for keys
        }));
        setContacts(mapped);
      })
      .catch((err: Error) => {
        console.error("Failed to load conversations:", err);
        setError("Could not load messages. Please try again.");
      })
      .finally(() => setLoading(false));
  }, []);

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
      {/* Decorative glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
        <div className="absolute right-0 top-24 h-96 w-96 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-lime-200/15 blur-3xl" />
      </div>

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
          {/* Page header */}
          <div className="flex items-center justify-between px-2 lg:px-4">
            <div className="flex items-center gap-3 lg:gap-4">
              <svg
                width="60"
                height="60"
                viewBox="0 0 92 92"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-12 h-12 lg:w-[72px] lg:h-[72px] shrink-0"
              >
                <path
                  d="M53.6667 57.5V65.1667C53.6667 66.1833 53.2628 67.1584 52.5439 67.8772C51.825 68.5961 50.85 69 49.8333 69H23L11.5 80.5V42.1667C11.5 41.15 11.9039 40.175 12.6228 39.4561C13.3416 38.7372 14.3167 38.3333 15.3333 38.3333H23M80.5 53.6667L69 42.1667H42.1667C41.15 42.1667 40.175 41.7628 39.4561 41.0439C38.7372 40.325 38.3333 39.35 38.3333 38.3333V15.3333C38.3333 14.3167 38.7372 13.3416 39.4561 12.6228C40.175 11.9039 41.15 11.5 42.1667 11.5H76.6667C77.6833 11.5 78.6584 11.9039 79.3772 12.6228C80.0961 13.3416 80.5 14.3167 80.5 15.3333V53.6667Z"
                  stroke="black"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#E1F9DC] leading-none">
                Messages
              </h1>
            </div>

            <button
              className="p-2 hover:bg-black/10 rounded-full transition-colors"
              aria-label="Go back"
              onClick={() => window.history.back()}
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 69 69"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-10 h-10 lg:w-12 lg:h-12"
              >
                <path
                  d="M11.5001 28.7499L9.46744 30.7825L7.43481 28.7499L9.46744 26.7173L11.5001 28.7499ZM60.3751 51.7499C60.3751 52.5124 60.0722 53.2437 59.533 53.7828C58.9938 54.322 58.2626 54.6249 57.5001 54.6249C56.7376 54.6249 56.0063 54.322 55.4671 53.7828C54.928 53.2437 54.6251 52.5124 54.6251 51.7499H60.3751ZM23.8424 45.1575L9.46744 30.7825L13.5327 26.7173L27.9077 41.0923L23.8424 45.1575ZM9.46744 26.7173L23.8424 12.3423L27.9077 16.4075L13.5327 30.7825L9.46744 26.7173ZM11.5001 25.8749H40.2501V31.6249H11.5001V25.8749ZM60.3751 45.9999V51.7499H54.6251V45.9999H60.3751ZM40.2501 25.8749C45.5875 25.8749 50.7064 27.9952 54.4806 31.7694C58.2548 35.5436 60.3751 40.6624 60.3751 45.9999H54.6251C54.6251 42.1874 53.1106 38.5311 50.4147 35.8352C47.7189 33.1394 44.0625 31.6249 40.2501 31.6249V25.8749Z"
                  fill="black"
                />
              </svg>
            </button>
          </div>

          {/* Contact list */}
          <div className="flex flex-col max-h-[calc(100vh-260px)] overflow-y-auto mt-4">
            {loading && (
              <div className="flex items-center justify-center py-16 text-black/60 font-medium text-lg">
                Loading messages…
              </div>
            )}

            {!loading && error && (
              <div className="flex items-center justify-center py-16 text-red-600 font-medium text-lg">
                {error}
              </div>
            )}

            {!loading && !error && contacts.length === 0 && (
              <div className="flex items-center justify-center py-16 text-black/50 font-medium text-lg">
                No conversations yet.
              </div>
            )}

            {!loading && !error && contacts.map((contact, idx) => (
                <ContactRow
                  key={contact.convId || contact.id}
                  contact={contact}
                  isActive={idx === 0}
                />
              ))}
          </div>
        </div>
      </main>
    </div>
  );
}