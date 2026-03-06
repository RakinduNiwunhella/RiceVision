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

  useEffect(() => {
    getProfile();
  }, []);

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
    } finally {
      setLoading(false);
    }
  }

  const uploadAvatar = async (event) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
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

      alert("Profile photo updated successfully!");
    } catch (error) {
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

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
      alert(error.message);
    } else {
      alert("Profile updated successfully!");
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

  const inputClass = "w-full px-5 py-4 rounded-2xl border border-white/10 bg-white/5 text-white placeholder:text-white/20 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 transition-all duration-300 font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div className="font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Avatar Upload Section */}
        <div className="flex flex-col items-center mb-16">
          <div className="relative group">
            <div className="w-40 h-40 rounded-full overflow-hidden glass border-4 border-white/10 flex items-center justify-center shadow-2xl relative transition-transform duration-500 group-hover:scale-105">
              {formData.avatarUrl ? (
                <img
                  src={formData.avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <span className="text-5xl font-black text-emerald-400 tracking-tighter uppercase">
                    {formData.firstName?.charAt(0)}
                    {formData.lastName?.charAt(0)}
                  </span>
                </div>
              )}
              {/* Overlay for glass effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
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
              Uploading Identity Matrix...
            </p>
          )}
        </div>

        <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { label: "Given Name", key: "firstName", type: "text", placeholder: "e.g. Sentinel" },
            { label: "Surname", key: "lastName", type: "text", placeholder: "e.g. Operator" },
            { label: "Encrypted Email", key: "email", type: "email", disabled: true },
            { label: "Tactical Phone", key: "phone", type: "text", placeholder: "+94 77 XXX XXXX" },
            { label: "Government NIC", key: "nic", type: "text", placeholder: "XXXXXXXXXV" },
            { label: "District Sector", key: "district", type: "text", placeholder: "e.g. Colombo" },
          ].map((field) => (
            <div key={field.key} className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">
                {field.label}
              </label>
              <input
                type={field.type}
                placeholder={field.placeholder}
                value={formData[field.key]}
                disabled={field.disabled}
                onChange={(e) =>
                  setFormData({ ...formData, [field.key]: e.target.value })
                }
                className={inputClass}
              />
            </div>
          ))}

          <div className="md:col-span-2 space-y-2">
            <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">
              Physical Registry Address
            </label>
            <textarea
              rows="4"
              placeholder="Full registry address..."
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className={inputClass + " resize-none"}
            ></textarea>
          </div>

          <div className="md:col-span-2 flex justify-end pt-10">
            <button
              type="submit"
              disabled={loading || uploading}
              className="w-full md:w-auto px-10 py-5 glass bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 text-sm font-black uppercase tracking-[0.2em] border border-emerald-500/30 rounded-2xl transition-all active:scale-95 shadow-xl shadow-emerald-500/10 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Commit Identity Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}