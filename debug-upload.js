// Debug script to check user profile and storage setup
// Run this in browser console on your app pages

console.log('=== UPLOAD DEBUG SCRIPT ===');

// Check if we're authenticated
async function checkAuth() {
  try {
    const response = await fetch('/api/auth/session');
    const session = await response.json();
    console.log('1. Authentication Status:', session ? 'Authenticated' : 'Not authenticated');
    return session;
  } catch (error) {
    console.log('1. Authentication Error:', error.message);
    return null;
  }
}

// Check user profile and company
async function checkProfile() {
  try {
    // This assumes you have Supabase client available
    if (typeof window !== 'undefined' && window.supabase) {
      const { data: { user } } = await window.supabase.auth.getUser();
      console.log('2. Current User:', user?.id, user?.email);
      
      if (user) {
        const { data: profile } = await window.supabase
          .from('profiles')
          .select('*, companies(*)')
          .eq('id', user.id)
          .single();
        
        console.log('3. User Profile:', profile);
        console.log('4. Company ID:', profile?.company_id);
        console.log('5. Company Details:', profile?.companies);
        
        return profile;
      }
    } else {
      console.log('2. Supabase client not available in window');
    }
  } catch (error) {
    console.log('2. Profile Error:', error.message);
  }
}

// Check storage bucket and policies
async function checkStorage() {
  try {
    if (typeof window !== 'undefined' && window.supabase) {
      // Try to list buckets
      const { data: buckets, error } = await window.supabase.storage.listBuckets();
      console.log('6. Available buckets:', buckets);
      
      if (error) {
        console.log('6. Storage Error:', error.message);
      }
      
      // Check if documents bucket exists
      const documentsBucket = buckets?.find(b => b.name === 'documents');
      console.log('7. Documents bucket exists:', !!documentsBucket);
      
      return documentsBucket;
    }
  } catch (error) {
    console.log('6. Storage Check Error:', error.message);
  }
}

// Run all checks
async function runDiagnostics() {
  console.log('\n--- Running diagnostics ---\n');
  
  await checkAuth();
  const profile = await checkProfile();
  await checkStorage();
  
  console.log('\n--- Recommendations ---');
  
  if (!profile?.company_id) {
    console.log('❌ ISSUE: User has no company_id in profile');
    console.log('👉 FIX: Go to your transporter company page and complete company setup');
  } else {
    console.log('✅ User has company_id:', profile.company_id);
  }
  
  console.log('\n📋 Next steps:');
  console.log('1. If no company_id: Complete company registration first');
  console.log('2. If storage errors: Apply storage policies in Supabase SQL Editor');
  console.log('3. If auth errors: Refresh the page or log out/in');
  console.log('4. Try upload after fixing the above');
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  runDiagnostics();
}

console.log('\nTo run manually: runDiagnostics()');