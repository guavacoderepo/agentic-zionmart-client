import { useState, useEffect, useRef } from "react";
import {
  Send,
  User,
  ShoppingCart,
  Search,
  MessageSquare,
  X,
  ShoppingBag,
} from "lucide-react";

interface LoginPageProps {
  onLogin: (email: string) => void;
}

interface ShopPageProps {
  userEmail: string;
  onLogout: () => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
}

interface Order {
  id: string;
  date: string;
  total: number;
  status: "Delivered" | "Pending" | "Shipped";
  items: number;
}

// Login Page Component
const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      onLogin(email);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl mb-6">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-black mb-2">ZionMart</h1>
          <p className="text-gray-600">Shop with AI assistance</p>
        </div>

        <div className="bg-white border border-gray-300 rounded-2xl p-8 shadow-sm">
          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all duration-200"
                disabled={loading}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-black text-white font-semibold py-3 rounded-xl hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Continue Shopping"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
