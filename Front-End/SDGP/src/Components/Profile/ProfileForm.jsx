import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { FaCamera } from 'react-icons/fa';

export default function ProfilForm() {
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        nic: '',
        district: '',
        address: '',
        avatarUrl: ''
    });

    useEffect(() => {
        getProfile();
    }, []);

    async function getProfile() {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const fullName = user.user_metadata?.full_name || '';
                const nameParts = fullName.split(' ');
                
                setFormData({
                    firstName: nameParts[0] || '',
                    lastName: nameParts.slice(1).join(' ') || '',
                    email: user.email || '',
                    phone: user.user_metadata?.phone || '',
                    nic: user.user_metadata?.nic || '',
                    district: user.user_metadata?.district || '',
                    address: user.user_metadata?.address || '',
                    avatarUrl: user.user_metadata?.avatar_url || ''
                });
            }
        } catch (error) {
            console.error('Error loading user data:', error.message);
        } finally {
            setLoading(false);
        }
    }

    const uploadAvatar = async (event) => {
        try {
            setUploading(true);
            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }
            const { data: { user } } = await supabase.auth.getUser();
            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const filePath = `${user.id}/${Math.random()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            const publicUrl = data.publicUrl;

            const { error: updateError } = await supabase.auth.updateUser({
                data: { avatar_url: publicUrl }
            });

            if (updateError) throw updateError;
            setFormData(prev => ({ ...prev, avatarUrl: publicUrl }));
            alert('Profile photo updated successfully!');
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
                avatar_url: formData.avatarUrl 
            }
        });

        if (error) {
            alert(error.message);
        } else {
            alert('Profile updated successfully!');
        }
        setLoading(false);
    };

    if (loading && !formData.email) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-slate-50 dark:bg-slate-950 min-h-screen font-sans transition-colors duration-300">
            <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
                
                {/* Header Section */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">User Profile</h2>
                    <p className="text-slate-500 dark:text-slate-400">Update your information and how you appear to others.</p>
                </div>

                {/* Avatar Upload Section */}
                <div className="flex flex-col items-center mb-10">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full overflow-hidden bg-green-100 dark:bg-green-900/30 flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-md">
                            {formData.avatarUrl ? (
                                <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-4xl font-bold text-green-600 dark:text-green-400 uppercase">
                                    {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
                                </span>
                            )}
                        </div>
                        
                        <label 
                            htmlFor="avatar-upload" 
                            className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-200"
                        >
                            <FaCamera size={24} className="transform group-hover:scale-110 transition-transform" />
                        </label>
                        <input 
                            type="file" id="avatar-upload" accept="image/*" 
                            onChange={uploadAvatar} disabled={uploading} className="hidden" 
                        />
                    </div>
                    {uploading && <p className="text-xs text-green-600 dark:text-green-400 mt-3 font-semibold animate-pulse">Uploading Image...</p>}
                </div>

                <form onSubmit={handleUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Input Component Wrapper for easier reading */}
                        {[
                            { label: 'First Name', key: 'firstName', type: 'text', placeholder: 'Enter your first name' },
                            { label: 'Last Name', key: 'lastName', type: 'text', placeholder: 'Enter your last name' },
                            { label: 'Email Address', key: 'email', type: 'email', disabled: true },
                            { label: 'Phone Number', key: 'phone', type: 'text', placeholder: '07XXXXXXXX' },
                            { label: 'NIC Number', key: 'nic', type: 'text', placeholder: '200012345678' },
                            { label: 'District', key: 'district', type: 'text', placeholder: 'Enter your district' },
                        ].map((field) => (
                            <div key={field.key}>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                                    {field.label}
                                </label>
                                <input 
                                    type={field.type}
                                    value={formData[field.key]}
                                    disabled={field.disabled}
                                    onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
                                    placeholder={field.placeholder}
                                    className={`w-full px-4 py-3 rounded-xl border outline-none transition-all 
                                        ${field.disabled 
                                            ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-500 cursor-not-allowed' 
                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600'
                                        }`}
                                />
                            </div>
                        ))}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Address</label>
                        <textarea 
                            rows="3"
                            value={formData.address}
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                            placeholder="Enter your permanent address"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        ></textarea>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button 
                            type="submit"
                            disabled={loading || uploading}
                            className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white font-bold py-4 px-10 rounded-xl transition-all shadow-xl shadow-green-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Processing...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}