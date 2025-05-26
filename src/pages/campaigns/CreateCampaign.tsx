import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Calendar, Send, Mail, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Form schema
const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  description: z.string().optional(),
  type: z.string({ required_error: "Please select a campaign type." }),
  scheduledAt: z.date().optional(),
});

export default function CreateCampaign() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  // Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "email",
    },
  });
  
  // Watch current campaign type
  const watchType = form.watch("type");
  const isEmailType = watchType === "email";

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from('campaigns')
        .insert({
          title: values.title,
          description: values.description,
          type: values.type,
          client_id: userData.user.id,
          scheduled_at: values.scheduledAt ? values.scheduledAt.toISOString() : null, // Convert Date to ISO string
          schedule_status: values.scheduledAt ? 'scheduled' : 'draft',
          status: 'pending',
        });
        
      if (error) throw error;
      
      toast.success("Campaign created successfully");
      navigate("/campaigns");
      
    } catch (error: any) {
      console.error("Error creating campaign:", error);
      toast.error("Failed to create campaign: " + (error.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Create Campaign</h1>
          <p className="text-muted-foreground">
            Set up a new marketing or outreach campaign
          </p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
                <CardDescription>Basic information about your campaign</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter campaign title" {...field} />
                      </FormControl>
                      <FormDescription>
                        A clear name to identify this campaign
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter campaign description" 
                          className="resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Add more details about the purpose of this campaign
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campaign Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a campaign type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="email">
                              <div className="flex items-center">
                                <Mail className="mr-2 h-4 w-4" />
                                <span>Email Campaign</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="sms">
                              <div className="flex items-center">
                                <MessageSquare className="mr-2 h-4 w-4" />
                                <span>SMS Campaign</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="ai-voice">
                              <div className="flex items-center">
                                <Send className="mr-2 h-4 w-4" />
                                <span>AI Voice Campaign</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="scheduledAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Schedule (Optional)</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <DatePicker
                              date={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                            />
                            {field.value && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => field.onChange(undefined)}
                              >
                                Clear
                              </Button>
                            )}
                          </div>
                        </FormControl>
                        <FormDescription>
                          When to automatically send this campaign
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Only render Tabs for non-email types! Email campaigns do NOT get tabs/segment/audience. */}
            {!isEmailType && (
              <Tabs defaultValue="content" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="content">Campaign Content</TabsTrigger>
                  <TabsTrigger value="audience">Audience</TabsTrigger>
                </TabsList>
                <TabsContent value="content">
                  <Card>
                    <CardHeader>
                      <CardTitle>Campaign Content</CardTitle>
                      <CardDescription>Create your message content</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {form.watch("type") === "email" && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <FormLabel>Email Subject</FormLabel>
                            <Input placeholder="Enter email subject line" />
                          </div>
                          <div className="space-y-2">
                            <FormLabel>Email Body</FormLabel>
                            <Textarea 
                              placeholder="Enter email content" 
                              className="min-h-[200px]" 
                            />
                            <FormDescription>
                              Use the rich text editor to format your message
                            </FormDescription>
                          </div>
                        </div>
                      )}
                      
                      {form.watch("type") === "sms" && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <FormLabel>SMS Message</FormLabel>
                            <Textarea 
                              placeholder="Enter SMS content (160 characters max)" 
                              className="min-h-[100px]" 
                              maxLength={160}
                            />
                            <FormDescription>
                              Keep your message concise and include a clear call to action
                            </FormDescription>
                          </div>
                        </div>
                      )}
                      
                      {form.watch("type") === "ai-voice" && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <FormLabel>Voice Script</FormLabel>
                            <Textarea 
                              placeholder="Enter the script for the AI voice agent to use" 
                              className="min-h-[200px]" 
                            />
                            <FormDescription>
                              Write a conversational script that sounds natural when spoken
                            </FormDescription>
                          </div>
                          <div className="space-y-2">
                            <FormLabel>Voice Type</FormLabel>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a voice type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="male-professional">Male - Professional</SelectItem>
                                <SelectItem value="female-professional">Female - Professional</SelectItem>
                                <SelectItem value="male-friendly">Male - Friendly</SelectItem>
                                <SelectItem value="female-friendly">Female - Friendly</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="audience">
                  <Card>
                    <CardHeader>
                      <CardTitle>Target Audience</CardTitle>
                      <CardDescription>Select who will receive this campaign</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <FormLabel>Audience Type</FormLabel>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select audience type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all-leads">All Leads</SelectItem>
                            <SelectItem value="filtered">Filtered Leads</SelectItem>
                            <SelectItem value="segment">Saved Segment</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="border rounded-md p-4 bg-muted/30">
                        <p className="text-sm text-muted-foreground">
                          Estimated audience size: <strong>0 recipients</strong>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Select filters or segments to update the estimated audience size
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}

            {/* For EMAIL show only CSV upload + info */}
            {isEmailType && (
              <Card>
                <CardHeader>
                  <CardTitle>Recipients</CardTitle>
                  <CardDescription>
                    Upload your recipient list for this campaign (CSV required).
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="block font-semibold">Upload Recipients (CSV)</label>
                    {/* Use same upload style as CreateCampaignForm */}
                    <input
                      type="file"
                      accept=".csv"
                      className="mt-2"
                      // CSV upload logic should be implemented/reused
                      // Disabled for email demo! Replace with actual uploader if/when needed.
                      disabled
                    />
                    <div className="text-sm text-muted-foreground">
                      Upload a CSV file with columns: name, email, phone.
                      Only these uploaded leads will receive this campaign.
                    </div>
                  </div>
                  <div className="px-3 py-2 border border-dashed rounded bg-muted/20 text-muted-foreground">
                    {/* Placeholder for uploaded leads. Replace with working list if integrating. */}
                    No leads uploaded yet.
                  </div>
                  <div className="text-xs text-muted-foreground pt-2">
                    <b>Note:</b> Audience/segment selection is NOT supported for Email campaigns. You must upload a CSV.
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => navigate("/campaigns")}>
                Cancel
              </Button>
              <div className="space-x-2">
                <Button type="submit" variant="outline" onClick={() => form.setValue("scheduledAt", undefined)}>
                  Save as Draft
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : form.watch("scheduledAt") ? (
                    <>
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule Campaign
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Create Campaign
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </Layout>
  );
}

// WARNING: Never add "audience", "segment", "All Leads", "Filtered Leads", or segment selectors for EMAIL campaign type!
// Email must ONLY support CSV uploads and uploaded lead listing.
