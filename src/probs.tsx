export interface UserModel {
  id: string;
  name: string;
  email: string;
}

export interface ProductModel {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export interface Message {
  role: "human" | "ai";
  content: string;
  timestamp: string;
}


export interface OrderModel {
  id: string;
  created_at: Date;
  total: number;
  status: "pending" | "completed" | "cancelled";
  quantity: number;
}

// Login Page
export interface LoginPageProps {
  onLogin: (user: UserModel) => void;
} 