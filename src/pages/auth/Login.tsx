
import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background to-secondary/30">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Reachlytix</h1>
          <p className="text-muted-foreground">Amplify Your Reach, Analyze Your Success</p>
        </div>
        
        <Card className="shadow-lg border-primary/10">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">Sign in to your account to continue</CardDescription>
          </CardHeader>
          
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4 mx-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Signup</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <Input id="email" placeholder="name@example.com" type="email" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="password" className="text-sm font-medium">
                        Password
                      </label>
                      <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4">
                <Button className="w-full" size="lg">
                  Sign In <ArrowRight size={16} className="ml-2" />
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  Don't have an account?{" "}
                  <Link to="#" className="text-primary hover:underline" onClick={() => document.querySelector('[data-value="signup"]')?.dispatchEvent(new MouseEvent('click'))}>
                    Sign up
                  </Link>
                </p>
              </CardFooter>
            </TabsContent>
            
            <TabsContent value="signup">
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="firstName" className="text-sm font-medium">
                        First Name
                      </label>
                      <Input id="firstName" placeholder="John" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="lastName" className="text-sm font-medium">
                        Last Name
                      </label>
                      <Input id="lastName" placeholder="Doe" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <Input id="email" placeholder="name@example.com" type="email" />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="newPassword" className="text-sm font-medium">
                      Password
                    </label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4">
                <Button className="w-full" size="lg">
                  Create Account <ArrowRight size={16} className="ml-2" />
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  Already have an account?{" "}
                  <Link to="#" className="text-primary hover:underline" onClick={() => document.querySelector('[data-value="login"]')?.dispatchEvent(new MouseEvent('click'))}>
                    Sign in
                  </Link>
                </p>
              </CardFooter>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
