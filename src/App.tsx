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
import type {
  LoginPageProps,
  Message,
  OrderModel,
  ProductModel,
  UserModel,
} from "./probs";
import ReactMarkdown from "react-markdown";

const url = "/api";
// const url = "http://165.227.232.26:5000/app";

const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${url}/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Login failed");
      }

      const data = await res.json();
      onLogin(data.payload);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl mb-6">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-black mb-2">ZionMart</h1>
          <p className="text-gray-600">Shop with AI assistance</p>
        </div>

        <div className="bg-white border border-gray-300 rounded-2xl p-8 shadow-sm space-y-4">
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10"
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
        {/* Dummy email section */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p className="mb-2">Try one of these demo accounts:</p>
          <div className="space-y-1">
            <p className="font-medium text-gray-700">gayers@example.net</p>
            <p className="font-medium text-gray-700">harryolson@example.org</p>
            <p className="font-medium text-gray-700">jessica59@example.org</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Shop Page
interface ShopPageProps {
  user: UserModel;
  onLogout: () => void;
}

const ShopPage = ({ user }: ShopPageProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content:
        "Hello! I'm your ZionMart shopping assistant. How can I help you today?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"products" | "orders">("products");
  const [products, setProducts] = useState<ProductModel[]>([]);
  const [orders, setOrders] = useState<OrderModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch products and orders
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const [productsRes, ordersRes] = await Promise.all([
          fetch(`${url}/products`),
          fetch(`${url}/orders/${user.id}`),
        ]);

        if (!productsRes.ok || !ordersRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const productsData = await productsRes.json();
        const ordersData = await ordersRes.json();

        setProducts(productsData.payload);
        setOrders(ordersData.payload);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.id]);

  // Scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending messages
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "human",
      content: input,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch(`${url}/prompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input, user_id: user.id }),
      });

      if (!res.ok) throw new Error("Failed to get AI response");

      const data = await res.json();
      console.log(data);
      
      const aiMessage: Message = {
        role: "ai",
        content: data.payload.at(-1)["content"].trim(),
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      const ordersRes = await fetch(`${url}/orders/${user.id}`);
      const ordersData = await ordersRes.json();
      setOrders(ordersData.payload);
    } catch (err: any) {
      const errorMessage: Message = {
        role: "ai",
        content: `Sorry, I encountered an error: ${err.message}`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-black">ZionMart</h1>
                <p className="text-sm text-gray-600">Shop Smart, Shop Easy</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 w-64"
                />
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <ShoppingCart className="w-6 h-6 text-gray-700" />
              </button>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl">
                <User className="w-5 h-5 text-gray-700" />
                <span className="text-sm font-medium text-gray-700">
                  {user.name || user.email.split("@")[0]}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 px-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("products")}
              className={`py-4 font-semibold border-b-2 transition-colors ${
                activeTab === "products"
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Products
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`py-4 font-semibold border-b-2 transition-colors ${
                activeTab === "orders"
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              My Orders
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-6 px-12">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400">Loading...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
              {error}
            </div>
          ) : activeTab === "products" ? (
            <div>
              <h2 className="text-2xl font-bold text-black mb-6">
                Featured Products
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer"
                  >
                    {/* <div className="text-6xl mb-4 text-center">🎒</div> */}
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {product.description}
                    </span>
                    <h3 className="font-bold text-black mt-2 mb-3">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-black">
                        ${product.price.toFixed(2)}
                      </span>
                      <button className="px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors text-sm font-semibold">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold text-black mb-6">
                Order History
              </h2>
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                    <p className="text-gray-400">No orders yet</p>
                  </div>
                ) : (
                  orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="font-bold text-black text-lg">
                            {order.id}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`px-4 py-2 rounded-xl text-sm font-bold ${
                            order.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : order.status === "pending"
                              ? "bg-blue-100 text-blue-800"
                              : "text-yellow-100 bg-yellow-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <span className="text-gray-600">
                          {order.quantity} items
                        </span>
                        <span className="text-2xl font-bold text-black">
                          ${order.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Sidebar */}
      <div
        className={`${
          chatOpen ? "w-96" : "w-0"
        } transition-all duration-300 bg-white border-l border-gray-200 flex flex-col overflow-hidden`}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-black">AI Assistant</h3>
              <p className="text-xs text-gray-500">Online</p>
            </div>
          </div>
          <button
            onClick={() => setChatOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.role === "human" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === "human"
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <div className="text-sm whitespace-pre-wrap leading-relaxed">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-200 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask me anything..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10"
            disabled={isTyping}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="px-4 py-3 bg-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Floating Chat Button */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-black text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-gray-800 transition-all"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

// App Component
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserModel | null>(null);

  const handleLogin = (userData: UserModel) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  if (!isAuthenticated || !user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <ShopPage user={user} onLogout={handleLogout} />;
};

export default App;
