import { supabase } from "@/lib/supabaseClient";
import type { Profile, DashboardStats } from "@/database/types";

export async function getPendingRegistrations(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("registration_status", "pending_admin_approval")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Profile[];
}

export async function getSetupSubmissions(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("registration_status", "pending_final_approval")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Profile[];
}

export async function approveRegistration(userId: string): Promise<void> {
  await supabase.rpc("approve_registration", { user_id: userId });
}

export async function rejectRegistration(userId: string, reason: string): Promise<void> {
  await supabase.rpc("reject_registration", { user_id: userId, reason });
}

export async function activateUser(userId: string): Promise<void> {
  await supabase.rpc("activate_user", { user_id: userId });
}

export async function getAllUsers(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Profile[];
}

export async function getAdminDashboardStats(): Promise<DashboardStats> {
  const { data, error } = await supabase.rpc("get_admin_dashboard_stats");
  if (error) throw error;
  return data as DashboardStats;
}
