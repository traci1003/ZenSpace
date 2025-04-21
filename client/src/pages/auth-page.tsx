import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, Loader2 } from "lucide-react";

// Collection of mindfulness quotes for the auth page
const MINDFULNESS_QUOTES = [
  "The present moment is the only time over which we have dominion.",
  "You are the sky. Everything else is just the weather.",
  "Be where you are, not where you think you should be.",
  "The quieter you become, the more you can hear.",
  "Peace comes from within. Do not seek it without.",
  "Mindfulness isn't difficult. We just need to remember to do it.",
  "The best way to capture moments is to pay attention.",
  "Breathe in peace, breathe out tension.",
  "Life is available only in the present moment.",
  "Be happy in the moment, that's enough.",
];

// Function to get a random mindfulness quote
function getRandomQuote(): string {
  const randomIndex = Math.floor(Math.random() * MINDFULNESS_QUOTES.length);
  return MINDFULNESS_QUOTES[randomIndex];
}

// Simple meditation illustration SVG
function MeditationIllustration() {
  return (
    <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
      {/* Background circle */}
      <circle cx="100" cy="100" r="80" fill="currentColor" fillOpacity="0.1" />
      
      {/* Person silhouette */}
      <path 
        d="M100 60 C90 70 80 90 80 110 C80 130 90 145 100 145 C110 145 120 130 120 110 C120 90 110 70 100 60Z" 
        fill="currentColor" 
        fillOpacity="0.6"
      />
      
      {/* Head */}
      <circle cx="100" cy="60" r="15" fill="currentColor" fillOpacity="0.6" />
      
      {/* Legs/lotus position */}
      <path 
        d="M65 130 C70 125 80 125 100 130 C120 125 130 125 135 130 C130 140 120 145 100 140 C80 145 70 140 65 130Z" 
        fill="currentColor" 
        fillOpacity="0.6"
      />
    </svg>
  );
}

// Validation schemas
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password cannot be longer than 100 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [location, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  
  // Redirect if already logged in
  if (user) {
    navigate("/");
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-primary/5 dark:from-dark-900 dark:to-primary/20">
      {/* Form column */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md bg-white dark:bg-dark-800 p-8 rounded-xl shadow-sm">
          <div className="text-center mb-8">
            <span className="text-4xl mb-4 block">🧘</span>
            <h1 className="text-3xl font-bold text-primary-600 dark:text-primary-400">Welcome to ZenSpace</h1>
            <p className="text-muted-foreground mt-2">
              Your personal journaling and mood tracking sanctuary
            </p>
          </div>

          <Tabs 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as "login" | "register")}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="login">Log In</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <LoginForm />
            </TabsContent>
            <TabsContent value="register">
              <RegisterForm />
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p className="italic">"{getRandomQuote()}"</p>
          </div>
        </div>
      </div>

      {/* Hero column */}
      <div className="hidden md:flex flex-1 bg-gradient-to-br from-primary/10 to-primary/20 dark:from-primary/30 dark:to-primary/10 items-center justify-center p-8">
        <div className="max-w-lg text-center">
          <h2 className="text-4xl font-bold mb-4">Find Your Inner Peace</h2>
          <p className="text-xl mb-6">
            Track your moods, journal your thoughts, and discover patterns in your emotional well-being with ZenSpace.
          </p>
          <div className="grid grid-cols-3 gap-4 mt-10">
            <FeatureCard 
              title="Mood Tracking" 
              description="Record and visualize your emotional journey"
            />
            <FeatureCard 
              title="Journaling" 
              description="Document your thoughts and feelings"
            />
            <FeatureCard 
              title="Insights" 
              description="Discover patterns in your emotional well-being"
            />
          </div>
          <div className="mt-10 opacity-80">
            <MeditationIllustration />
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginForm() {
  const { loginMutation } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  function onSubmit(values: LoginFormValues) {
    loginMutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter your username" 
                  className="rounded-lg" 
                  {...field} 
                />
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
              <FormLabel>Password</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Enter your password" 
                    className="rounded-lg pr-10" 
                    {...field} 
                  />
                </FormControl>
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center space-x-2 mt-2">
          <input
            type="checkbox"
            id="remember-me"
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <label htmlFor="remember-me" className="text-sm text-muted-foreground">
            Remember me for 30 days
          </label>
        </div>
        <Button 
          type="submit" 
          className="w-full mt-6 rounded-lg" 
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging in...
            </>
          ) : (
            "Log In"
          )}
        </Button>
      </form>
    </Form>
  );
}

function RegisterForm() {
  const { registerMutation } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(values: RegisterFormValues) {
    // Omit confirmPassword from values sent to the server
    const { confirmPassword, ...registerData } = values;
    registerMutation.mutate(registerData);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Choose a username" 
                  className="rounded-lg" 
                  {...field} 
                />
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
              <FormLabel>Password</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Create a password" 
                    className="rounded-lg pr-10" 
                    {...field} 
                  />
                </FormControl>
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input 
                    type={showConfirmPassword ? "text" : "password"} 
                    placeholder="Confirm your password" 
                    className="rounded-lg pr-10" 
                    {...field} 
                  />
                </FormControl>
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button 
          type="submit" 
          className="w-full mt-6 rounded-lg" 
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>
    </Form>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-background p-4 rounded-lg shadow-sm">
      <h3 className="font-medium text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}