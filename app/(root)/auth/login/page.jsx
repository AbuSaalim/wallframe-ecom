"use client";

import { Card, CardContent } from "@/components/ui/card";
import React, { useState } from "react";
import Logo from "@/public/assets/images/logo-black.png";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Buttonloading from "@/components/Application/Buttonloading";
import Link from "next/link";
import { WEBSITE_REGISTER, WEBSITE_RESET_PASSWORD } from "@/routes/WebsiteRoute";
import { showToast } from "@/lib/showToast";
import { useRouter } from "next/navigation";
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getUserRole } from "@/lib/roleHelpers";

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [isTypePassword, setIsTypePassword] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      showToast("error", "Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Fetch user role from MongoDB
      const userRole = await getUserRole(email);
      
      showToast("success", "Login successful!");
      
      // Redirect based on role
      const redirectPath = userRole === "admin" ? "/admin/dashboard" : "/";
      setTimeout(() => {
        router.push(redirectPath);
      }, 1500);
    } catch (error) {
      let errorMessage = "Login failed";
      
      if (error.code === "auth/user-not-found") {
        errorMessage = "User not found";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email";
      } else if (error.code === "auth/user-disabled") {
        errorMessage = "User account is disabled";
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
            <h1 className="text-3xl font-bold">Login</h1>
            <p>Sign in to your account to continue</p>
          </div>

          <div className="mt-5">
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <Input
                    type={isTypePassword ? "password" : "text"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setIsTypePassword(!isTypePassword)}
                    className="absolute right-3 top-3"
                    disabled={loading}
                  >
                    {isTypePassword ? <FaRegEyeSlash /> : <FaRegEye />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  Remember me
                </label>
                <Link href={WEBSITE_RESET_PASSWORD()} className="text-blue-600 hover:underline text-sm">
                  Forgot Password?
                </Link>
              </div>

              {loading ? (
                <Buttonloading loadingText="Signing in..." />
              ) : (
                <Button type="submit" className="w-full">
                  Sign In
                </Button>
              )}
            </form>

            <div className="mt-4 text-center">
              <p className="text-sm">
                Don't have an account?{" "}
                <Link href={WEBSITE_REGISTER()} className="text-blue-600 hover:underline">
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
