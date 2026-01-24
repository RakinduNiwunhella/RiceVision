import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

export default function Profile() {
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        nic: '',
        district: '',
        address: ''
    });

    useEffect(() => {
        getProfile();
    }, []);

    async function getProfile() {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // Extracting name from metadata we saved during signup
                const fullName = user.user_metadata?.full_name || '';
                const nameParts = fullName.split(' ');
                
                setFormData({
                    firstName: nameParts[0] || '',
                    lastName: nameParts.slice(1).join(' ') || '',
                    email: user.email || '',
                    phone: user.user_metadata?.phone || '',
                    nic: user.user_metadata?.nic || '',
                    district: user.user_metadata?.district || '',
                    address: user.user_metadata?.address || ''
                });
            }
        } catch (error) {
            console.error('Error loading user data:', error.message);
        } finally {
            setLoading(false);
        }
    }

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.auth.updateUser({
            data: { 
                full_name: `${formData.firstName} ${formData.lastName}`,
                phone: formData.phone,
                nic: formData.nic,
                district: formData.district,
                address: formData.address
            }
        });

        if (error) {
            alert(error.message);
        } else {
            alert('Profile updated successfully!');
        }
        setLoading(false);
    };

    if (loading && !formData.email) return <div className="p-10 text-center">Loading Profile...</div>;

    return (
        <div className="p-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
            <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">User Profile</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8">Update your profile details below.</p>

                {/* Avatar Section */}
                <div className="flex items-center mb-8">
                    <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-3xl font-bold text-green-600 border-4 border-white dark:border-slate-800 shadow-sm">
                        {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
                    </div>
                </div>

                <form onSubmit={handleUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* First Name */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">First Name</label>
                            <input 
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-green-500 outline-none"
                            />
                        </div>

                        {/* Last Name */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Last Name</label>
                            <input 
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-green-500 outline-none"
                            />
                        </div>

                        {/* Email - Read Only usually */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
                            <input 
                                type="email"
                                disabled
                                value={formData.email}
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-500 cursor-not-allowed"
                            />
                        </div>

                        {/* Phone Number */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
                            <input 
                                type="text"
                                placeholder="07XXXXXXXX"
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-green-500 outline-none"
                            />
                        </div>

                        {/* NIC */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">NIC Number</label>
                            <input 
                                type="text"
                                value={formData.nic}
                                onChange={(e) => setFormData({...formData, nic: e.target.value})}
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-green-500 outline-none"
                            />
                        </div>

                        {/* District */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">District</label>
                            <input 
                                type="text"
                                value={formData.district}
                                onChange={(e) => setFormData({...formData, district: e.target.value})}
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-green-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Address</label>
                        <textarea 
                            rows="3"
                            value={formData.address}
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-green-500 outline-none"
                        ></textarea>
                    </div>

                    <div className="flex justify-end mt-4">
                        <button 
                            type="submit"
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-green-500/20 active:scale-95 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}