import React from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-950 p-4">
      {user && (
        <div className="flex justify-end mb-4">
          <div className="flex items-center gap-4">
            <span className="text-white">Welcome, {user.login}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      )}
      <Outlet />
    </div>
  );
}
