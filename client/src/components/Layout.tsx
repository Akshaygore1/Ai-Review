import { Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function Layout() {
  const { user, logout } = useAuth();
  console.log("user", user);

  return (
    <div className="min-h-screen bg-gray-950 p-4">
      {user && (
        <div className="flex justify-end mb-4">
          <div className="flex items-center gap-4">
            <div className="text-white bg-black">
              Welcome,
              <span className="ml-2 p-2 bg-white rounded-full text-black">
                {user.name}
              </span>
            </div>
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
