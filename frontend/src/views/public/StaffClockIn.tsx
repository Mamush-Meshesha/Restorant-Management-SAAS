import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { clockInQR } from "@/api/_attendance";

import { motion } from "framer-motion";

export const StaffClockIn = () => {
  const { branchId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"idle" | "locating" | "verifying" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!branchId || !token) {
      setStatus("error");
      setErrorMessage("Invalid QR Code");
    }
  }, [branchId, token]);

  const handleClockIn = () => {
    setStatus("locating");
    
    if (!navigator.geolocation) {
      submitClockIn(null, null); // Browser doesn't support GPS, fall back to IP-only check
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        submitClockIn(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.warn("Geolocation error", error);
        submitClockIn(null, null); // Fallback to IP-only check
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  const submitClockIn = async (lat: number | null, lng: number | null) => {
    setStatus("verifying");
    try {
      await clockInQR({
        branch_id: branchId!,
        token: token!,
        lat: lat ?? undefined,
        lng: lng ?? undefined
      });
      setStatus("success");
    } catch (error: any) {
      setStatus("error");
      setErrorMessage(error.response?.data?.message || "Verification failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl text-center"
      >
        {status === "idle" && (
          <>
            <div className="w-20 h-20 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Ready to Clock In?</h1>
            <p className="text-slate-400 text-sm mb-8">We will verify your location securely.</p>
            <button
              onClick={handleClockIn}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 rounded-xl transition-all active:scale-95"
            >
              Swipe to Clock In
            </button>
          </>
        )}

        {(status === "locating" || status === "verifying") && (
          <div className="py-8">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6" />
            <h2 className="text-xl font-semibold text-white mb-2">
              {status === "locating" ? "Acquiring GPS..." : "Verifying Security..."}
            </h2>
            <p className="text-slate-400 text-sm">Please hold your device steady.</p>
          </div>
        )}

        {status === "success" && (
          <div className="py-8">
            <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Access Granted</h2>
            <p className="text-slate-400">You are successfully clocked in.</p>
          </div>
        )}

        {status === "error" && (
          <div className="py-8">
            <div className="w-20 h-20 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-red-400">{errorMessage}</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default StaffClockIn;
