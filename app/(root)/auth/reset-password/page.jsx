"use client";

import { Card, CardContent } from "@/components/ui/card";
import React, { useState } from "react";
import Logo from "@/public/assets/images/logo-black.png";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Buttonloading from "@/components/Application/Buttonloading";
import Link from "next/link";
import { WEBSITE_LOGIN } from "@/routes/WebsiteRoute";
import { showToast } from "@/lib/showToast";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";

const ResetPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      showToast("error", "Please enter your email");
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      
      showToast("success", "Password reset email sent! Check your inbox.");
      setIsSubmitted(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push(WEBSITE_LOGIN());
      }, 3000);
    } catch (error) {
      let errorMessage = "Failed to send reset email";
      
      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many reset requests. Try again later.";
      }
      
      showToast("error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card className="">
        <CardContent className="">
          <div className="flex justify-center">
            <Image
              src={Logo.src}
              width={Logo.width}
              height={Logo.height}
              alt="logo"
              className="max-w-[150px]"
            />
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold">Reset Password</h1>
            <p>Enter your email to receive password reset instructions</p>
          </div>

          <div className="mt-5">
            {isSubmitted ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">✓</div>
                <h2 className="text-xl font-semibold mb-2">Email Sent!</h2>
                <p className="text-gray-600 mb-4">
                  Please check your email for password reset instructions.
                </p>
                <p className="text-sm text-gray-500">
                  Redirecting to login...
                </p>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <Input
                    type="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>

                {loading ? (
                  <Buttonloading loadingText="Sending reset email..." />
                ) : (
                  <Button type="submit" className="w-full">
                    Send Reset Email
                  </Button>
                )}
              </form>
            )}

            <div className="mt-4 text-center">
              <p className="text-sm">
                Remember your password?{" "}
                <Link href={WEBSITE_LOGIN()} className="text-blue-600 hover:underline">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
