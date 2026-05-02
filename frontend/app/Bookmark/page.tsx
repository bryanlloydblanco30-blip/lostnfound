"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Bell, BookmarkPlus, Menu, X, Bookmark } from "lucide-react";
import Link from "next/link";
import Sidebar from "../components/Sidebar";

import api from "../services/api";

type FilterType = "All" | "Lost" | "Found" | "Missing" | "Claimed";

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "Lost"    ? "bg-red-500 text-white" :
    status === "Found"   ? "bg-emerald-500 text-white" :
    status === "Missing" ? "bg-yellow-400 text-black" :
    status === "Claimed" ? "bg-blue-500 text-white" :
                          "bg-gray-400 text-white";

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold shadow-sm ${styles}`}>
      {status}
    </span>
  );
}

function ItemCard({ item }: { item: any }) {
  return (
    <Link href={`/detailed?id=${item.id}`} className="group block">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/25 bg-white/15 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/20">
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/5 pointer-events-none" />
        <div className="relative p-4">
          <h3 className="text-center text-lg font-bold text-black leading-tight line-clamp-1">
            {item.title}
          </h3>

          <div className="mt-4 flex justify-center">
            <div className="h-44 w-full max-w-[270px] rounded-[1.75rem] border border-white/30 bg-white/10 overflow-hidden shadow-inner flex items-center justify-center">
              {item.image ? (
                <img
                  src={item.image.startsWith('http') ? item.image : `http://localhost:8081${item.image}`}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <span className="text-black/50 text-sm">No Image</span>
              )}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-[90px_1fr] gap-y-1.5 text-sm">
            <span className="font-semibold text-black/80">Category:</span>
            <span className="text-right text-black/65">{item.category}</span>

            <span className="font-semibold text-black/80">Status:</span>
            <div className="flex justify-end">
              <StatusBadge status={item.status} />
            </div>

            <span className="font-semibold text-black/80">Location:</span>
            <span className="text-right text-black/65">{item.location}</span>

            <span className="font-semibold text-black/80">Date:</span>
            <span className="text-right text-black/65">{item.dateStr || item.date}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Bookmarks() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const [myItems, setMyItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBookmarks() {
      try {
        const data = await api.getBookmarks();
        setMyItems(data || []);
      } catch (err) {
        console.error("Failed to fetch bookmarks:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBookmarks();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications]);

  const filters: FilterType[] = ["All", "Lost", "Found", "Missing", "Claimed"];

  const filteredItems = myItems.filter((item) => {
    const q = searchQuery.toLowerCase();
    const title = item.title || "";
    const cat = item.category || "";
    const loc = item.location || "";
    const matchesSearch =
      q === "" ||
      title.toLowerCase().includes(q) ||
      cat.toLowerCase().includes(q) ||
      loc.toLowerCase().includes(q);

    const matchesFilter = activeFilter === "All" || item.status === activeFilter;

    return matchesSearch && matchesFilter;
  });

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
      className="flex flex-col font-poppins relative font-poppins"
    >
      {/* Soft decorative glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
        <div className="absolute right-0 top-24 h-96 w-96 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-lime-200/15 blur-3xl" />
      </div>

      <Sidebar isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />

      {/* Header */}
      <header className="fixed top-0 left-0 z-50 w-full px-4 sm:px-6 pt-4 pointer-events-none">
        <div className="flex items-center justify-between rounded-full border border-white/30 bg-white/25 px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.12)] backdrop-blur-xl lg:[padding-left:calc(18rem+16px)] pointer-events-auto">
          {/* Mobile Hamburger */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 text-[#000000] hover:bg-black/5 rounded-full transition"
            >
              <Menu size={28} strokeWidth={2.2} />
            </button>

            {/* Logo */}
            <div className="flex items-center gap-2">
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/75c8ab62870811c4b4e6b744abf4c9f3b6161c1a?width=330"
                alt="Lost and Found"
                className="h-10 w-auto object-contain"
              />
            </div>
            
            <span className="hidden sm:inline font-medium pl-4 text-black border-l border-black/20 ml-2">Bookmarks</span>
          </div>

          <div className="flex items-center gap-2">
             <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-full p-2 text-[#000000] transition hover:bg-black/5"
            >
              <Bell size={28} strokeWidth={2.1} />
              <span className="absolute -right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[11px] font-bold text-white shadow-sm">
                1
              </span>
            </button>
          </div>
        </div>

        {/* MINI NOTIFICATION BOX */}
        {showNotifications && (
          <div
            ref={notificationRef}
            className="absolute top-24 right-8 z-[9999] w-80 rounded-3xl bg-white/25 backdrop-blur-2xl border border-white/30 shadow-2xl p-6 pointer-events-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-xl text-[#000000]">Notifications</h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-[#000000]/70 hover:text-[#000000]"
              >
                <X size={22} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl bg-emerald-500/90 p-4 text-white">
                <p className="font-semibold">Daily Update</p>
                <p className="text-lg">1 object was found today</p>
                <p className="text-xs opacity-75 mt-2">Just now • AirPods Pro 2nd Gen</p>
              </div>
              <div className="text-center text-sm text-[#000000]/60 py-2">
                No more notifications
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col w-full pt-28 pb-8 pl-0 lg:pl-80 px-6 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl w-full">
          
          <div className="mb-4 flex items-center gap-3">
            <Bookmark size={34} className="text-[#E1F9DC]" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#E1F9DC]">Bookmarks</h1>
          </div>

          {/* Filters */}
          <div className="mb-5">
            <div className="mb-3 flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#E1F9DC]">Filters</h2>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white">
                {filteredItems.length}
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              {filters.map((filter) => {
                const isActive = activeFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 ${
                      isActive && filter === "Lost"    ? "bg-red-500 text-white shadow-md" :
                      isActive && filter === "Found"   ? "bg-emerald-500 text-white shadow-md" :
                      isActive && filter === "Missing" ? "bg-yellow-400 text-black shadow-md" :
                      isActive && filter === "Claimed" ? "bg-blue-500 text-white shadow-md" :
                      isActive                         ? "bg-black text-white" :
                      "border border-black/25 bg-white/15 text-[#000000]/80 hover:bg-white/25"
                    }`}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 h-px max-w-2xl bg-black/30" />
          </div>

          {/* Search */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex w-full max-w-xl items-center gap-3 rounded-full border border-white/30 bg-white/20 px-4 py-3 shadow-sm backdrop-blur-md">
              <Search size={18} className="text-[#E1F9DC]/60" />
              <input
                type="text"
                placeholder="Search bookmarks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-[#E1F9DC] outline-none placeholder:text-[#E1F9DC]/50"
              />
            </div>
          </div>

          {/* Item Cards Setup */}
          {filteredItems.length === 0 ? (
            <div className="rounded-3xl border border-white/25 bg-white/15 backdrop-blur-xl p-8 text-center mt-6">
              <p className="text-xl font-medium text-black">You haven't bookmarked any items yet.</p>
              <p className="text-sm text-black/60 mt-2">Head to the Main Page to explore posts.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {filteredItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
