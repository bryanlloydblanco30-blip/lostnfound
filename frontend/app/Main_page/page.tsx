"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Bell, Home, Menu, X, Plus, Upload } from "lucide-react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

// Item type matching backend ItemDto
type ApiItem = {
  id: number;
  title: string;
  category: string;
  status: string;
  location: string;
  dateStr: string;
  founder: string;
  image: string;
  bookmarked?: boolean;
};

type FilterType = "All" | "Lost" | "Found" | "Missing";

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "Lost"
      ? "bg-red-500 text-white"
      : status === "Found"
      ? "bg-emerald-500 text-white"
      : status === "Claimed"
      ? "bg-blue-500 text-white"
      : "bg-yellow-400 text-black";
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold shadow-sm ${styles}`}>
      {status}
    </span>
  );
}

function ItemCard({ item }: { item: ApiItem }) {
  const imgSrc = item.image?.startsWith('/')
    ? `http://localhost:8081${item.image}`
    : item.image;
  return (
    <Link href={`/detailed?id=${item.id}`} className="group block">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/25 bg-white/15 backdrop-blur-xl ] transition-all duration-300 hover:-translate-y-1 hover:bg-white/20">
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/5 pointer-events-none" />
        <div className="relative p-4">
          <h3 className="text-center text-lg font-bold text-black leading-tight line-clamp-1">
            {item.title}
          </h3>

          <div className="mt-4 flex justify-center">
            <div className="h-44 w-full max-w-[270px] rounded-[1.75rem] border border-white/30 bg-white/10 overflow-hidden shadow-inner">
              <img
                src={imgSrc || 'https://picsum.photos/600/400'}
                alt={item.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
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
            <span className="text-right text-black/65">{item.dateStr}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function MainPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [items, setItems] = useState<ApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [createPostLoading, setCreatePostLoading] = useState(false);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Load items from backend on mount and when filters change
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const statusFilter = activeFilter === "All" ? undefined : activeFilter;
        const data = await api.getItems({ search: searchQuery || undefined, status: statusFilter });
        setItems(data || []);
      } catch {
        // If API fails, keep empty
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [activeFilter, searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications]);

  const filters: FilterType[] = ["All", "Lost", "Found", "Missing"];

  // Filtering now done server-side; just use items as-is
  const filteredItems = items;

  // Create Post Form State
  const [createForm, setCreateForm] = useState({
    title: "",
    category: "Electronics",
    status: "Lost" as "Lost" | "Missing",
    location: "",
    date: "",
    imagePreview: "",
    imageFile: null as File | null,
    pinX: null as number | null,
    pinY: null as number | null,
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.title || !createForm.location) {
      alert("Title and Location are required!");
      return;
    }
    setCreatePostLoading(true);
    try {
      await api.createItem({
        title: createForm.title,
        category: createForm.category,
        status: createForm.status,
        location: createForm.location,
        dateStr: createForm.date,
        imageFile: createForm.imageFile ?? undefined,
        pinX: createForm.pinX ?? undefined,
        pinY: createForm.pinY ?? undefined,
      });
      alert("✅ Post created successfully!");
      setShowCreatePost(false);
      const data = await api.getItems();
      setItems(data || []);
      setCreateForm({ title: "", category: "Electronics", status: "Lost", location: "", date: "", imagePreview: "", imageFile: null, pinX: null, pinY: null });
    } catch (err: unknown) {
      alert("Failed to create post: " + (err instanceof Error ? err.message : "unknown error"));
    } finally {
      setCreatePostLoading(false);
    }
  };

  const handleMapClick = (e: React.MouseEvent<HTMLImageElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCreateForm(prev => ({ ...prev, pinX: parseFloat(x.toFixed(2)), pinY: parseFloat(y.toFixed(2)) }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setCreateForm((prev) => ({
        ...prev,
        imagePreview: previewUrl,
        imageFile: file,
      }));
    }
  };

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
      {/* Soft decorative glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
        <div className="absolute right-0 top-24 h-96 w-96 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-lime-200/15 blur-3xl" />
      </div>

      {/* Responsive Sidebar */}
      <Sidebar isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />

      {/* Header */}
      <header className="fixed top-0 left-0 z-50 w-full px-4 sm:px-6 pt-4">
        <div className="flex items-center justify-between rounded-full border border-white/30 bg-white/25 px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.12)] backdrop-blur-xl lg:[padding-left:calc(18rem+16px)]">
          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsMobileOpen(true)}
            className="lg:hidden p-2 text-[#E1F9DC] hover:bg-black/5 rounded-full transition"
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

          {/* Notification Bell */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-full p-2 text-[#000000] transition hover:bg-black/5"
          >
            <Bell size={30} strokeWidth={2.1} />
            <span className="absolute -right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[11px] font-bold text-white shadow-sm">
              1
            </span>
          </button>
        </div>

        {/* MINI NOTIFICATION BOX */}
        {showNotifications && (
          <div
            ref={notificationRef}
            className="fixed top-24 right-8 z-[9999] w-80 rounded-3xl bg-white/25 backdrop-blur-2xl border border-white/30 shadow-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-xl text-[#E1F9DC]">Notifications</h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-[#E1F9DC]/70 hover:text-[#E1F9DC]"
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
              <div className="text-center text-sm text-[#E1F9DC]/60 py-2">
                No more notifications
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col w-full pt-28 pb-8 pl-0 lg:pl-80 px-6 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl w-full">
          <div className="flex flex-col gap-6">
            <section className="flex-1">
              <div className="mb-4 flex items-center gap-3">
                <Home size={34} className="text-[#E1F9DC]" />
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#E1F9DC]">
                  Main Page
                </h1>
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
                          isActive
                            ? "bg-red-500 text-white shadow-md shadow-red-500/25"
                            : "border border-black/25 bg-white/15 text-[#000000]/80 hover:bg-white/25"
                        }`}
                      >
                        {filter}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 h-px max-w-2xl bg-black/30" />
              </div>

              {/* Search + Create Post */}
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex w-full max-w-xl items-center gap-3 rounded-full border border-white/30 bg-white/20 px-4 py-3 shadow-sm backdrop-blur-md">
                  <Search size={18} className="text-[#E1F9DC]/60" />
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-sm text-[#E1F9DC] outline-none placeholder:text-[#E1F9DC]/50"
                  />
                </div>

                <button
                  onClick={() => setShowCreatePost(true)}
                  className="flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 font-semibold text-[#000000] transition hover:brightness-95 hover:scale-[1.02]"
                >
                  <Plus size={20} />
                  Create Post
                </button>
              </div>

              {/* Item Cards */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {filteredItems.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* CREATE POST MODAL - UPDATED */}
      {showCreatePost && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCreatePost(false);
          }}
        >
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto mx-4 rounded-3xl bg-white/25 backdrop-blur-2xl border border-white/30 p-8 ">
            <button
              onClick={() => setShowCreatePost(false)}
              className="absolute top-6 right-6 text-[#E1F9DC]/70 hover:text-[#E1F9DC]"
            >
              <X size={28} strokeWidth={2.5} />
            </button>

            <h2 className="text-3xl font-bold text-[#E1F9DC] mb-8 flex items-center gap-3">
              <Plus size={32} className="text-emerald-600" />
              Create New Post
            </h2>

            <form onSubmit={handleCreateSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[#E1F9DC] mb-2">Item Title</label>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full bg-white rounded-2xl px-6 py-4 text-[#000000] outline-none border border-transparent focus:border-emerald-400"
                  placeholder="e.g. Black Wallet"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#000000] mb-2">Category</label>
                  <select
                    value={createForm.category}
                    onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                    className="w-full bg-white rounded-2xl px-6 py-4 text-[#000000] outline-none border border-transparent focus:border-emerald-400"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#000000] mb-2">Status</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setCreateForm({ ...createForm, status: "Lost" })}
                      className={`flex-1 rounded-2xl py-4 font-semibold transition-all ${
                        createForm.status === "Lost"
                          ? "bg-red-500 text-white"
                          : "bg-white/80 text-[#000000] hover:bg-white"
                      }`}
                    >
                      Lost
                    </button>
                    <button
                      type="button"
                      onClick={() => setCreateForm({ ...createForm, status: "Missing" })}
                      className={`flex-1 rounded-2xl py-4 font-semibold transition-all ${
                        createForm.status === "Missing"
                          ? "bg-yellow-400 text-[#000000]"
                          : "bg-white/80 text-[#000000] hover:bg-white"
                      }`}
                    >
                      Missing
                    </button>
                  </div>
                </div>
              </div>

              {/* PHOTO HOLDER (replaces URL input) */}
              <div>
                <label className="block text-sm font-semibold text-[#000000] mb-2">Photo</label>
                <div
                  className="relative border-2 border-dashed border-white/40 rounded-3xl h-48 flex flex-col items-center justify-center bg-white/10 hover:bg-white/20 transition-all cursor-pointer overflow-hidden"
                  onClick={() => document.getElementById("photo-upload")?.click()}
                >
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />

                  {createForm.imagePreview ? (
                    <img
                      src={createForm.imagePreview}
                      alt="Preview"
                      className="h-full w-full object-cover rounded-3xl"
                    />
                  ) : (
                    <>
                      <Upload size={40} className="text-[#000000]/60 mb-3" />
                      <p className="text-[#000000]/70 font-medium">Click to upload photo</p>
                      <p className="text-xs text-[#000000]/40 mt-1">PNG, JPG, JPEG • max 5MB</p>
                    </>
                  )}
                </div>
              </div>

              <div> 
                <label className="block text-sm font-semibold text-[#000000] mb-2">Location</label>
                <input
                  type="text"
                  value={createForm.location}
                  onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                  className="w-full bg-white rounded-2xl px-6 py-4 text-[#000000] outline-none border border-transparent focus:border-emerald-400"
                  placeholder="e.g. Cafeteria"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#000000] mb-2">Date</label>
                <input
                  type="date"
                  value={createForm.date}
                  onChange={(e) => setCreateForm({ ...createForm, date: e.target.value })}
                  className="w-full bg-white rounded-2xl px-6 py-4 text-[#000000] outline-none border border-transparent focus:border-emerald-400"
                />
              </div>

              {/* MAP PIN PICKER */}
              <div>
                <label className="block text-sm font-semibold text-[#000000] mb-2 flex items-center gap-2">
                  📍 Pin Location on Map
                  <span className="text-xs font-normal text-black/50">(optional — click map to mark where it was found/lost)</span>
                </label>
                <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-emerald-400/60 cursor-crosshair">
                  <img
                    src="/map.png"
                    alt="Campus Map"
                    className="w-full h-auto object-contain block select-none"
                    onClick={handleMapClick}
                    draggable={false}
                  />
                  {createForm.pinX !== null && createForm.pinY !== null && (
                    <div
                      className="absolute pointer-events-none"
                      style={{
                        left: `${createForm.pinX}%`,
                        top: `${createForm.pinY}%`,
                        transform: "translate(-50%, -100%)",
                      }}
                    >
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-bounce">
                        <span className="text-white text-base">📍</span>
                      </div>
                    </div>
                  )}
                  {createForm.pinX === null && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="bg-black/40 text-white text-sm font-medium px-4 py-2 rounded-full backdrop-blur-sm">
                        Click anywhere on the map to drop a pin
                      </span>
                    </div>
                  )}
                </div>
                {createForm.pinX !== null && (
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-black/60">
                      📍 Pin set at ({createForm.pinX.toFixed(1)}%, {createForm.pinY!.toFixed(1)}%)
                    </p>
                    <button
                      type="button"
                      onClick={() => setCreateForm(prev => ({ ...prev, pinX: null, pinY: null }))}
                      className="text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      Remove pin
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full rounded-3xl bg-emerald-500 py-4 font-semibold text-[#E1F9DC] text-lg shadow-md shadow-emerald-600/30 hover:brightness-110 transition-all"
              >
                Post It Now
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}