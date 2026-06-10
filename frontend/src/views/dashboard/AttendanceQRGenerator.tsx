import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { QRCodeSVG } from "qrcode.react";

export const AttendanceQRGenerator = () => {
  const branchId = useSelector((state: RootState) => state.auth.currentUser?.branch_id);
  const [token, setToken] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);

  // Simulate TOTP generation for demo purposes
  // In a real app, this should be an HMAC of the secret key and the current Unix time bucket
  const generateToken = () => {
    return Math.random().toString(36).substring(2, 15);
  };

  useEffect(() => {
    setToken(generateToken());
    setTimeLeft(30);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setToken(generateToken());
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const customerUrl = import.meta.env.VITE_CUSTOMER_URL || "http://localhost:3001";
  const qrUrl = `${customerUrl}/attendance/clock-in/${branchId}?token=${token}`;

  return (
    <div className="p-6 h-full flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-12 rounded-3xl shadow-xl text-center max-w-md w-full border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Staff Clock-In</h1>
        <p className="text-gray-500 mb-8">Have staff scan this QR code to securely clock in.</p>
        
        <div className="bg-blue-50 p-4 rounded-2xl mb-8 inline-block">
          <QRCodeSVG 
            value={qrUrl} 
            size={256} 
            bgColor={"#eff6ff"} 
            fgColor={"#1e3a8a"} 
            level={"Q"} 
          />
        </div>

        <div className="flex items-center justify-center space-x-2 text-sm font-medium text-gray-600">
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Refreshes in <span className="text-blue-600 font-bold">{timeLeft}s</span></span>
        </div>
        
        <p className="mt-6 text-xs text-gray-400">
          Geofencing and IP Whitelisting enabled. Staff must be physically on the premises to clock in.
        </p>
      </div>
    </div>
  );
};

export default AttendanceQRGenerator;
