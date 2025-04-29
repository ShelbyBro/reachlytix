
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PasswordInput } from "./PasswordInput";
import { UserRole } from "@/types/auth";

export const SignupForm = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("client");
  const [isLoading, setIsLoading] = useState(false);
  
  const { signUp } = useAuth();
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName || !lastName || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    try {
      setIsLoading(true);
      await signUp(email, password, firstName, lastName, role);
    } catch (error) {
      console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form className="space-y-4" onSubmit={handleSignup}>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="firstName" className="text-sm font-medium">
            First Name
          </label>
          <Input 
            id="firstName" 
            placeholder="John" 
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="lastName" className="text-sm font-medium">
            Last Name
          </label>
          <Input 
            id="lastName" 
            placeholder="Doe" 
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="signupEmail" className="text-sm font-medium">
          Email
        </label>
        <Input 
          id="signupEmail" 
          placeholder="name@example.com" 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="newPassword" className="text-sm font-medium">
          Password
        </label>
        <PasswordInput
          id="newPassword"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="role" className="text-sm font-medium">
          Account Type
        </label>
        <Select
          value={role}
          onValueChange={(value) => setRole(value as UserRole)}
        >
          <SelectTrigger id="role">
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="client">Client</SelectItem>
            <SelectItem value="agent">Agent</SelectItem>
            <SelectItem value="iso">ISO</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">Choose your account type. Most users should select "Client".</p>
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
            Creating Account...
          </span>
        ) : (
          <>Create Account <ArrowRight size={16} className="ml-2" /></>
        )}
      </Button>
    </form>
  );
};
