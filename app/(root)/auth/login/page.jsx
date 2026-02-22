"use client";

import { Card, CardContent } from "@/components/ui/card";
import React, { useState } from "react";
import Logo from "@/public/assets/images/logo-black.png";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Buttonloading from "@/components/Application/Buttonloading";
import { showToast } from "@/lib/showToast";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signInWithPopup, GoogleAuthProvider, getIdToken } from "firebase/auth";
import { getUserRoleFromAPI } from "@/lib/clientRoleHelpers";
import axios from "axios";
import { useDispatch } from "react-redux";
import { login } from "@/store/reducer/authReducer";

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  // Function to set auth cookie and dispatch to Redux
  const handleAuthSuccess = async (user, userRole) => {
    try {
      // Get Firebase ID token
      const idToken = await getIdToken(user);
      
      // Set auth cookie for middleware
      await axios.post("/api/auth/set-cookie", {
        idToken,
        email: user.email,
        role: userRole
      });

      // Dispatch user data to Redux
      dispatch(login({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
        role: userRole,
        name: user.displayName || user.email.split("@")[0]
      }));
    } catch (error) {
      console.error("Error setting auth cookie:", error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      // Create or sync user in MongoDB
      await axios.post("/api/user/create", {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
      }).catch(err => {
        // User might already exist, that's fine
        console.log("User sync:", err.message);
      });

      // Fetch user role
      const userRole = await getUserRoleFromAPI(userCredential.user.email);
      
      // Set auth cookie and dispatch to Redux
      await handleAuthSuccess(userCredential.user, userRole);
      
      showToast("success", "Login successful!");
      
      // Redirect based on role
      const redirectPath = userRole === "admin" ? "/admin/dashboard" : "/";
      setTimeout(() => {
        router.push(redirectPath);
      }, 1500);
    } catch (error) {
      console.error("Google sign-in error:", error);
      showToast("error", "Google sign-in failed");
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
            {loading ? (
              <Buttonloading loadingText="Signing in..." />
            ) : (
              <Button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
