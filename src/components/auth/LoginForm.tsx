
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { PasswordInput } from "./PasswordInput";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn } = useAuth();
  const navigate = useNavigate();
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }
    
    try {
      setIsLoading(true);
      await signIn(email, password);
      navigate('/dashboard');
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form className="space-y-4" onSubmit={handleLogin}>
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input 
          id="email" 
          placeholder="name@example.com" 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <Link to="/auth/forgot-password" className="text-xs text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
        <PasswordInput
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
    
      <Button 
        className="w-full mt-2" 
        size="lg" 
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center">
            <span className="h-4 w-4 mr-2 rounded-full border-2 border-b-transparent border-white animate-spin"></span>
            Signing In...
          </span>
        ) : (
          <>Sign In <ArrowRight size={16} className="ml-2" /></>
        )}
      </Button>
    </form>
  );
};
