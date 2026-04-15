import { useEffect } from "react";
import { useStore } from "zustand";
import authStore from "../context/auth";
import { userService } from "../api/users.api";
import { supabase } from "../lib/supabase";

export const SessionProvider = () => {
  const setUser = useStore(authStore, (state) => state.setUser);

  useEffect(() => {
    const getUser = async () => {
      const user = await userService.getCurrentUser();
      if (user) setUser(user);
    };

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (["SIGNED_IN", "USER_UPDATED", "TOKEN_REFRESHED"].includes(event)) {
        getUser();
      }
      if (event === "SIGNED_OUT") {
        setUser(undefined);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);
  return null;
};
