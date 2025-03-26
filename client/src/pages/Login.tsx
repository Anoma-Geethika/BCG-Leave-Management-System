import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

import schoolLogo from "../assets/school-logo.svg";

// Create a form schema for login
const formSchema = z.object({
  username: z.string().min(3, {
    message: "පරිශීලක නාමය අවම වශයෙන් අක්ෂර 3ක් විය යුතුය.",
  }),
  password: z.string().min(6, {
    message: "මුරපදය අවම වශයෙන් අක්ෂර 6ක් විය යුතුය.",
  }),
});

// For TypeScript type definition
type FormValues = z.infer<typeof formSchema>;

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // For demo purposes, let's use a simple check
      if (data.username === "admin" && data.password === "password") {
        toast({
          title: "සාර්ථකව පිවිසුණා",
          description: "ඔබ පද්ධතියට සාර්ථකව පිවිස ඇත.",
          variant: "default",
        });

        // Redirect to dashboard
        setLocation("/dashboard");
      } else {
        toast({
          title: "පිවිසීම අසාර්ථකයි",
          description: "වලංගු නොවන පරිශීලක නාමය හෝ මුරපදය.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-indigo-100 to-purple-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-6">
            <img 
              src={schoolLogo} 
              alt="School Logo" 
              className="h-32 w-auto"
            />
          </div>
          <CardTitle className="text-2xl text-center font-bold">පාසල් නිවාඩු කළමනාකරණ පද්ධතිය</CardTitle>
          <CardDescription className="text-center">
            පද්ධතියට පිවිසීමට ඔබගේ විස්තර ඇතුළත් කරන්න
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>පරිශීලක නාමය</FormLabel>
                    <FormControl>
                      <Input placeholder="admin" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>මුරපදය</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    පිවිසෙමින්...
                  </div>
                ) : (
                  "පිවිසෙන්න"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-muted-foreground text-center">
            <p>පරිශීලක නාමය: admin</p>
            <p>මුරපදය: password</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}