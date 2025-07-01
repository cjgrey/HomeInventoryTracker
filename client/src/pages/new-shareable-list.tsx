import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft, Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Location, InsertShareableList } from "@shared/schema";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  locationId: z.coerce.number().optional(),
  isPublic: z.boolean().default(true),
});

type FormData = z.infer<typeof formSchema>;

export default function NewShareableList() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: ['/api/locations'],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      isPublic: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload: InsertShareableList = {
        name: data.name,
        description: data.description || null,
        locationId: data.locationId || null,
        isPublic: data.isPublic,
        expiresAt: null,
      };
      return await apiRequest('/api/shareable-lists', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shareable-lists'] });
      toast({
        title: "List created",
        description: "Your shareable list has been created successfully.",
      });
      setLocation('/shareable-lists');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create the list. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => setLocation('/shareable-lists')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create Shareable List</h1>
          <p className="text-muted-foreground mt-1">
            Create a list that others can access via QR code
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>List Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>List Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Fridge Contents, Tool Inventory..." 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Give your list a descriptive name that others will see
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
                          placeholder="Additional details about this list..."
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Provide context about what this list contains
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="locationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Associated Location (Optional)</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">No specific location</SelectItem>
                          {locations.map((location) => (
                            <SelectItem key={location.id} value={location.id.toString()}>
                              {location.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Link this list to a specific location in your inventory
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isPublic"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Public Access
                        </FormLabel>
                        <FormDescription>
                          Allow anyone with the QR code to view this list
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex gap-3">
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending}
                    className="flex-1"
                  >
                    {createMutation.isPending ? (
                      "Creating..."
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Create List
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setLocation('/shareable-lists')}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>How it works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-medium mt-0.5">
                1
              </div>
              <div>
                <h4 className="font-medium">Create your list</h4>
                <p className="text-sm text-muted-foreground">
                  Add items from your inventory to the shareable list
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-medium mt-0.5">
                2
              </div>
              <div>
                <h4 className="font-medium">Generate QR code</h4>
                <p className="text-sm text-muted-foreground">
                  Get a unique QR code that links to your list
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-medium mt-0.5">
                3
              </div>
              <div>
                <h4 className="font-medium">Share with others</h4>
                <p className="text-sm text-muted-foreground">
                  Print and place the QR code for easy access
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}