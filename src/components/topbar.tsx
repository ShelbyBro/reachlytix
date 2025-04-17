
import { BellIcon, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";

type TopBarProps = {
  user?: {
    name: string;
    email: string;
    image?: string;
  };
};

export function TopBar({ user }: TopBarProps) {
  const { user: authUser, signOut } = useAuth();
  
  const displayName = user?.name || authUser?.user_metadata?.first_name + " " + authUser?.user_metadata?.last_name || "User";
  const displayEmail = user?.email || authUser?.email || "user@example.com";
  
  const handleLogout = async () => {
    await signOut();
  };

  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-6">
      <div className="flex-1 md:flex hidden items-center max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search..."
            className="pl-10 h-9 md:w-64 bg-muted/30"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <ThemeToggle />
        
        <Button variant="ghost" size="icon" className="rounded-full relative">
          <BellIcon className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="p-0 h-auto rounded-full">
              <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                <AvatarImage src={user?.image} alt={displayName} />
                <AvatarFallback>{displayName.substring(0, 2)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{displayName}</DropdownMenuLabel>
            <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">
              {displayEmail}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
