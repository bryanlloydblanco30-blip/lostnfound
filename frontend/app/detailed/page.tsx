"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Bell, X, Phone, MessageCircle, Bookmark, Menu, Pencil, Trash2, Upload } from "lucide-react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

type ItemData = {
  id: number;
  title: string;
  category: string;
  status: string;
  location: string;
  dateStr: string;
  founder: string;
  image: string | null;
  bookmarked: boolean;
  postedBy: null | { id: number; name: string; srCode: string; number: string; email: string; photo: string };
};

const STATUS_COLORS: Record<string, string> = {
  Lost:    "bg-red-500 text-white",
  Missing: "bg-yellow-400 text-black",
  Found:   "bg-emerald-500 text-white",
  Claimed: "bg-blue-500 text-white",
};

function DetailedContent() {
  const searchParams  = useSearchParams();
  const router        = useRouter();
  const itemId        = searchParams.get("id");

  const [item, setItem]               = useState<ItemData | null>(null);
  const [loadingItem, setLoadingItem] = useState(true);
  const [isMobileOpen, setIsMobileOpen]       = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showContactModal, setShowContactModal]   = useState(false);
  const [isBookmarked, setIsBookmarked]           = useState(false);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "", category: "Electronics", status: "Lost", location: "", dateStr: "",
    imagePreview: "", imageFile: null as File | null,
    pinX: null as number | null, pinY: null as number | null,
  });
  const [editSaving, setEditSaving] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);
  const currentUser = api.getStoredUser();

  // ── Fetch item ──────────────────────────────────────────────────────────────
  const fetchItem = () => {
    if (!itemId) { setLoadingItem(false); return; }
    setLoadingItem(true);
    api.getItem(Number(itemId))
      .then((res: any) => {
        setItem(res);
        setIsBookmarked(res.bookmarked || false);
      })
      .catch((err: any) => console.error("Failed to load item:", err))
      .finally(() => setLoadingItem(false));
  };

  useEffect(() => { fetchItem(); }, [itemId]);

  // ── Bookmark ────────────────────────────────────────────────────────────────
  const toggleBookmark = async () => {
    if (!item || item.id === 0) return;
    try {
      if (isBookmarked) { await api.removeBookmark(item.id); setIsBookmarked(false); }
      else              { await api.addBookmark(item.id);    setIsBookmarked(true);  }
    } catch (err) { console.error("Bookmark error", err); }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!item) return;
    if (!confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    try {
      await api.deleteItem(item.id);
      router.push("/Main_page");
    } catch (err: any) {
      alert("Failed to delete: " + (err?.message || "Unknown error"));
    }
  };

  // ── Edit ────────────────────────────────────────────────────────────────────
  const openEdit = () => {
    if (!item) return;
    setEditForm({
      title: item.title, category: item.category, status: item.status,
      location: item.location, dateStr: item.dateStr,
      imagePreview: item.image
        ? (item.image.startsWith("/") ? `http://localhost:8081${item.image}` : item.image)
        : "",
      imageFile: null,
      pinX: (item as any).pinX ?? null,
      pinY: (item as any).pinY ?? null,
    });
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    if (!item) return;
    setEditSaving(true);
    try {
      let imageUrl: string | undefined;
      if (editForm.imageFile) {
        const { url } = await api.uploadImage(editForm.imageFile);
        imageUrl = url;
      }
      await api.updateItem(item.id, {
        title:    editForm.title,
        category: editForm.category,
        status:   editForm.status,
        location: editForm.location,
        dateStr:  editForm.dateStr,
        pinX:     editForm.pinX ?? undefined,
        pinY:     editForm.pinY ?? undefined,
        ...(imageUrl ? { image: imageUrl } : {}),
      });
      setShowEditModal(false);
      fetchItem(); // reload fresh data
    } catch (err: any) {
      alert("Failed to save: " + (err?.message || "Unknown error"));
    } finally {
      setEditSaving(false);
    }
  };

  // ── Notification click-outside ───────────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications]);

  // ── Go to chat ──────────────────────────────────────────────────────────────
  const goToChat = () => {
    if (!item?.postedBy) { alert("Cannot message: poster info not available."); return; }
    router.push(
      `/chat/detailedchat?receiverId=${item.postedBy.id}&name=${encodeURIComponent(item.postedBy.name || item.founder)}&code=${encodeURIComponent(item.postedBy.srCode || "")}`
    );
  };

  // ── Computed ────────────────────────────────────────────────────────────────
  const isOwner   = !!(currentUser && item?.postedBy && currentUser.id === item.postedBy.id);
  const statusClr = STATUS_COLORS[item?.status ?? "Lost"] ?? "bg-gray-400 text-white";

  const founderInfo = item?.postedBy
    ? {
        name:  item.postedBy.name  || item.founder,
        srCode: item.postedBy.srCode || "N/A",
        number: item.postedBy.number || "N/A",
        email:  item.postedBy.email  || "N/A",
        photo:  item.postedBy.photo
          ? (item.postedBy.photo.startsWith("/") ? `http://localhost:8081${item.postedBy.photo}` : item.postedBy.photo)
          : null,
      }
    : { name: item?.founder || "Unknown", srCode: "N/A", number: "N/A", email: "N/A", photo: null };

  // ── Render ──────────────────────────────────────────────────────────────────
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
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
        <div className="absolute right-0 top-24 h-96 w-96 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-lime-200/15 blur-3xl" />
      </div>

      <Sidebar isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />

      {/* Header */}
      <header className="fixed top-0 left-0 z-50 w-full px-4 sm:px-6 pt-4">
        <div className="flex items-center justify-between rounded-full border border-white/30 bg-white/25 px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.12)] backdrop-blur-xl lg:[padding-left:calc(18rem+16px)]">
          <button onClick={() => setIsMobileOpen(true)} className="lg:hidden p-2 text-black hover:bg-black/5 rounded-full transition">
            <Menu size={28} strokeWidth={2.2} />
          </button>
          <div className="flex items-center gap-2">
            <img src="https://api.builder.io/api/v1/image/assets/TEMP/75c8ab62870811c4b4e6b744abf4c9f3b6161c1a?width=330" alt="Lost and Found" className="h-10 w-auto object-contain" />
          </div>
          <button onClick={() => setShowNotifications(!showNotifications)} className="relative rounded-full p-2 text-black transition hover:bg-black/5">
            <Bell size={30} strokeWidth={2.1} />
            <span className="absolute -right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[11px] font-bold text-white shadow-sm">1</span>
          </button>
        </div>
        {showNotifications && (
          <div ref={notificationRef} className="fixed top-24 right-8 z-[9999] w-80 rounded-3xl bg-white/25 backdrop-blur-2xl border border-white/30 shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-xl text-black">Notifications</h3>
              <button onClick={() => setShowNotifications(false)} className="text-black/70 hover:text-black"><X size={22} /></button>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl bg-emerald-500/90 p-4 text-white">
                <p className="font-semibold">Daily Update</p>
                <p className="text-lg">1 object was found today</p>
                <p className="text-xs opacity-75 mt-2">Just now • AirPods Pro 2nd Gen</p>
              </div>
              <div className="text-center text-sm text-black/60 py-2">No more notifications</div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col w-full pt-28 pb-8 pl-0 lg:pl-80 px-6 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl w-full">

          {/* Back + Owner actions */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-black hover:text-black/70 transition-colors">
              <span className="text-3xl leading-none">←</span>
              <span className="font-medium text-xl">Back</span>
            </button>

            {/* Owner buttons */}
            {isOwner && !loadingItem && (
              <div className="flex gap-3">
                <button
                  onClick={openEdit}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500 text-black font-semibold hover:brightness-110 transition-all active:scale-95 shadow-sm"
                >
                  <Pencil size={16} />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-500 text-white font-semibold hover:brightness-110 transition-all active:scale-95 shadow-sm"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            )}
          </div>

          {/* Loading overlay */}
          {loadingItem ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <div className="w-14 h-14 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin" />
              <p className="text-black/60 font-medium text-lg">Loading item…</p>
            </div>
          ) : !item ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <p className="text-black/60 font-medium text-xl">Item not found.</p>
              <button onClick={() => router.push("/Main_page")} className="px-6 py-3 rounded-full bg-emerald-500 text-black font-semibold">Go Home</button>
            </div>
          ) : (
            <>
              {/* Title & Bookmark */}
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#E1F9DC] tracking-tight">{item.title}</h1>
                <button
                  onClick={toggleBookmark}
                  className={`flex items-center justify-center p-3 sm:p-4 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-xl transition shadow-sm ${isBookmarked ? "text-emerald-500" : "text-black"}`}
                >
                  <Bookmark size={28} strokeWidth={2.2} fill={isBookmarked ? "currentColor" : "none"} />
                </button>
              </div>

              <div className="flex flex-col lg:flex-row gap-12">
                {/* Photo */}
                <div className="lg:w-2/5">
                  <div className="rounded-[2rem] bg-white/30 backdrop-blur-2xl border border-white/40 p-4">
                    <div className="aspect-square rounded-2xl overflow-hidden flex items-center justify-center bg-black/5">
                      {item.image ? (
                        <img
                          src={item.image.startsWith("/") ? `http://localhost:8081${item.image}` : item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-3 text-black/40">
                          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                          <span className="text-sm font-medium">No Image Available</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="lg:w-3/5 flex flex-col">
                  <div className="space-y-7 text-xl">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-black">Category:</span>
                      <span className="text-black/80">{item.category}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-black">Status:</span>
                      <span className={`px-6 py-2 rounded-full text-base font-semibold ${statusClr}`}>{item.status}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-black">Location:</span>
                      <span className="text-black/80">{item.location}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-black">Date:</span>
                      <span className="text-black/80">{item.dateStr}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-black">Founder:</span>
                      <span className="text-black/80">{item.founder}</span>
                    </div>
                  </div>

                  {/* Contact / Message — only if NOT the owner */}
                  {!isOwner && (
                    <div className="mt-auto pt-12">
                      <p className="text-center text-black/60 mb-8 text-lg">Contact or Message the Founder to claim the item</p>
                      <div className="flex flex-col gap-4">
                        <button
                          onClick={() => setShowContactModal(true)}
                          className="w-full py-5 rounded-[2rem] bg-[#a8d5b5] border-2 border-emerald-700 font-semibold text-xl text-black hover:brightness-110 transition-all active:scale-95"
                        >
                          Contact the Founder
                        </button>
                        <button
                          onClick={goToChat}
                          className="w-full py-5 rounded-[2rem] border-2 border-black font-semibold text-xl text-black hover:bg-black/5 transition-all active:scale-95"
                        >
                          Message the Founder
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Owner label */}
                  {isOwner && (
                    <div className="mt-auto pt-12">
                      <div className="rounded-3xl border-2 border-emerald-400/60 bg-emerald-500/10 p-6 text-center">
                        <p className="text-emerald-800 font-semibold text-lg">📌 You posted this item</p>
                        <p className="text-black/60 text-sm mt-1">Use the Edit or Delete buttons above to manage it.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* CONTACT MODAL */}
      {showContactModal && item && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setShowContactModal(false); }}>
          <div className="relative w-full max-w-md mx-4 rounded-3xl bg-white/25 backdrop-blur-2xl border border-white/30 p-8">
            <button onClick={() => setShowContactModal(false)} className="absolute top-6 right-6 text-black/70 hover:text-black"><X size={28} /></button>
            <div className="flex flex-col items-center text-center">
              {founderInfo.photo ? (
                <img src={founderInfo.photo} alt={founderInfo.name} className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-md mb-6" />
              ) : (
                <div className="h-24 w-24 rounded-full bg-emerald-600 flex items-center justify-center border-4 border-white shadow-md mb-6 text-white font-bold text-3xl">
                  {founderInfo.name.charAt(0).toUpperCase()}
                </div>
              )}
              <h2 className="text-3xl font-bold text-black mb-1">{founderInfo.name}</h2>
              <p className="text-emerald-700 font-medium">SR-Code: {founderInfo.srCode}</p>
              <div className="w-full mt-8 space-y-4">
                <div className="flex items-center gap-4 bg-white/30 rounded-2xl p-4">
                  <Phone size={24} className="text-black shrink-0" />
                  <div className="text-left">
                    <p className="text-xs text-black/60">Phone Number</p>
                    <p className="font-semibold text-black">{founderInfo.number}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-white/30 rounded-2xl p-4">
                  <MessageCircle size={24} className="text-black shrink-0" />
                  <div className="text-left">
                    <p className="text-xs text-black/60">Email Address</p>
                    <p className="font-semibold text-black">{founderInfo.email}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 w-full mt-8">
                <button onClick={() => alert(`📞 Calling ${founderInfo.number}…`)} className="flex-1 py-4 rounded-3xl bg-emerald-500 font-semibold text-black hover:brightness-110 transition-all">Call Now</button>
                <button onClick={() => { goToChat(); setShowContactModal(false); }} className="flex-1 py-4 rounded-3xl border-2 border-black font-semibold text-black hover:bg-white/30 transition-all">Send Message</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && item && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setShowEditModal(false); }}>
          <div className="relative w-full max-w-lg mx-4 rounded-3xl bg-white/25 backdrop-blur-2xl border border-white/30 p-8 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowEditModal(false)} className="absolute top-6 right-6 text-black/70 hover:text-black"><X size={28} /></button>
            <h2 className="text-2xl font-bold text-black mb-6 flex items-center gap-2"><Pencil size={24} /> Edit Item</h2>

            <div className="space-y-5">
              {/* Photo */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2">Photo</label>
                <div
                  className="relative h-40 rounded-2xl overflow-hidden border-2 border-dashed border-white/40 bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition"
                  onClick={() => document.getElementById("edit-photo-input")?.click()}
                >
                  <input id="edit-photo-input" type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setEditForm(prev => ({ ...prev, imageFile: f, imagePreview: URL.createObjectURL(f) }));
                  }} />
                  {editForm.imagePreview ? (
                    <img src={editForm.imagePreview} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-black/50">
                      <Upload size={32} />
                      <span className="text-sm">Click to change photo</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2">Title</label>
                <input type="text" value={editForm.title} onChange={(e) => setEditForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full bg-white rounded-2xl px-5 py-3.5 text-black outline-none border border-transparent focus:border-emerald-400" />
              </div>

              {/* Category + Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Category</label>
                  <select value={editForm.category} onChange={(e) => setEditForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full bg-white rounded-2xl px-5 py-3.5 text-black outline-none border border-transparent focus:border-emerald-400">
                    <option>Electronics</option>
                    <option>Accessories</option>
                    <option>Clothing</option>
                    <option>Documents</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Lost", "Missing", "Found", "Claimed"].map((s) => (
                      <button key={s} type="button" onClick={() => setEditForm(p => ({ ...p, status: s }))}
                        className={`rounded-xl py-3 text-sm font-semibold transition-all ${editForm.status === s
                          ? s === "Lost"    ? "bg-red-500 text-white"
                          : s === "Found"   ? "bg-emerald-500 text-white"
                          : s === "Missing" ? "bg-yellow-400 text-black"
                          :                   "bg-blue-500 text-white"
                          : "bg-white/80 text-black hover:bg-white"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2">Location</label>
                <input type="text" value={editForm.location} onChange={(e) => setEditForm(p => ({ ...p, location: e.target.value }))}
                  className="w-full bg-white rounded-2xl px-5 py-3.5 text-black outline-none border border-transparent focus:border-emerald-400" />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2">Date</label>
                <input type="date" value={editForm.dateStr} onChange={(e) => setEditForm(p => ({ ...p, dateStr: e.target.value }))}
                  className="w-full bg-white rounded-2xl px-5 py-3.5 text-black outline-none border border-transparent focus:border-emerald-400" />
              </div>

              {/* Map Pin Picker in Edit */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2 flex items-center justify-between">
                  <span>📍 Update Pin Location</span>
                  {editForm.pinX !== null && (
                    <button type="button" onClick={() => setEditForm(p => ({ ...p, pinX: null, pinY: null }))} className="text-[10px] text-red-500 font-bold uppercase tracking-wider">Remove Pin</button>
                  )}
                </label>
                <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-emerald-400/40 cursor-crosshair">
                  <img
                    src="/map.png"
                    alt="Map"
                    className="w-full h-auto object-contain block select-none"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = ((e.clientX - rect.left) / rect.width) * 100;
                      const y = ((e.clientY - rect.top) / rect.height) * 100;
                      setEditForm(p => ({ ...p, pinX: parseFloat(x.toFixed(2)), pinY: parseFloat(y.toFixed(2)) }));
                    }}
                    draggable={false}
                  />
                  {editForm.pinX !== null && editForm.pinY !== null && (
                    <div className="absolute pointer-events-none" style={{ left: `${editForm.pinX}%`, top: `${editForm.pinY}%`, transform: "translate(-50%, -100%)" }}>
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-bounce">
                        <span className="text-white text-base">📍</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowEditModal(false)} disabled={editSaving}
                  className="flex-1 py-4 rounded-2xl border border-black/30 bg-white/80 font-semibold text-black hover:bg-white transition-all disabled:opacity-50">
                  Cancel
                </button>
                <button onClick={handleEditSave} disabled={editSaving}
                  className="flex-1 py-4 rounded-2xl bg-emerald-500 font-semibold text-black hover:brightness-110 transition-all disabled:opacity-60">
                  {editSaving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DetailedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-14 h-14 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin" />
      </div>
    }>
      <DetailedContent />
    </Suspense>
  );
}