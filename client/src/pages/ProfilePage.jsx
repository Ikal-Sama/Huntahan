import ProfileTabs from "@/components/ProfileTabs";
import { useAuthStore } from "@/store/useAuthStore";
import { Camera, Mail, User } from "lucide-react";
import React, { useState } from "react";

export default function ProfilePage() {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };
  return (
    <div className='h-full pt-20'>
      <div className='max-w-xl mx-auto py-8'>
        <div className=' rounded-xl p-6 space-y-5'>
          <div className='text-center text-accent-foreground'>
            <h1 className='text-2xl font-semibold'>Profile</h1>
            <p className='mt-2'>Your profile information</p>
          </div>

          {/* avatar upload section */}
          <div className='flex flex-col items-center gap-4'>
            <div className='relative'>
              <img
                src={selectedImg || authUser.profilePic || "/avatar.png"}
                className='size-32 rounded-full object-cover border-4 border-foreground'
              />
              <label
                htmlFor='avatar-upload'
                className={`bg-background
                absolute bottom-0 right-0 hover:scale-105 p-2
                rounded-full cursor-pointer transition-all duration-200
                ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                `}
              >
                <Camera className='w-5 h-5 text-primary' />
                <input
                  type='file'
                  id='avatar-upload'
                  className='hidden'
                  accept='image/*'
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className='text-sm text-zinc-400'>
              {isUpdatingProfile
                ? "Uploading..."
                : "Click the camera icon to update your photo"}
            </p>
          </div>

          {/* User Tabs */}
          <div>
            <ProfileTabs authUser={authUser} />
          </div>
        </div>
      </div>
    </div>
  );
}
