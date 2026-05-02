"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, ClipboardList, MessageSquare, Bookmark, LogOut, X, Upload } from "lucide-react";
import api from "../services/api";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Main Page", icon: Home, href: "/Main_page" },
    { label: "Map View", icon: Map, href: "/Map_view" },
    { label: "My Reports", icon: ClipboardList, href: "/My_reports" },
    { label: "Messages", icon: MessageSquare, href: "/chat" },
    { label: "Bookmark", icon: Bookmark, href: "/Bookmark" },
    { label: "Logout", icon: LogOut, href: "/Logout" },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [userPhoto, setUserPhoto] = useState<string>("");
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState<string>("");

  const [formData, setFormData] = useState({
    name: "",
    srCode: "",
    number: "",
    course: "",
    section: "",
  });

  // Load real profile from backend on mount
  useEffect(() => {
    api
      .getMe()
      .then((user: any) => {
        if (!user) return;
        setFormData({
          name: user.name || "",
          srCode: user.srCode || "",
          number: user.number || "",
          course: user.course || "",
          section: user.section || "",
        });
        if (user.photo) {
          setUserPhoto(
            user.photo.startsWith("/")
              ? `http://localhost:8081${user.photo}`
              : user.photo
          );
        }
      })
      .catch((err: any) => console.error("Failed to load profile:", err));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditPhotoFile(file);
      setEditPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let photoUrl = userPhoto;

      // Upload new photo if selected
      if (editPhotoFile) {
        const { url } = await api.uploadImage(editPhotoFile);
        photoUrl = url.startsWith("/") ? `http://localhost:8081${url}` : url;
      }

      // Save profile to backend
      await api.updateProfile({
        name: formData.name,
        number: formData.number,
        course: formData.course,
        section: formData.section,
        photo: photoUrl,
      });

      setUserPhoto(photoUrl);
      setEditPhotoFile(null);
      setEditPhotoPreview("");
      setIsEditing(false);
      setIsModalOpen(false);
      alert("✅ Profile updated successfully!");
    } catch (err: any) {
      console.error("Failed to save profile:", err);
      alert("Failed to save profile: " + (err?.message || "Unknown error"));
    } finally {
      setIsSaving(false);
    }
  };

  const openProfileModal = () => {
    setEditPhotoPreview("");
    setEditPhotoFile(null);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-72 border-r border-white/20 bg-white/15 backdrop-blur-xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          backgroundImage: "url('/Sidebar.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Top padding to clear fixed header */}
        <nav className="pt-30 px-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => {
                  if (isOpen) onClose();
                }}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition-all duration-200 ${
                  isActive
                    ? "bg-white/30 text-black shadow-sm"
                    : "text-black/80 hover:bg-white/25 hover:text-black"
                }`}
              >
                <Icon size={24} strokeWidth={2} />
                <span className="font-medium text-base">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Profile - Click to open modal */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/20 py-2">
          <button
            onClick={openProfileModal}
            className="px-4 flex w-full items-center gap-3 bg-emerald-500 py-3.5 text-left transition-all hover:brightness-110 active:scale-[0.98]"
          >
            <div className="h-12 w-12 overflow-hidden rounded-full border border-white/40 bg-white flex-shrink-0">
              {userPhoto ? (
                <img
                  src={userPhoto}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-emerald-700 flex items-center justify-center text-white font-bold text-lg">
                  {formData.name ? formData.name.charAt(0).toUpperCase() : "?"}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-black truncate">
                {formData.name || "Loading…"}
              </p>
              <p className="text-sm text-black/75 truncate">
                {formData.srCode || "SR-Code"}
              </p>
            </div>
          </button>
        </div>
      </aside>

      {/* PROFILE MODAL */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div className="relative w-full max-w-2xl mx-4 rounded-3xl bg-white/25 backdrop-blur-2xl border border-white/30 p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-black/70 hover:text-black transition-colors"
            >
              <X size={28} strokeWidth={2.5} />
            </button>

            <div className="flex justify-between items-start mb-10">
              <div className="flex flex-col items-center">
                <div
                  className={`relative h-32 w-32 rounded-full border-4 border-white shadow-2xl overflow-hidden transition-all ${
                    isEditing ? "cursor-pointer hover:ring-4 hover:ring-emerald-400" : ""
                  }`}
                  onClick={() => {
                    if (isEditing) document.getElementById("profile-photo-upload")?.click();
                  }}
                >
                  <input
                    id="profile-photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleEditPhotoUpload}
                  />

                  {editPhotoPreview || userPhoto ? (
                    <img
                      src={editPhotoPreview || userPhoto}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-emerald-600 flex items-center justify-center text-white font-bold text-4xl">
                      {formData.name ? formData.name.charAt(0).toUpperCase() : "?"}
                    </div>
                  )}

                  {isEditing && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Upload size={32} className="text-white drop-shadow" />
                    </div>
                  )}
                </div>
                {isEditing && (
                  <p className="text-xs text-emerald-700 font-medium mt-2">Click to upload new photo</p>
                )}
              </div>

              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/75c8ab62870811c4b4e6b744abf4c9f3b6161c1a?width=400"
                alt="Lost and Found"
                className="h-24 object-contain"
              />
            </div>

            <div className="grid grid-cols-[120px_1fr] gap-x-8 gap-y-6 items-center">
              <span className="text-right font-semibold text-black">Name:</span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="bg-white rounded-2xl px-6 py-4 text-black outline-none border border-transparent focus:border-emerald-400 shadow-sm disabled:opacity-75 disabled:cursor-not-allowed"
                placeholder="Enter your name"
              />

              <span className="text-right font-semibold text-black">Sr-Code:</span>
              <input
                type="text"
                name="srCode"
                value={formData.srCode}
                onChange={handleInputChange}
                disabled={true}
                className="bg-white rounded-2xl px-6 py-4 text-black outline-none border border-transparent shadow-sm opacity-75 cursor-not-allowed"
                placeholder="SR-Code (set at signup)"
              />

              <span className="text-right font-semibold text-black">Number:</span>
              <input
                type="text"
                name="number"
                value={formData.number}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="bg-white rounded-2xl px-6 py-4 text-black outline-none border border-transparent focus:border-emerald-400 shadow-sm disabled:opacity-75 disabled:cursor-not-allowed"
                placeholder="Enter number"
              />

              <span className="text-right font-semibold text-black">Course:</span>
              <input
                type="text"
                name="course"
                value={formData.course}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="bg-white rounded-2xl px-6 py-4 text-black outline-none border border-transparent focus:border-emerald-400 shadow-sm disabled:opacity-75 disabled:cursor-not-allowed"
                placeholder="Enter course"
              />

              <span className="text-right font-semibold text-black">Section:</span>
              <input
                type="text"
                name="section"
                value={formData.section}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="bg-white rounded-2xl px-6 py-4 text-black outline-none border border-transparent focus:border-emerald-400 shadow-sm disabled:opacity-75 disabled:cursor-not-allowed"
                placeholder="Enter section"
              />
            </div>

            {/* QR Code */}
            <div className="mt-10 pt-6 border-t border-white/30">
              <p className="text-sm font-semibold text-black mb-3 flex items-center gap-2">
                <span>Your SR Code QR Code</span>
                <span className="text-[10px] bg-emerald-200 text-emerald-800 px-2 py-px rounded-full">SCAN ME</span>
              </p>
              <div className="flex justify-center bg-white/90 p-5 rounded-3xl shadow-inner">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=SR%20Code%3A%20${encodeURIComponent(
                    formData.srCode || "Not set"
                  )}&color=111111&bgcolor=ffffff`}
                  alt="SR Code QR"
                  className="rounded-2xl"
                />
              </div>
              <p className="text-center text-[10px] font-mono text-black/60 mt-3 break-all">
                {formData.srCode ? `SR Code: ${formData.srCode}` : "Set your SR Code above to generate QR"}
              </p>
            </div>

            <div className="mt-10 flex justify-end gap-4">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="rounded-2xl border border-black/30 bg-white/80 px-8 py-3.5 font-semibold text-black hover:bg-white transition-all active:scale-95"
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditPhotoPreview("");
                      setEditPhotoFile(null);
                    }}
                    className="rounded-2xl border border-black/30 bg-white/80 px-8 py-3.5 font-semibold text-black hover:bg-white transition-all active:scale-95"
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="rounded-2xl bg-emerald-500 px-8 py-3.5 font-semibold text-black shadow-md shadow-emerald-600/30 hover:brightness-110 transition-all active:scale-95 disabled:opacity-60"
                  >
                    {isSaving ? "Saving…" : "Save Changes"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
}