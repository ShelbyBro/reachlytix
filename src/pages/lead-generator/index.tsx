
import { useState } from "react";
import Layout from "@/components/layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { SearchIcon, WandSparkles } from "lucide-react";

const generatorSchema = z.object({
  industry: z.string().min(1, "Industry is required"),
  country: z.string().min(1, "Country is required"),
  keywords: z.string().min(1, "Keywords are required"),
  platform: z.string().min(1, "Platform is required"),
});

type GeneratorFormValues = z.infer<typeof generatorSchema>;

export default function LeadGeneratorPage() {
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<GeneratorFormValues>({
    resolver: zodResolver(generatorSchema),
    defaultValues: {
      industry: "",
      country: "",
      keywords: "",
      platform: "",
    },
  });

  function onSubmit(data: GeneratorFormValues) {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      // In a real implementation, this would call an API or trigger lead generation
      console.log("Lead generation data:", data);
    }, 2000);
  }

  return (
    <Layout>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lead Generator</h1>
          <p className="text-muted-foreground">
            Find potential leads based on your criteria
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <WandSparkles className="h-5 w-5 mr-2" />
              Lead Generator
            </CardTitle>
            <CardDescription>
              Define your target audience and generate potential leads
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="manufacturing">Manufacturing</SelectItem>
                          <SelectItem value="real_estate">Real Estate</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="us">United States</SelectItem>
                          <SelectItem value="uk">United Kingdom</SelectItem>
                          <SelectItem value="ca">Canada</SelectItem>
                          <SelectItem value="au">Australia</SelectItem>
                          <SelectItem value="de">Germany</SelectItem>
                          <SelectItem value="fr">France</SelectItem>
                          <SelectItem value="in">India</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="keywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Keywords</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. digital marketing, software development" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="platform"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Platform</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select platform" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="linkedin">LinkedIn</SelectItem>
                          <SelectItem value="google">Google</SelectItem>
                          <SelectItem value="facebook">Facebook</SelectItem>
                          <SelectItem value="twitter">Twitter</SelectItem>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="yellowpages">Yellow Pages</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <CardFooter className="px-0 pb-0">
                  <Button 
                    type="submit" 
                    disabled={isGenerating} 
                    className="flex items-center"
                  >
                    {isGenerating ? (
                      <>
                        <span className="animate-spin mr-2">
                          <WandSparkles className="h-4 w-4" />
                        </span>
                        Generating...
                      </>
                    ) : (
                      <>
                        <SearchIcon className="h-4 w-4 mr-2" />
                        Generate Leads
                      </>
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
