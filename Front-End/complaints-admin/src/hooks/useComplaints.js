import { useEffect, useState } from "react";
import { fetchComplaints } from "../services/supabase/complaints";

export default function useComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints().then(({ data, error }) => {
      if (error) console.error(error);
      setComplaints(data || []);
      setLoading(false);
    });
  }, []);

  return { complaints, loading };
}
