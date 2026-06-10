import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getSocket } from "@/config/socket";
import { joinTableSession, syncCart } from "@/api/session";
import { getMenuItemsApi } from "@/api/menu";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

export const TableSessionMenu = () => {
  const { token } = useParams();
  const [sessionToken, setSessionToken] = useState("");
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Note: For a fully functional Split-Bill UI, we would need to track who ordered what,
  // but for this MVP, we are just syncing a shared table cart via WebSockets.
  
  useEffect(() => {
    const initializeSession = async () => {
      if (!token) return;
      try {
        const res = await joinTableSession(token);
        setSessionToken(res.data.data.session_token);
        localStorage.setItem("active_table_session", token);
        
        const items = await getMenuItemsApi();
        setMenuItems(items);

        // Connect to table socket
        const socket = getSocket();
        socket.emit("join_table_session", { token: res.data.data.session_token });

        socket.on("cart_updated", (data: { cartItems: any[] }) => {
          setCart(data.cartItems);
        });

      } catch (error) {
        toast.error("Invalid Table QR Code");
      } finally {
        setLoading(false);
      }
    };

    initializeSession();

    return () => {
      const socket = getSocket();
      socket.off("cart_updated");
    };
  }, [token]);

  const broadcastCartUpdate = async (newCart: any[]) => {
    setCart(newCart);
    try {
      await syncCart(sessionToken, newCart);
    } catch (error) {
      console.error("Failed to sync cart");
    }
  };

  const addToCart = (item: any) => {
    const existing = cart.find(c => c.id === item.id);
    let newCart;
    if (existing) {
      newCart = cart.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
    } else {
      newCart = [...cart, { ...item, qty: 1 }];
    }
    broadcastCartUpdate(newCart);
    toast.success(`${item.name} added to table cart!`);
  };


  const cartTotal = cart.reduce((sum, item) => sum + (item.base_price * item.qty), 0);

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>;

  if (!sessionToken) return <div className="min-h-screen flex items-center justify-center">Invalid Session</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* Header */}
      <div className="bg-white sticky top-0 z-20 shadow-sm border-b border-gray-100 px-6 py-4 flex items-center">
        <Link to="/" className="mr-4 text-gray-500 hover:text-gray-900 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Table Menu</h1>
          <div className="flex items-center text-sm text-green-600 mt-1">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
            Live Collaborative Session
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="p-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map(item => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={item.id} 
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} className="w-full h-40 object-cover rounded-xl mb-4" />
              ) : (
                <div className="w-full h-40 bg-slate-100 rounded-xl mb-4 flex items-center justify-center text-slate-300">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
              )}
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                <span className="font-semibold text-blue-600">${Number(item.base_price).toFixed(2)}</span>
              </div>
              <p className="text-gray-500 text-sm mb-4 line-clamp-2">{item.description}</p>
              
              <button 
                onClick={() => addToCart(item)}
                className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                Add to Cart
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Floating Shared Cart */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 p-4 z-30 pointer-events-none"
          >
            <div className="max-w-xl mx-auto bg-gray-900 text-white rounded-2xl p-4 shadow-2xl pointer-events-auto flex flex-col sm:flex-row items-center justify-between">
              <div className="flex -space-x-2 mr-4 mb-2 sm:mb-0">
                {/* Simulated Avatars for multi-player feel */}
                <div className="w-8 h-8 rounded-full border-2 border-gray-900 bg-blue-500 flex items-center justify-center text-xs font-bold">You</div>
                <div className="w-8 h-8 rounded-full border-2 border-gray-900 bg-purple-500 flex items-center justify-center text-xs font-bold">G</div>
              </div>
              
              <div className="flex-1 flex items-center justify-between px-4 w-full">
                <div>
                  <div className="text-sm text-gray-400">Shared Cart ({cart.reduce((s,i) => s + i.qty, 0)} items)</div>
                  <div className="font-bold text-xl">${cartTotal.toFixed(2)}</div>
                </div>
                <button className="bg-white text-gray-900 font-bold px-6 py-3 rounded-xl hover:bg-gray-100 transition-transform active:scale-95 shadow-lg">
                  View & Order
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default TableSessionMenu;
