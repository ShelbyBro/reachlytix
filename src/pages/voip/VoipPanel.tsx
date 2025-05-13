
import { useState } from "react";
import Layout from "@/components/layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, PhoneCall, PhoneOff, Search, Play, Pause } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function VoipPanel() {
  const [searchTerm, setSearchTerm] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedScript, setSelectedScript] = useState("");
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'active' | 'ended'>('idle');
  
  const { toast } = useToast();
  
  // Fetch lead data
  const { data: leads, isLoading } = useQuery({
    queryKey: ['voip-leads'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);
          
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error("Error fetching leads for VoIP panel:", error);
        return [];
      }
    }
  });

  // Fetch scripts for the dropdown
  const { data: scripts } = useQuery({
    queryKey: ['voip-scripts'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('scripts')
          .select('*')
          .limit(20);
          
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error("Error fetching scripts:", error);
        return [];
      }
    }
  });

  // Fetch recent calls
  const { data: recentCalls } = useQuery({
    queryKey: ['recent-calls'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('call_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error("Error fetching call logs:", error);
        return [];
      }
    }
  });
  
  const filteredLeads = leads?.filter(lead => 
    lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    lead.phone?.includes(searchTerm) || 
    lead.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const initiateCall = () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number",
        variant: "destructive"
      });
      return;
    }
    
    setCallStatus('connecting');
    
    // Simulating call connection
    setTimeout(() => {
      setCallStatus('active');
      toast({
        title: "Call Connected",
        description: `Connected to ${phoneNumber}`,
      });
    }, 1500);
  };
  
  const endCall = () => {
    setCallStatus('ended');
    
    setTimeout(() => {
      setCallStatus('idle');
    }, 2000);
    
    toast({
      title: "Call Ended",
      description: "The call has been terminated",
    });
  };
  
  const formatPhoneNumber = (phone: string) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6, 10)}`;
    }
    return phone;
  };

  return (
    <Layout isAdmin>
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">VoIP Panel</h1>
          <p className="text-muted-foreground">
            Make and manage calls to leads
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-12">
          {/* Left side - Dialer */}
          <div className="md:col-span-7 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Call Center</CardTitle>
                <CardDescription>Make calls to leads or enter phone numbers directly</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      placeholder="(123) 456-7890" 
                      value={phoneNumber}
                      onChange={e => setPhoneNumber(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex-1">
                    <Label htmlFor="script-select">Script</Label>
                    <Select onValueChange={setSelectedScript} value={selectedScript}>
                      <SelectTrigger id="script-select">
                        <SelectValue placeholder="Select a script" />
                      </SelectTrigger>
                      <SelectContent>
                        {scripts?.map(script => (
                          <SelectItem key={script.id} value={script.id}>
                            {script.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  {callStatus === 'idle' || callStatus === 'ended' ? (
                    <Button 
                      className="bg-green-600 hover:bg-green-700" 
                      size="lg" 
                      onClick={initiateCall}
                    >
                      <PhoneCall className="mr-2 h-5 w-5" />
                      Start Call
                    </Button>
                  ) : (
                    <div className="space-x-4">
                      {callStatus === 'connecting' && (
                        <Button className="bg-amber-600" disabled>
                          <Phone className="mr-2 h-5 w-5 animate-pulse" />
                          Connecting...
                        </Button>
                      )}
                      
                      {callStatus === 'active' && (
                        <>
                          <Button variant="outline">
                            <Pause className="mr-2 h-5 w-5" />
                            Hold
                          </Button>
                          <Button variant="destructive" onClick={endCall}>
                            <PhoneOff className="mr-2 h-5 w-5" />
                            End Call
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
                
                {selectedScript && (
                  <div className="mt-4 border p-4 rounded-md bg-muted/30">
                    <h3 className="font-medium mb-2">Script Preview:</h3>
                    <p className="text-sm">
                      {scripts?.find(s => s.id === selectedScript)?.content || 'No script content available.'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Tabs defaultValue="leads">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="leads">Lead Directory</TabsTrigger>
                <TabsTrigger value="recent">Recent Calls</TabsTrigger>
              </TabsList>
              
              <TabsContent value="leads" className="mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search leads..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-[300px] overflow-y-auto">
                      {isLoading ? (
                        <div className="text-center py-4">Loading leads...</div>
                      ) : filteredLeads?.length === 0 ? (
                        <div className="text-center py-4 text-muted-foreground">No matching leads found</div>
                      ) : (
                        <div className="space-y-2">
                          {filteredLeads?.map(lead => (
                            <div 
                              key={lead.id} 
                              className="flex justify-between items-center p-2 rounded hover:bg-accent/50 cursor-pointer"
                              onClick={() => setPhoneNumber(lead.phone || '')}
                            >
                              <div>
                                <div className="font-medium">{lead.name || 'Unknown'}</div>
                                <div className="text-sm text-muted-foreground">{formatPhoneNumber(lead.phone || '')}</div>
                              </div>
                              <Button variant="outline" size="sm">
                                <Phone className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="recent" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Calls</CardTitle>
                    <CardDescription>History of recent calls made from this panel</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-[300px] overflow-y-auto">
                      {recentCalls?.length === 0 ? (
                        <div className="text-center py-4 text-muted-foreground">No recent calls</div>
                      ) : (
                        <div className="space-y-2">
                          {recentCalls?.map(call => (
                            <div 
                              key={call.id} 
                              className="flex justify-between items-center p-2 rounded hover:bg-accent/50"
                            >
                              <div>
                                <div className="font-medium">{formatPhoneNumber(call.number || '')}</div>
                                <div className="text-sm text-muted-foreground">
                                  {new Date(call.timestamp).toLocaleString()}
                                </div>
                              </div>
                              <Button 
                                variant={call.status === 'completed' ? 'outline' : 'default'} 
                                size="sm"
                                onClick={() => setPhoneNumber(call.number)}
                              >
                                <Phone className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Right side - Stats */}
          <div className="md:col-span-5 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Call Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold">{recentCalls?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Total Calls</div>
                  </div>
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold">
                      {recentCalls?.filter(call => call.status === 'completed').length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </div>
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold">
                      {recentCalls?.filter(call => call.status === 'missed').length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Missed</div>
                  </div>
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold">0:00</div>
                    <div className="text-sm text-muted-foreground">Avg. Duration</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>AI Call Assistance</CardTitle>
                <CardDescription>Let AI agents handle calls automatically</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Label htmlFor="agent-select">Select AI Agent</Label>
                    <Select>
                      <SelectTrigger id="agent-select">
                        <SelectValue placeholder="Select an agent" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sales">Sales Agent</SelectItem>
                        <SelectItem value="support">Support Agent</SelectItem>
                        <SelectItem value="followup">Follow-up Agent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>&nbsp;</Label>
                    <Button className="w-full">
                      <Play className="mr-2 h-4 w-4" /> Deploy Agent
                    </Button>
                  </div>
                </div>
                
                <div className="rounded-md bg-muted p-4">
                  <h3 className="font-medium mb-2">Active AI Agents</h3>
                  <div className="text-center text-sm text-muted-foreground py-2">
                    No active AI agents at the moment
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 border-t">
                <div className="text-xs text-muted-foreground">
                  AI agents automatically log call details and update lead status after completion
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
