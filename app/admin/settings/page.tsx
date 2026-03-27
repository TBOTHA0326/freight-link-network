"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Settings, Mail, Globe, Shield, CheckCircle2, Lock, Eye, EyeOff,
  AlertCircle, Plus, Trash2, ChevronUp, ChevronDown, Pencil, X,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";
import {
  getPaymentStatuses, createPaymentStatus, updatePaymentStatus,
  deletePaymentStatus, getPaymentRecordCountForStatus, swapPaymentStatusOrder,
} from "@/database/queries/payment_statuses";
import {
  getFinanceCategories, createFinanceCategory, deleteFinanceCategory, swapFinanceCategoryOrder,
  type FinanceCategory,
} from "@/database/queries/finance_categories";
import type { PaymentStatus } from "@/database/types";

const SETTINGS_PASSWORD = "Qwasqwas!@#$%^&*()";

export default function AdminSettingsPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [saved, setSaved] = useState(false);

  // Finance Categories state
  const [categories, setCategories] = useState<FinanceCategory[]>([]);
  const [catError, setCatError] = useState<string | null>(null);
  const [newCatLabel, setNewCatLabel] = useState("");

  // Payment Statuses state
  const [statuses, setStatuses] = useState<PaymentStatus[]>([]);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [newColor, setNewColor] = useState("#6366f1");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editColor, setEditColor] = useState("");

  const COLOR_PALETTE = [
    { label: "Indigo",  value: "#6366f1" },
    { label: "Blue",    value: "#3b82f6" },
    { label: "Sky",     value: "#0ea5e9" },
    { label: "Teal",    value: "#14b8a6" },
    { label: "Emerald", value: "#10b981" },
    { label: "Amber",   value: "#f59e0b" },
    { label: "Orange",  value: "#f97316" },
    { label: "Red",     value: "#ef4444" },
    { label: "Rose",    value: "#f43f5e" },
    { label: "Purple",  value: "#a855f7" },
    { label: "Gray",    value: "#6b7280" },
    { label: "Slate",   value: "#475569" },
  ];

  const fetchStatuses = useCallback(async () => {
    try { setStatuses(await getPaymentStatuses()); }
    catch { setStatusError("Failed to load statuses."); }
  }, []);

  const fetchCategories = useCallback(async () => {
    try { setCategories(await getFinanceCategories()); }
    catch { setCatError("Failed to load categories."); }
  }, []);

  useEffect(() => {
    if (unlocked) {
      fetchStatuses();
      fetchCategories();
    }
  }, [unlocked, fetchStatuses, fetchCategories]);

  const handleAddStatus = async () => {
    if (!newLabel.trim()) return;
    try {
      const created = await createPaymentStatus(newLabel.trim(), newColor);
      setStatuses((prev) => [...prev, created]);
      setNewLabel(""); setNewColor("#6366f1");
    } catch { setStatusError("Failed to add status."); }
  };

  const handleStartEdit = (s: PaymentStatus) => {
    setEditingId(s.id); setEditLabel(s.label); setEditColor(s.color);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editLabel.trim()) return;
    try {
      await updatePaymentStatus(editingId, { label: editLabel.trim(), color: editColor });
      setStatuses((prev) => prev.map((s) => s.id === editingId ? { ...s, label: editLabel.trim(), color: editColor } : s));
      setEditingId(null);
    } catch { setStatusError("Failed to update status."); }
  };

  const handleDeleteStatus = async (id: string) => {
    try {
      const count = await getPaymentRecordCountForStatus(id);
      if (count > 0) {
        setStatusError(`Cannot delete — ${count} record${count !== 1 ? "s" : ""} still use this status. Reassign them first.`);
        return;
      }
      await deletePaymentStatus(id);
      setStatuses((prev) => prev.filter((s) => s.id !== id));
    } catch { setStatusError("Failed to delete status."); }
  };

  const handleReorder = async (id: string, direction: "up" | "down") => {
    try {
      await swapPaymentStatusOrder(id, direction, statuses);
      await fetchStatuses();
    } catch { setStatusError("Failed to reorder."); }
  };

  const handleAddCategory = async () => {
    if (!newCatLabel.trim()) return;
    try {
      const created = await createFinanceCategory(newCatLabel.trim());
      setCategories((prev) => [...prev, created]);
      setNewCatLabel("");
    } catch { setCatError("Failed to add category."); }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteFinanceCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch { setCatError("Failed to delete category."); }
  };

  const handleReorderCategory = async (id: string, direction: "up" | "down") => {
    try {
      await swapFinanceCategoryOrder(id, direction, categories);
      await fetchCategories();
    } catch { setCatError("Failed to reorder."); }
  };

  const handleUnlock = () => {
    if (passwordInput === SETTINGS_PASSWORD) {
      setUnlocked(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
      setPasswordInput("");
    }
  };

  if (!unlocked) {
    return (
      <div className="space-y-6">
        <PageHeader title="Settings" subtitle="Platform configuration" icon={Settings} />
        <div className="max-w-sm mx-auto mt-16">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 text-center">
            <div className="w-14 h-14 bg-[#06082C]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock size={24} className="text-[#06082C]" />
            </div>
            <h2 className="text-base font-semibold text-gray-900 mb-1">Settings Protected</h2>
            <p className="text-sm text-gray-500 mb-6">Enter the settings password to continue.</p>
            {passwordError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg mb-4 text-left">
                <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
                <p className="text-xs text-red-700">Incorrect password. Try again.</p>
              </div>
            )}
            <div className="relative mb-4">
              <input
                type={showPassword ? "text" : "password"}
                value={passwordInput}
                onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false); }}
                onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                placeholder="Enter password..."
                className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#06082C]"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <button
              onClick={handleUnlock}
              className="w-full bg-[#06082C] hover:bg-[#0a0e40] text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
            >
              Unlock Settings
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Platform configuration" icon={Settings} />

      <SectionCard title="Platform Information" subtitle="General platform details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Platform Name</label>
            <input
              type="text"
              defaultValue="Freight Link Network"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#06082C]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Support Email</label>
            <input
              type="email"
              defaultValue="onboarding@f-ln.co.za"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#06082C]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Default Country</label>
            <input
              type="text"
              defaultValue="South Africa"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#06082C]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Currency</label>
            <input
              type="text"
              defaultValue="ZAR (R)"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#06082C]"
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Email Notifications" subtitle="Configure which notifications are sent">
        <div className="space-y-3">
          {[
            { label: "Account Activated", desc: "Notify user when their account is activated by admin" },
            { label: "Registration Rejected", desc: "Notify user when their registration is rejected" },
            { label: "Load Approved", desc: "Notify supplier when their load is approved" },
            { label: "Load Rejected", desc: "Notify supplier when their load is rejected" },
            { label: "Setup Rejected", desc: "Notify user when their company setup is rejected" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
              <div>
                <p className="text-sm font-medium text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#06082C]"></div>
              </label>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="System Information" subtitle="Read-only platform details">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Globe size={16} className="text-gray-400" />
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Framework</p>
            </div>
            <p className="text-sm font-medium text-gray-900">Next.js 16.2.1</p>
            <p className="text-xs text-gray-500">App Router, TypeScript</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={16} className="text-gray-400" />
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Backend</p>
            </div>
            <p className="text-sm font-medium text-gray-900">Supabase</p>
            <p className="text-xs text-gray-500">PostgreSQL + Auth + Storage</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Mail size={16} className="text-gray-400" />
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</p>
            </div>
            <p className="text-sm font-medium text-gray-900">Custom SMTP</p>
            <p className="text-xs text-gray-500">Edge Function + Nodemailer</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Payment Statuses" subtitle="Configure the dropdown options for the Finance ledger">
        {statusError && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg mb-4">
            <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-700 flex-1">{statusError}</p>
            <button onClick={() => setStatusError(null)} className="text-red-400 hover:text-red-600"><X size={12} /></button>
          </div>
        )}
        <div className="space-y-2 mb-4">
          {statuses.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
              {editingId === s.id ? (
                <>
                  <input
                    type="text"
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#06082C]"
                    autoFocus
                  />
                  <div className="flex gap-1 flex-shrink-0">
                    {COLOR_PALETTE.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setEditColor(c.value)}
                        title={c.label}
                        className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${editColor === c.value ? "border-gray-800 scale-110" : "border-transparent"}`}
                        style={{ backgroundColor: c.value }}
                      />
                    ))}
                  </div>
                  <button onClick={handleSaveEdit} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><CheckCircle2 size={14} /></button>
                  <button onClick={() => setEditingId(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"><X size={14} /></button>
                </>
              ) : (
                <>
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="flex-1 text-sm font-medium text-gray-800">{s.label}</span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => handleReorder(s.id, "up")} disabled={i === 0} className="p-1 text-gray-300 hover:text-gray-600 disabled:opacity-30 transition-colors"><ChevronUp size={13} /></button>
                    <button onClick={() => handleReorder(s.id, "down")} disabled={i === statuses.length - 1} className="p-1 text-gray-300 hover:text-gray-600 disabled:opacity-30 transition-colors"><ChevronDown size={13} /></button>
                    <button onClick={() => handleStartEdit(s)} className="p-1.5 text-gray-400 hover:text-[#06082C] hover:bg-gray-100 rounded-lg transition-colors"><Pencil size={13} /></button>
                    <button onClick={() => handleDeleteStatus(s.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={13} /></button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Add new status */}
        <div className="flex items-center gap-3 p-3 border border-dashed border-gray-200 rounded-xl">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddStatus()}
            placeholder="New status label…"
            className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#06082C]"
          />
          <div className="flex gap-1 flex-shrink-0">
            {COLOR_PALETTE.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setNewColor(c.value)}
                title={c.label}
                className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${newColor === c.value ? "border-gray-800 scale-110" : "border-transparent"}`}
                style={{ backgroundColor: c.value }}
              />
            ))}
          </div>
          <button
            onClick={handleAddStatus}
            disabled={!newLabel.trim()}
            className="p-1.5 bg-[#06082C] text-white rounded-lg hover:bg-[#0a0e40] transition-colors disabled:opacity-50"
          >
            <Plus size={14} />
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Finance Categories" subtitle="Configure the category dropdown options for the Finance ledger">
        {catError && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg mb-4">
            <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-xs text-red-700 flex-1">{catError}</p>
            <button onClick={() => setCatError(null)} className="text-red-400 hover:text-red-600"><X size={12} /></button>
          </div>
        )}
        <div className="space-y-2 mb-4">
          {categories.map((cat, i) => (
            <div key={cat.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
              <span className="flex-1 text-sm font-medium text-gray-800">{cat.label}</span>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => handleReorderCategory(cat.id, "up")} disabled={i === 0} className="p-1 text-gray-300 hover:text-gray-600 disabled:opacity-30 transition-colors"><ChevronUp size={13} /></button>
                <button onClick={() => handleReorderCategory(cat.id, "down")} disabled={i === categories.length - 1} className="p-1 text-gray-300 hover:text-gray-600 disabled:opacity-30 transition-colors"><ChevronDown size={13} /></button>
                <button onClick={() => handleDeleteCategory(cat.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 p-3 border border-dashed border-gray-200 rounded-xl">
          <input
            type="text"
            value={newCatLabel}
            onChange={(e) => setNewCatLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
            placeholder="New category label…"
            className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
          />
          <button
            onClick={handleAddCategory}
            disabled={!newCatLabel.trim()}
            className="p-1.5 bg-[#06082C] text-white rounded-lg hover:bg-[#0a0e40] transition-colors disabled:opacity-50"
          >
            <Plus size={14} />
          </button>
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 bg-[#06082C] hover:bg-[#0a0e40] text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
        >
          {saved ? <><CheckCircle2 size={15} />Saved!</> : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
