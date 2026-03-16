"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  isConnected as checkConnection,
  getAddress,
  requestAccess,
} from "@stellar/freighter-api";

export default function WalletConnect() {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    // Check if previously connected
    const initConnection = async () => {
      const res = await checkConnection();
      if (res.isConnected) {
        try {
          const acc = await getAddress();
          if (acc.address) {
            setAddress(formatAddress(acc.address));
            setConnected(true);
          }
        } catch (e) {
          // not authorized yet
        }
      }
    };
    initConnection();
  }, []);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 5)}...${addr.slice(-4)}`;
  };

  const handleConnect = async () => {
    setLoading(true);
    try {
      const res = await checkConnection();
      if (res.isConnected) {
        const accessReq = await requestAccess();
        if (accessReq.address) {
          const acc = await getAddress();
          if (acc.address) {
            setAddress(formatAddress(acc.address));
            setConnected(true);
          }
        } else if (accessReq.error) {
          alert(`Wallet connection rejected: ${accessReq.error}`);
        }
      } else {
        alert("Freighter wallet not detected. Please install the Freighter extension.");
      }
    } catch (error) {
      console.error(error);
      alert("Error connecting wallet.");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    setConnected(false);
    setAddress(null);
  };

  return (
    <div>
      <AnimatePresence mode="wait">
        {!connected ? (
          <motion.button
            key="connect"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97, translateX: 4, translateY: 4 }}
            onClick={handleConnect}
            disabled={loading}
            className="brut-btn brut-btn-blue flex items-center gap-3 text-base disabled:opacity-70"
          >
            {loading ? (
              <>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                Connecting...
              </>
            ) : (
              <>
                <span>🔗</span>
                Connect Freighter
              </>
            )}
          </motion.button>
        ) : (
          <motion.div
            key="connected"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-3"
          >
            <div
              className="flex items-center gap-2 border-4 border-off-black bg-green px-4 py-2"
              style={{ boxShadow: "4px 4px 0px #0A0A0A" }}
            >
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2.5 h-2.5 bg-off-black rounded-full"
              />
              <span
                className="text-sm font-bold text-off-black"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                title={address ? address : ""}
              >
                {address}
              </span>
            </div>
            <button
              onClick={handleDisconnect}
              className="brut-btn brut-btn-white text-sm py-2"
            >
              Disconnect
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
