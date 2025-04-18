
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";

const campaignSchema = z.object({
  title: z.string().min(2, "Campaign name must be at least 2 characters"),
  subject: z.string().min(2, "Subject must be at least 2 characters"),
  content: z.string().min(10, "Email content must be at least 10 characters"),
});

type CampaignFormValues = z.infer<typeof campaignSchema>;

export default function CreateCampaignPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      title: "",
      subject: "",
      content: "",
    },
  });

  async function onSubmit(data: CampaignFormValues) {
    setIsSubmitting(true);
    try {
      // Save the campaign
      const { data: newCampaign, error } = await supabase
        .from('campaigns')
        .insert({
          title: data.title,
          type: 'email',
          status: 'draft',
        })
        .select();

      if (error) {
        throw error;
      }

      // If we have a campaign ID, save the script/content
      if (newCampaign && newCampaign.length > 0) {
        const campaignId = newCampaign[0].id;
        
        // Now create the script associated with this campaign
        const { error: scriptError } = await supabase
          .from('scripts')
          .insert({
            title: data.subject,
            content: data.content,
            type: 'email',
            campaign_id: campaignId,
          });

        if (scriptError) {
          throw scriptError;
        }
      }

      toast({
        title: "Campaign created",
        description: "The campaign has been successfully created.",
      });
      
      form.reset();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error creating campaign",
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
          <h1 className="text-3xl font-bold tracking-tight">Create Email Campaign</h1>
          <p className="text-muted-foreground">
            Create a new email campaign to send to your leads
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
            <CardDescription>
              Enter your campaign information and email content below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Summer Promotion 2025" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="Don't miss our summer sale!" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter the content of your email here..." 
                          className="min-h-[200px]"
                          {...field} 
                        />
                      </FormControl>
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
                      "Create Campaign"
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
