import { supabase } from "./client";

// Fetch all complaints
export const fetchComplaints = async () => {
  return supabase
    .from("complains")
    .select("*")
    .order("created_at", { ascending: false });
};

// Fetch single complaint by ID
export const fetchComplaintById = async (id) => {
  return supabase.from("complains").select("*").eq("id", id).single();
};

// Update status of a complaint
export const updateComplaintStatus = async (id, status) => {
  const { data, error } = await supabase
    .from("complains")
    .update({ status })
    .eq("id", id)
    .select();
  return { data, error };
};
