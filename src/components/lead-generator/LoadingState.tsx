
import React from "react";
import { LoaderIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface LoadingStateProps {
  isLoading: boolean;
  hasKeyword: boolean;
  hasLocation: boolean;
  noResults: boolean;
}

export function LoadingState({ isLoading, hasKeyword, hasLocation, noResults }: LoadingStateProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="text-center">
          <LoaderIcon className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Searching for leads...</p>
        </div>
      </div>
    );
  }
  
  if (noResults && hasKeyword && hasLocation) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <p className="text-lg mb-2">No leads found</p>
            <p className="text-muted-foreground">Try a different keyword or location</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return null;
}
