
import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
import { useAuth } from "@/contexts/AuthContext";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function Login() {
  const { user, authError } = useAuth();
  
  // Display auth error if present
  const [showAuthError, setShowAuthError] = useState(false);
  
  useEffect(() => {
    if (authError) {
      setShowAuthError(true);
    }
  }, [authError]);
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background to-secondary/30">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/">
            <h1 className="text-3xl font-bold gradient-text mb-2">Reachlytix</h1>
            <p className="text-muted-foreground">Amplify Your Reach, Analyze Your Success</p>
          </Link>
        </div>
        
        {showAuthError && authError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Error</AlertTitle>
            <AlertDescription>
              {authError}
            </AlertDescription>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-2" 
              onClick={() => setShowAuthError(false)}
            >
              Dismiss
            </Button>
          </Alert>
        )}
        
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
                <LoginForm />
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4">
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
                <SignupForm />
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4">
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
