import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getWaitlistStatus } from "@/api/waitlist";
import type { WaitlistItem } from "@/api/waitlist";
import { getSocket } from "@/config/socket";
import { motion } from "framer-motion";

export const WaitlistStatus = () => {
  const { id } = useParams();
  const waitlistId = id;
  const [status, setStatus] = useState<WaitlistItem | null>(null);
  const [position, setPosition] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    if (!waitlistId) return;
    try {
      const res = await getWaitlistStatus(waitlistId);
      setStatus(res.data.data);
      setPosition(res.data.position);
      
      if (res.data.data.status === "SEATED" || res.data.data.status === "CANCELLED" || res.data.data.status === "COMPLETED") {
        localStorage.removeItem("active_waitlist_id");
      }
    } catch (error) {
      console.error("Failed to fetch status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    
    // Connect to WebSockets for live updates
    const socket = getSocket();
    
    socket.on("waitlist_updated", () => {
      // Re-fetch status if the queue updates
      fetchStatus();
    });

    return () => {
      socket.off("waitlist_updated");
    };
  }, [waitlistId]);

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>;

  if (!status) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Entry not found</div>;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative">
      <Link 
        to="/" 
        className="absolute top-6 left-6 text-slate-400 hover:text-white flex items-center transition-colors font-semibold"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Return to Home
      </Link>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 text-center shadow-2xl"
      >
        {status.status === "WAITING" && (
          <>
            <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl font-bold text-blue-400">{position}</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">You're in line!</h2>
            <p className="text-slate-400 mb-6">There are {position ? position - 1 : 0} parties ahead of you.</p>
            
            <div className="bg-slate-900/50 rounded-xl p-4 mb-4">
              <p className="text-sm text-slate-400 uppercase tracking-wider mb-1">Estimated Wait</p>
              <p className="text-2xl font-semibold text-white">~{status.quoted_time} mins</p>
            </div>
          </>
        )}

        {status.status === "NOTIFIED" && (
          <>
            <div className="w-24 h-24 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Table Ready!</h2>
            <p className="text-slate-300">Please head to the host stand. We are seating you now.</p>
          </>
        )}

        {status.status === "SEATED" && (
          <>
            <div className="text-green-500 mb-4">Enjoy your meal!</div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default WaitlistStatus;
