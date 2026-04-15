import { createStore } from "zustand";
import { User, userService } from "../api/users.api";

type AuthStore = {
  user?: User;
  setUser: (user?: User) => void;
  logout: () => void;
};

const authStore = createStore<AuthStore>((set) => ({
  user: undefined,
  setUser: (user) => set({ user }),
  logout: async () => {
    await userService.logout();
    set({ user: undefined });
  },
}));

export default authStore;
