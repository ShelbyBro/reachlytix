
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoaderIcon, Save, Search } from "lucide-react";
import { Lead } from "@/hooks/use-smart-scrape";

interface LeadGeneratorFormProps {
  keyword: string;
  setKeyword: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  limit: number;
  setLimit: (value: number) => void;
  isLoading: boolean;
  leads: Lead[];
  isSavingAll: boolean;
  onGenerateLeads: (e: React.FormEvent) => void;
  onSaveAllLeads: () => void;
}

export function LeadGeneratorForm({
  keyword,
  setKeyword,
  location,
  setLocation,
  limit,
  setLimit,
  isLoading,
  leads,
  isSavingAll,
  onGenerateLeads,
  onSaveAllLeads
}: LeadGeneratorFormProps) {
  return (
    <form onSubmit={onGenerateLeads} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="keyword">Keyword/Industry</Label>
          <Input 
            id="keyword" 
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="e.g., Real Estate, Marketing, Software"
            disabled={isLoading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input 
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., New York, Chicago, San Francisco"
            disabled={isLoading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="limit">Number of Leads</Label>
          <Input 
            id="limit"
            type="number"
            min={1}
            max={20}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            disabled={isLoading}
          />
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button 
          type="submit" 
          className="gap-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <LoaderIcon className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              Generate Leads
            </>
          )}
        </Button>
        
        {leads.length > 0 && (
          <Button
            type="button"
            variant="outline" 
            className="gap-2"
            onClick={onSaveAllLeads}
            disabled={isLoading || isSavingAll || leads.length === 0}
          >
            {isSavingAll ? (
              <>
                <LoaderIcon className="h-4 w-4 animate-spin" />
                Saving All...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save All Leads
              </>
            )}
          </Button>
        )}
      </div>
    </form>
  );
}
