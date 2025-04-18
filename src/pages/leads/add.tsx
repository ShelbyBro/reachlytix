
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const leadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(5, "Phone number must be at least 5 characters").optional().or(z.literal("")),
  source: z.string().min(1, "Please select a source"),
  campaign_id: z.string().min(1, "Please select a campaign").optional(),
});

type LeadFormValues = z.infer<typeof leadSchema>;

export default function AddLeadPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch campaigns for dropdown
  const { data: campaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, title')
        .order('title', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      source: "",
      campaign_id: "",
    },
  });

  async function onSubmit(data: LeadFormValues) {
    setIsSubmitting(true);
    try {
      // Insert the lead into the database
      const { data: newLead, error } = await supabase
        .from('leads')
        .insert({
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          source: data.source,
          // Only add the campaign_id if it's selected
          ...(data.campaign_id ? { campaign_id: data.campaign_id } : {})
        })
        .select();

      if (error) {
        throw error;
      }

      toast({
        title: "Lead created",
        description: "The lead has been successfully created.",
      });
      
      form.reset();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error creating lead",
        description: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Layout>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Lead</h1>
          <p className="text-muted-foreground">
            Create a new lead in the system
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lead Information</CardTitle>
            <CardDescription>
              Enter the lead's details below. All fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john.doe@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lead Source *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select source" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Website">Website</SelectItem>
                          <SelectItem value="Referral">Referral</SelectItem>
                          <SelectItem value="Social Media">Social Media</SelectItem>
                          <SelectItem value="Email">Email</SelectItem>
                          <SelectItem value="Event">Event</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="campaign_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select campaign (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {campaignsLoading ? (
                            <SelectItem value="loading" disabled>Loading campaigns...</SelectItem>
                          ) : campaigns?.length ? (
                            campaigns.map((campaign) => (
                              <SelectItem key={campaign.id} value={campaign.id}>
                                {campaign.title}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>No campaigns available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <CardFooter className="px-0 pb-0">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Lead"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
