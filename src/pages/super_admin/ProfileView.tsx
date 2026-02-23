
import React, { useState } from 'react';
import { SectionHeader } from '../../components/super_admin/UI.tsx';
import { FormInput } from '../../components/super_admin/FormFields.tsx';
import { User, Shield, Key, Bell, Globe, Camera } from 'lucide-react';

export const ProfileView = () => {
  const [name, setName] = useState('Sarah Connor');
  const [email, setEmail] = useState('sarah.admin@company.com');

  return (
    <div className="space-y-6 max-w-4xl">
      <SectionHeader title="Profile Settings" description="Update your administrative identity and security preferences." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#0b1220] border border-[#1f2937] rounded-2xl p-6 text-center">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 rounded-2xl border-2 border-[#1f2937] bg-slate-800 overflow-hidden mx-auto">
                <img src="https://picsum.photos/seed/admin/200" alt="Admin" className="w-full h-full object-cover" />
              </div>
              <button title="Change avatar" className="absolute -bottom-2 -right-2 p-2 bg-[#f37321] text-white rounded-lg shadow-lg hover:bg-[#e06410] transition-all">
                <Camera size={14} />
              </button>
            </div>
            <h3 className="font-bold text-lg text-[#e6eef8]">{name}</h3>
            <p className="text-xs text-[#9aa8bd] font-medium uppercase tracking-widest">Super Admin</p>
            <div className="mt-4 pt-4 border-t border-[#1f2937] flex items-center justify-center gap-2">
              <Shield size={14} className="text-emerald-500" />
              <span className="text-xs font-bold text-emerald-500 uppercase">Tier 1 Access</span>
            </div>
          </div>

          <div className="bg-[#0b1220] border border-[#1f2937] rounded-2xl p-4 space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#f37321]/10 text-[#f37321] font-bold text-sm">
              <User size={18} /> Personal Info
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#9aa8bd] hover:bg-[#0f172a] hover:text-[#e6eef8] transition-all font-medium text-sm">
              <Key size={18} /> Password & Security
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#9aa8bd] hover:bg-[#0f172a] hover:text-[#e6eef8] transition-all font-medium text-sm">
              <Bell size={18} /> Notification Settings
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#9aa8bd] hover:bg-[#0f172a] hover:text-[#e6eef8] transition-all font-medium text-sm">
              <Globe size={18} /> Localization
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0b1220] border border-[#1f2937] rounded-2xl p-6 sm:p-8">
            <h4 className="font-bold text-[#e6eef8] mb-6 flex items-center gap-2">
              <User size={18} className="text-[#f37321]" /> Account Details
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <FormInput label="Full Name" value={name} onChange={setName} />
              <FormInput label="Email Address" value={email} onChange={setEmail} />
              <FormInput label="Phone Number" value="+1 (555) 012-3456" onChange={() => { }} />
              <FormInput label="Job Title" value="Senior Operations Admin" onChange={() => { }} />
            </div>

            <div className="mt-4 p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl mb-6">
              <p className="text-xs text-amber-500 leading-relaxed font-medium">
                Changing your administrative email will require a 2FA verification from the primary security contact.
              </p>
            </div>

            <div className="flex justify-end">
              <button className="px-8 py-3 bg-[#f37321] text-white rounded-xl font-bold shadow-lg shadow-[#f37321]/20 hover:bg-[#e06410] transition-all">
                Update Profile
              </button>
            </div>
          </div>

          <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-6">
            <h4 className="font-bold text-rose-500 mb-2">Danger Zone</h4>
            <p className="text-xs text-[#9aa8bd] mb-4">Deleting your administrator account is permanent and will revoke all access instantly.</p>
            <button className="px-6 py-2 border border-rose-500/30 text-rose-500 rounded-lg text-xs font-bold hover:bg-rose-500/10 transition-all">
              Request Account Deletion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
