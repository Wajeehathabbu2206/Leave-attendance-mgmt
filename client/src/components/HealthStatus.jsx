import { useEffect, useState } from "react";
import api from "../services/api";

export default function HealthStatus() {
  const [status, setStatus] = useState("Checking API...");

  useEffect(() => {
    api
      .get("/health")
      .then(({ data }) => setStatus(`API status: ${data.status}`))
      .catch(() => setStatus("API unavailable"));
  }, []);

  return <p className="mt-4 text-sm text-slate-500">{status}</p>;
}
