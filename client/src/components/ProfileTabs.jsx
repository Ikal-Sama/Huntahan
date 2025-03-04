import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMediaStore } from "@/store/useMediaStore";
import { Library, Loader2, PlusCircle, User } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import MediaItem from "@/components/MediaItem"; // Import the reusable component

export default function ProfileTabs({ authUser }) {
  const { userLoggedInMedia, fetchUserContent, isLoading } = useMediaStore();

  // Fetch user content on component mount
  useEffect(() => {
    fetchUserContent();
  }, [fetchUserContent]);

  console.log("MEDIA FILES IN TABS", userLoggedInMedia);

  return (
    <div className='space-y-6'>
      <div className='text-center text-accent-foreground'>
        <h1 className='text-2xl font-bold'>{authUser?.fullName}</h1>
        <p className='text-sm font-light text-accent-foreground'>
          {authUser?.email}
        </p>
      </div>
      <Tabs defaultValue='account' className='w-full'>
        <TabsList className='w-full'>
          <TabsTrigger
            value='account'
            className='cursor-pointer hover:bg-accent-foreground transition-colors duration-300 ease-in-out'
          >
            <Library />
          </TabsTrigger>
          <TabsTrigger
            value='password'
            className='cursor-pointer hover:bg-accent-foreground transition-colors duration-300 ease-in-out'
          >
            <User />
          </TabsTrigger>
        </TabsList>

        <TabsContent value='password'>
          <div className='space-y-5  py-5'>
            <h1 className=' text-lg text-slate-400 font-semibold'>
              Account Information
            </h1>
            <div className='flex justify-between items-center text-gray-400 border-b border-slate-500 pb-2'>
              <p>Member Since</p>
              <span className=''>{authUser.createdAt?.split("T")[0]}</span>
            </div>

            <div className='flex justify-between items-center text-gray-400 '>
              <p>Account Status</p>
              <span className='text-green-400'>Active</span>
            </div>
          </div>
        </TabsContent>
        <TabsContent value='account'>
          <div className=' flex justify-center py-5 '>
            <Link
              to='/upload'
              className='hover:text-primary transition-colors duration-300 ease-initial cursor-pointer'
            >
              <PlusCircle size={30} />
            </Link>
          </div>
          <div>
            {isLoading ? (
              <>
                <div className='flex justify-center py-3'>
                  <Loader2 className='animate-spin' />
                </div>
              </>
            ) : (
              <div>
                {userLoggedInMedia.length > 0 ? (
                  <div className='flex flex-wrap gap-4 overflow-y-auto h-[300px] scrollbar-custom'>
                    {userLoggedInMedia.map((item) => {
                      const firstImage = item.files.find(
                        (file) => file.type === "image"
                      );
                      const firstVideo = item.files.find(
                        (file) => file.type === "video"
                      );

                      return (
                        <div key={item._id} className='border rounded-lg'>
                          <div className='mt-4'>
                            {firstImage && <MediaItem file={firstImage} />}
                            {firstVideo && <MediaItem file={firstVideo} />}
                            {!firstImage && !firstVideo && (
                              <p>No image or video found.</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className='flex flex-col gap-3 justify-center items-center'>
                    <img
                      src='./no-found.png'
                      alt='no-found-content'
                      className='w-20 h-20'
                    />
                    <p className='text-accent-foreground font-medium'>
                      Oops..! no media content yet.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
