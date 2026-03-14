"use client";

import { Bell, Settings, Search, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";

export function TopNav() {
  const { user, signIn, logOut } = useAuth();

  return (
    <header className="h-16 border-b border-[#424656]/10 bg-[#0c1324]/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-30">
      <div className="flex items-center bg-[#070d1f] px-4 py-1.5 rounded-full w-96 border border-[#424656]/15">
        <Search className="w-4 h-4 text-[#8c90a2]" />
        <input
          className="bg-transparent border-none focus:ring-0 focus:outline-none text-sm w-full text-[#dce1fb] placeholder:text-[#8c90a2]/50 ml-2"
          placeholder="Search ecosystem..."
          type="text"
        />
      </div>
      <div className="flex items-center gap-4">
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#191f31] transition-colors relative">
          <Bell className="w-5 h-5 text-[#c2c6d9]" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#ffb4ab] rounded-full" />
        </button>
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#191f31] transition-colors">
          <Settings className="w-5 h-5 text-[#c2c6d9]" />
        </button>
        <div className="h-8 w-px bg-[#424656]/20 mx-2" />
        {user ? (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 ring-2 ring-[#b4c5ff]/20">
              <AvatarImage src={user.photoURL || ""} />
              <AvatarFallback className="bg-[#191f31] text-[#dce1fb] text-xs">
                {user.displayName?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="ghost"
              size="sm"
              onClick={logOut}
              className="text-[#c2c6d9] hover:text-[#dce1fb] hover:bg-[#191f31]"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Button
            onClick={signIn}
            className="bg-gradient-to-r from-[#0062ff] to-[#b4c5ff] text-white text-sm"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Sign In
          </Button>
        )}
      </div>
    </header>
  );
}
