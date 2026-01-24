import { useEffect, useState } from "react";
import { fetchComplaintById } from "../services/supabase/complaints";

export default function useComplaint(id) {
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    fetchComplaintById(id).then(({ data, error }) => {
      if (error) console.error(error);
      setComplaint(data || null);
      setLoading(false);
    });
  }, [id]);

  return { complaint, loading };
}
