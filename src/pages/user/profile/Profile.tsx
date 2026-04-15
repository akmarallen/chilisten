import { Outlet } from "react-router-dom";
import ProfileSidebar from "./ProfileSidebar";

const ProfilePage = () => {
  return (
    <div className="bg-[#fdf8f3] min-h-screen">
      <section className="max-w-[1280px] mx-auto px-6 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-1">
            <ProfileSidebar />
          </div>

          <div className="md:col-span-2">
            <Outlet />
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;
