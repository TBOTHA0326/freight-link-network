'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { getCurrentUserCompany } from '@/database/queries/companies';
import { createClient } from '@/lib/supabaseClient';
import { AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface DiagnosticResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'loading';
  message: string;
  details?: any;
}

export default function UploadDiagnostics() {
  const { profile } = useAuth();
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    const results: DiagnosticResult[] = [];
    const supabase = createClient();

    // Check 1: Authentication
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      results.push({
        name: 'Authentication',
        status: user ? 'success' : 'error',
        message: user ? `Authenticated as ${user.email}` : 'Not authenticated',
        details: { userId: user?.id, email: user?.email }
      });
    } catch (error) {
      results.push({
        name: 'Authentication',
        status: 'error',
        message: `Auth error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }

    // Check 2: Profile & Company
    try {
      if (profile) {
        const company = await getCurrentUserCompany();
        results.push({
          name: 'Profile',
          status: 'success',
          message: `Profile found with role: ${profile.role}`,
          details: { profileId: profile.id, companyId: profile.company_id }
        });

        results.push({
          name: 'Company',
          status: company ? 'success' : 'error',
          message: company ? `Company: ${company.name}` : 'No company found for user',
          details: company
        });
      } else {
        results.push({
          name: 'Profile',
          status: 'error',
          message: 'No profile found',
        });
      }
    } catch (error) {
      results.push({
        name: 'Company Check',
        status: 'error',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }

    // Check 3: Storage Bucket
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      if (error) throw error;
      
      const documentsBucket = buckets?.find((b: any) => b.name === 'documents');
      results.push({
        name: 'Storage Bucket',
        status: documentsBucket ? 'success' : 'error',
        message: documentsBucket ? 'Documents bucket exists' : 'Documents bucket not found',
        details: { buckets: buckets?.map((b: any) => b.name) }
      });
    } catch (error) {
      results.push({
        name: 'Storage Bucket',
        status: 'error',
        message: `Storage error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }

    // Check 4: Upload Permissions (if we have a company)
    if (profile?.company_id) {
      try {
        const { data, error } = await supabase.rpc('check_upload_permissions', {
          company_folder: profile.company_id
        });
        
        if (error) throw error;
        
        const result = data?.[0];
        results.push({
          name: 'Upload Permissions',
          status: result?.can_upload ? 'success' : 'error',
          message: result?.can_upload ? 'Can upload to company folder' : 'Cannot upload - permission denied',
          details: result
        });
      } catch (error) {
        results.push({
          name: 'Upload Permissions',
          status: 'warning',
          message: 'Could not check permissions (function may not exist)',
        });
      }
    }

    setDiagnostics(results);
    setLoading(false);
  };

  useEffect(() => {
    if (profile) {
      runDiagnostics();
    }
  }, [profile]);

  const getIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'loading': return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
    }
  };

  const getStatusClass = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'loading': return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Upload Diagnostics</h2>
        <button
          onClick={runDiagnostics}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="space-y-3">
        {diagnostics.map((result, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border ${getStatusClass(result.status)}`}
          >
            <div className="flex items-center gap-3">
              {getIcon(result.status)}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{result.name}</p>
                <p className="text-sm text-gray-600">{result.message}</p>
                {result.details && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-500 cursor-pointer">Details</summary>
                    <pre className="mt-1 text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {diagnostics.length === 0 && loading && (
        <div className="text-center py-4 text-gray-500">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
          Running diagnostics...
        </div>
      )}

      {diagnostics.some(d => d.status === 'error') && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-medium text-red-900 mb-2">Issues Found:</h3>
          <ul className="text-sm text-red-700 space-y-1">
            <li>• <strong>No Company:</strong> Complete company registration first</li>
            <li>• <strong>Storage Bucket:</strong> Create "documents" bucket in Supabase Dashboard</li>
            <li>• <strong>Permissions:</strong> Apply storage policies in Supabase SQL Editor</li>
            <li>• <strong>Auth Errors:</strong> Try logging out and back in</li>
          </ul>
        </div>
      )}
    </div>
  );
}