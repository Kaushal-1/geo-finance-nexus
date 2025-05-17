
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { CheckCircle2, Pencil } from "lucide-react";

const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address").optional(),
  company: z.string().optional(),
  role: z.string().optional(),
  bio: z.string().max(160, "Bio must not be longer than 160 characters").optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const ProfileEdit = () => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  // Default values using user data (or empty strings)
  const defaultValues: Partial<ProfileFormValues> = {
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    company: user?.company || "",
    role: user?.role || "",
    bio: user?.bio || "",
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const onSubmit = async (data: ProfileFormValues) => {
    setSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would update the profile in your database
      console.log("Profile updated:", data);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "There was a problem updating your profile.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="bg-black/20 border-white/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Pencil className="h-5 w-5 text-blue-400" />
          Profile Information
        </CardTitle>
        <CardDescription>
          Update your personal information and how you appear on the platform
        </CardDescription>
      </CardHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">First Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="John" 
                        className="bg-black/30 border-white/20 text-white"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Last Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Doe" 
                        className="bg-black/30 border-white/20 text-white"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Email Address</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="john.doe@example.com" 
                      className="bg-black/30 border-white/20 text-white"
                      disabled 
                      {...field} 
                    />
                  </FormControl>
                  <p className="text-xs text-gray-400">Your email address cannot be changed</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Company</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Your company" 
                        className="bg-black/30 border-white/20 text-white"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Role</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Your role" 
                        className="bg-black/30 border-white/20 text-white"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Bio</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us a bit about yourself..." 
                      className="bg-black/30 border-white/20 text-white resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <p className="text-xs text-gray-400">Brief description for your profile</p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          
          <CardFooter className="flex justify-end gap-4">
            <Button variant="outline" type="button" onClick={() => form.reset()}>
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="mr-2">Saving...</span>
                  <span className="animate-spin">⋯</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default ProfileEdit;
