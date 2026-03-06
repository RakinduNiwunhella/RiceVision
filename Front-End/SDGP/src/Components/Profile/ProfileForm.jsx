import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { FaCamera } from "react-icons/fa";

export default function ProfileForm() {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    nic: "",
    district: "",
    address: "",
    avatarUrl: "",
  });

  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: string }

  useEffect(() => {
    getProfile();
  }, []);

  // Clear status after 5s
  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => setStatus(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  async function getProfile() {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const fullName = user.user_metadata?.full_name || "";
        const nameParts = fullName.split(" ");

        setFormData({
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
          email: user.email || "",
          phone: user.user_metadata?.phone || "",
          nic: user.user_metadata?.nic || "",
          district: user.user_metadata?.district || "",
          address: user.user_metadata?.address || "",
          avatarUrl: user.user_metadata?.avatar_url || "",
        });
      }
    } catch (error) {
      console.error("Error loading user data:", error.message);
      setStatus({ type: 'error', message: `Interface Sync Failed: ${error.message}` });
    } finally {
      setLoading(false);
    }
  }

  const uploadAvatar = async (event) => {
    try {
      setUploading(true);
      setStatus(null);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("Missing binary source for upload.");
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });

      if (updateError) throw updateError;

      setFormData((prev) => ({ ...prev, avatarUrl: publicUrl }));
      setStatus({ type: 'success', message: 'Biometric profile photo updated.' });
    } catch (error) {
      setStatus({ type: 'error', message: `Uploader Error: ${error.message}` });
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone,
        nic: formData.nic,
        district: formData.district,
        address: formData.address,
        avatar_url: formData.avatarUrl,
      },
    });

    if (error) {
      setStatus({ type: 'error', message: `Commit Failed: ${error.message}` });
    } else {
      setStatus({ type: 'success', message: 'Identity synchronized with regional registry.' });
    }

    setLoading(false);
  };

  if (loading && !formData.email) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-white/40 font-black uppercase tracking-widest text-xs animate-pulse">Synchronizing Identity...</p>
      </div>
    );
  }

  const inputClass = "w-full px-5 py-4 rounded-2xl border border-white/10 bg-white/5 text-white placeholder:text-white/20 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/40 transition-all duration-300 font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div className="font-sans relative">
      {/* Global Status Banner */}
      {status && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 rounded-2xl border glass flex items-center gap-3 animate-in slide-in-from-top-4 duration-500 ${status.type === 'success' ? 'border-emerald-500/50 text-emerald-400' : 'border-red-500/50 text-red-400'}`}>
          <span className="material-symbols-outlined text-[18px]">
            {status.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span className="text-[11px] font-black uppercase tracking-widest">{status.message}</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Avatar Upload Section */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative group">
            <div className="w-40 h-40 rounded-full overflow-hidden glass border-4 border-white/10 flex items-center justify-center shadow-2xl relative transition-all duration-500 group-hover:scale-105 group-hover:border-emerald-500/50">
              {formData.avatarUrl ? (
                <img
                  src={formData.avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <span className="text-5xl font-black text-emerald-400 tracking-tighter uppercase drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                    {formData.firstName?.charAt(0) || 'U'}
                    {formData.lastName?.charAt(0) || 'O'}
                  </span>
                </div>
              )}
              {/* Overlay for glass effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
              {uploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                  <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                </div>
              )}
            </div>

            <label
              htmlFor="avatar-upload"
              className="absolute bottom-2 right-2 p-3 bg-emerald-500 text-white rounded-2xl shadow-xl cursor-pointer hover:bg-emerald-400 hover:scale-110 active:scale-95 transition-all duration-300 border-4 border-white/20"
            >
              <FaCamera size={20} />
            </label>

            <input
              type="file"
              id="avatar-upload"
              accept="image/*"
              onChange={uploadAvatar}
              disabled={uploading}
              className="hidden"
            />
          </div>

          {uploading && (
            <p className="text-[10px] text-emerald-400 mt-6 font-black uppercase tracking-[0.3em] animate-pulse">
              Uploading Matrix...
            </p>
          )}
        </div>

        <form onSubmit={handleUpdate} className="space-y-12">
          {/* Personal Identification Section */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <span className="h-px flex-1 bg-white/10"></span>
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/40">Personal Identification</h3>
              <span className="h-px flex-1 bg-white/10"></span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { label: "Given Name", key: "firstName", type: "text", placeholder: "SENTINEL" },
                { label: "Surname", key: "lastName", type: "text", placeholder: "OPERATOR" },
                { label: "Identification (NIC)", key: "nic", type: "text", placeholder: "XXXXXXXXXV" },
                { label: "Tactical Phone", key: "phone", type: "text", placeholder: "+94 77 XXX XXXX" },
              ].map((field) => (
                <div key={field.key} className="space-y-3">
                  <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/20 ml-2">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={formData[field.key]}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    className={inputClass}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Sector Registration Section */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <span className="h-px flex-1 bg-white/10"></span>
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/40">Sector Registration</h3>
              <span className="h-px flex-1 bg-white/10"></span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/20 ml-2">
                  Encryption Endpoint (Email)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className={inputClass}
                />
              </div>
              <div className="space-y-3">
                <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/20 ml-2">
                  District Sector
                </label>
                <input
                  type="text"
                  placeholder="COLOMBO"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="md:col-span-2 space-y-3">
                <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/20 ml-2">
                  Physical Registry Address
                </label>
                <textarea
                  rows="3"
                  placeholder="PRIMARY BASE OF OPERATIONS..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={inputClass + " resize-none min-h-[100px]"}
                ></textarea>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-10">
            <button
              type="submit"
              disabled={loading || uploading}
              className="group relative w-full md:w-80 h-16 rounded-2xl overflow-hidden transition-all active:scale-95 disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-emerald-500/20 group-hover:bg-emerald-500/30 transition-colors" />
              <div className="absolute inset-x-0 bottom-0 h-[2px] bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
              <div className="relative flex items-center justify-center gap-3 text-emerald-400 text-[11px] font-black uppercase tracking-[0.4em]">
                {loading ? (
                  <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-[20px]">
                    {status?.type === 'success' ? 'verified' : 'shield_with_heart'}
                  </span>
                )}
                {loading ? "Synchronizing..." : status?.type === 'success' ? "Synchronized" : "Synchronize Identity"}
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}