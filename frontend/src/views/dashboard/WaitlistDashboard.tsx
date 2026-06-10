import { useEffect, useState } from "react";
import { getSocket } from "@/config/socket";
import { updateWaitlistStatus, getBranchWaitlist } from "@/api/_waitlist";
import type { WaitlistItem } from "@/api/_waitlist";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { toast } from "react-toastify";
import { getBranches } from "@/api/_branches";

// In a real app we'd fetch the initial list from the backend via an API.
// For now, since we only built the GET /status/:id and not a GET /waitlist list,
// we will rely purely on socket events to populate the active queue for demonstration,
// or we can just mock it. Wait, the backend doesn't have a GET /waitlist endpoint yet!
// Let's assume we'll just listen to the socket for new joins and updates.

export const WaitlistDashboard = () => {
  const userBranchId = useSelector((state: RootState) => state.auth.currentUser?.branch_id);
  const [branchId, setBranchId] = useState<string | null>(null);
  const [queue, setQueue] = useState<WaitlistItem[]>([]);

  useEffect(() => {
    const initializeAdminBranch = async () => {
      if (userBranchId) {
        setBranchId(userBranchId);
      } else {
        try {
          // If SUPERADMIN (no specific branch), default to the first available branch
          const branchesRes = await getBranches();
          const firstBranchId = branchesRes.data?.data?.[0]?.id;
          if (firstBranchId) {
            setBranchId(firstBranchId);
          }
        } catch (error) {
          console.error("Failed to load branches");
        }
      }
    };
    initializeAdminBranch();
  }, [userBranchId]);

  useEffect(() => {
    if (!branchId) return;

    // Fetch initial queue
    getBranchWaitlist(branchId)
      .then(res => setQueue(res.data.data))
      .catch(err => console.error("Failed to load waitlist", err));
    
    const socket = getSocket();
    socket.emit("join_waitlist_queue", { branchId });

    socket.on("waitlist_updated", (data: { action: string, waitlistItem: WaitlistItem }) => {
      if (data.action === "JOIN") {
        setQueue(prev => [...prev, data.waitlistItem]);
        toast.info(`${data.waitlistItem.customer_name} joined the waitlist!`);
      } else if (data.action === "UPDATE") {
        setQueue(prev => {
          const exists = prev.some(item => item.id === data.waitlistItem.id);
          if (exists) {
            return prev.map(item => item.id === data.waitlistItem.id ? data.waitlistItem : item);
          } else {
            return [...prev, data.waitlistItem];
          }
        });
      }
    });

    return () => {
      socket.off("waitlist_updated");
    };
  }, [branchId]);

  const handleUpdateStatus = async (id: string, status: "NOTIFIED" | "SEATED" | "LEFT") => {
    try {
      await updateWaitlistStatus(id, status);
      toast.success(`Marked as ${status}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const activeQueue = queue.filter(q => q.status === "WAITING" || q.status === "NOTIFIED");

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Waitlist Management</h1>
          <p className="text-gray-500">Live queue for branch {branchId}</p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-semibold">
          {activeQueue.length} Waiting
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {activeQueue.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No customers currently waiting.
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm">
              <tr>
                <th className="py-3 px-6">Customer</th>
                <th className="py-3 px-6">Party Size</th>
                <th className="py-3 px-6">Time Waiting</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activeQueue.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-semibold text-gray-900">{item.customer_name}</div>
                    <div className="text-sm text-gray-500">{item.customer_phone}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 font-bold text-gray-700">
                      {item.guest_count}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-600">
                    {/* In a real app, calculate diff from created_at */}
                    Just now
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.status === 'NOTIFIED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    {item.status === "WAITING" && (
                      <button 
                        onClick={() => handleUpdateStatus(item.id, "NOTIFIED")}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Notify Table Ready
                      </button>
                    )}
                    {item.status === "NOTIFIED" && (
                      <button 
                        onClick={() => handleUpdateStatus(item.id, "SEATED")}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Mark Seated
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default WaitlistDashboard;
