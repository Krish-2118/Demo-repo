"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { FirebaseError } from "firebase/app";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/context/auth-context";

function getAuthErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/email-already-in-use":
        return "This email is already in use. If you created it with Google, sign in with Google first or link a password after login.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/invalid-login-credentials":
      case "auth/invalid-credential":
      case "auth/user-not-found":
      case "auth/wrong-password":
        return "The email or password is incorrect. If you used Google before, choose Continue with Google instead.";
      case "auth/weak-password":
        return "Password should be at least 6 characters.";
      case "auth/user-disabled":
        return "This account has been disabled.";
      case "auth/popup-closed-by-user":
        return "Google sign-in popup was closed before completion.";
      default:
        return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Authentication failed. Please try again.";
}

export function AuthForm() {
  const {
    signInWithEmail,
    sendPasswordReset,
    signUpWithEmail,
    signInWithGoogle,
    loading,
  } = useAuthContext();
  const { toast } = useToast();

  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const pending = loading || submitting;

  const onSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await signInWithEmail(signInEmail.trim(), signInPassword);
      toast({ title: "Signed in", description: "Welcome back." });
    } catch (error) {
      toast({
        title: "Sign in failed",
        description: getAuthErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const onSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await signUpWithEmail(
        signUpEmail.trim(),
        signUpPassword,
        signUpName.trim() || undefined,
      );
      toast({
        title: "Account created",
        description:
          "Your account is ready. New users are created as viewers by default.",
      });
    } catch (error) {
      toast({
        title: "Sign up failed",
        description: getAuthErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const onGoogleSignIn = async () => {
    setSubmitting(true);
    try {
      await signInWithGoogle();
      toast({ title: "Signed in with Google", description: "Welcome." });
    } catch (error) {
      toast({
        title: "Google sign in failed",
        description: getAuthErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const onForgotPassword = async () => {
    const email = signInEmail.trim();

    if (!email) {
      toast({
        title: "Enter your email first",
        description:
          "Type the email you use for this account, then request a reset link.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      await sendPasswordReset(email);
      toast({
        title: "Reset email sent",
        description:
          "Check your inbox and spam folder. The password can only be changed using the secure link in that email.",
      });
    } catch (error) {
      toast({
        title: "Could not send reset email",
        description: getAuthErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-md rounded-2xl">
      <CardHeader>
        <CardTitle>Sign in to DistrictEye</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onGoogleSignIn}
          disabled={pending}
        >
          {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Continue with Google
        </Button>

        <Tabs defaultValue="sign-in" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sign-in">Sign in</TabsTrigger>
            <TabsTrigger value="sign-up">Sign up</TabsTrigger>
          </TabsList>

          <TabsContent value="sign-in">
            <form className="space-y-3 pt-3" onSubmit={onSignIn}>
              <div className="space-y-1.5">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  value={signInEmail}
                  onChange={(event) => setSignInEmail(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  value={signInPassword}
                  onChange={(event) => setSignInPassword(event.target.value)}
                  required
                />
              </div>
              <div className="flex items-center justify-end">
                <Button
                  type="button"
                  variant="link"
                  className="h-auto px-0 text-sm"
                  onClick={onForgotPassword}
                  disabled={pending}
                >
                  Forgot password?
                </Button>
              </div>
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Sign in
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="sign-up">
            <form className="space-y-3 pt-3" onSubmit={onSignUp}>
              <div className="space-y-1.5">
                <Label htmlFor="signup-name">Full name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  value={signUpName}
                  onChange={(event) => setSignUpName(event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={signUpEmail}
                  onChange={(event) => setSignUpEmail(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={signUpPassword}
                  onChange={(event) => setSignUpPassword(event.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Create account
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
