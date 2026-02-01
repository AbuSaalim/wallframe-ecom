import AppSidebar from "@/components/Application/Admin/AppSidebar";
import ThemeProvider from "@/components/Application/Admin/ThemeProvider";
import Topbar from "@/components/Application/Admin/Topbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import React from "react";

const layout = ({ children }) => {
  return (
    <ThemeProvider
      attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
    >
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <main className="w-full md:flex-1 flex flex-col">
        <Topbar/>
        <div className="px-4 sm:px-6 md:px-8 pt-[60px] md:pt-[70px] min-h-[calc(100vh-110px)] pb-10 flex-1">
          {children}
        </div>
        <div className="border-t h-[40px] flex justify-center items-center bg-gray-50 dark:bg-background text-sm">@ 2025 Developer Abu Saalim. All Right Reserved.</div>
      </main>
    </SidebarProvider>
    </ThemeProvider>

  );
};

export default layout;
