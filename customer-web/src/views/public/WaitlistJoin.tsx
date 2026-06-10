import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { joinWaitlist } from "@/api/waitlist";
import { motion } from "framer-motion";

export const WaitlistJoin = () => {
  const { branchId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", phone: "", guests: 2 });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchId) return;

    try {
      setLoading(true);
      const res = await joinWaitlist({
        branch_id: branchId,
        customer_name: formData.name,
        customer_phone: formData.phone,
        guest_count: formData.guests,
      });

      toast.success("You're on the list!");
      const waitlistId = res.data.data.id;
      localStorage.setItem("active_waitlist_id", waitlistId);
      navigate(`/waitlist/status/${waitlistId}`);
    } catch (error) {
      toast.error("Failed to join waitlist. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative">
      <Link 
        to="/" 
        className="absolute top-6 left-6 text-slate-400 hover:text-white flex items-center transition-colors font-semibold"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Return to Home
      </Link>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Join the Waitlist</h1>
          <p className="text-slate-400 text-sm">We'll text you when your table is ready.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Your Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="(555) 000-0000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Party Size</label>
            <div className="flex items-center justify-between bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, guests: Math.max(1, formData.guests - 1) })}
                className="w-10 h-10 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors flex items-center justify-center text-xl font-bold"
              >
                -
              </button>
              <span className="text-xl font-bold text-white">{formData.guests}</span>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, guests: formData.guests + 1 })}
                className="w-10 h-10 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors flex items-center justify-center text-xl font-bold"
              >
                +
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? "Joining..." : "Join Waitlist"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default WaitlistJoin;
