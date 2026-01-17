'use client';

import { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Globe,
  Bell,
  Shield,
  Database,
  Save,
  Lock,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';

const SETTINGS_PASSWORD = 'Qwasqwas!0326!';

export default function AdminSettingsPage() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  
  const [settings, setSettings] = useState({
    siteName: 'Freight Link Network',
    supportEmail: 'support@f-ln.co.za',
    autoApproveLoads: false,
    autoApproveDocuments: false,
    emailNotifications: true,
    maintenanceMode: false,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === SETTINGS_PASSWORD) {
      setIsUnlocked(true);
      setPasswordError('');
    } else {
      setPasswordError('Incorrect password');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate saving
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // Password gate
  if (!isUnlocked) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-[#06082C]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-[#06082C]" />
            </div>
            <h1 className="text-xl font-bold text-[#06082C]">Settings Protected</h1>
            <p className="text-gray-600 mt-1">Enter the admin password to access settings</p>
          </div>

          {passwordError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{passwordError}</p>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit}>
            <div className="relative mb-4">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C]"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <button
              type="submit"
              className="w-full px-4 py-3 bg-[#06082C] text-white rounded-lg font-medium hover:bg-[#0a0e40] transition-colors"
            >
              Unlock Settings
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#06082C] flex items-center gap-3">
          <SettingsIcon className="w-7 h-7" />
          Platform Settings
        </h1>
        <p className="text-gray-600 mt-1">
          Configure platform-wide settings and preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-[#06082C] flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5" />
            General Settings
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Site Name
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Support Email
              </label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C]"
              />
            </div>
          </div>
        </div>

        {/* Approval Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-[#06082C] flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5" />
            Approval Settings
          </h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoApproveLoads}
                onChange={(e) => setSettings({ ...settings, autoApproveLoads: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-[#06082C] focus:ring-[#06082C]"
              />
              <div>
                <span className="font-medium text-gray-900">Auto-approve loads</span>
                <p className="text-sm text-gray-500">Automatically approve new load postings without manual review</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoApproveDocuments}
                onChange={(e) => setSettings({ ...settings, autoApproveDocuments: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-[#06082C] focus:ring-[#06082C]"
              />
              <div>
                <span className="font-medium text-gray-900">Auto-approve documents</span>
                <p className="text-sm text-gray-500">Automatically approve uploaded documents without manual review</p>
              </div>
            </label>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-[#06082C] flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5" />
            Notifications
          </h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-[#06082C] focus:ring-[#06082C]"
              />
              <div>
                <span className="font-medium text-gray-900">Email notifications</span>
                <p className="text-sm text-gray-500">Send email notifications for important platform events</p>
              </div>
            </label>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-[#06082C] flex items-center gap-2 mb-4">
            <Database className="w-5 h-5" />
            System
          </h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-[#06082C] focus:ring-[#06082C]"
              />
              <div>
                <span className="font-medium text-gray-900">Maintenance mode</span>
                <p className="text-sm text-gray-500">Put the platform in maintenance mode (only admins can access)</p>
              </div>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#06082C] text-white rounded-lg font-medium hover:bg-[#0a0e40] transition-colors disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          {saved && (
            <span className="text-green-600 font-medium">Settings saved successfully!</span>
          )}
        </div>
      </div>
    </div>
  );
}
