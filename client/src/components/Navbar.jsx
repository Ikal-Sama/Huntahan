import { useAuthStore } from "@/store/useAuthStore";
import {
  Bell,
  Check,
  LogOut,
  MessageSquare,
  Settings,
  User,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { ModeToggle } from "./ModeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const {
    logout,
    authUser,
    friendRequests,
    acceptFriendRequest,
    declineFriendRequest,
  } = useAuthStore();

  return (
    <header className='fixed w-full top-0 z-40 shadow-md backdrop-blur-lg bg-slate-900/70'>
      <div className='container mx-auto px-8 h-14'>
        <div className='flex items-center justify-between h-full'>
          <div className='flex items-center gap-8'>
            <Link
              to='/'
              className='flex items-center gap-2.5 hover:opacity-80 transition-all'
            >
              <div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center'>
                <MessageSquare size={23} className='text-primary' />
              </div>
              <h1 className='text-lg font-bold text-primary'>Huntahan</h1>
            </Link>
          </div>

          <div className='flex items-center gap-2'>
            <ModeToggle />

            {authUser && (
              <>
                {/* Friend Requests Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size='icon'
                      variant='none'
                      className='rounded-full cursor-pointer relative text-primary hover:shadow hover:bg-slate-700'
                    >
                      <Bell size={20} />
                      {Array.isArray(friendRequests) &&
                        friendRequests.length > 0 && (
                          <span className='absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1'>
                            {friendRequests.length}
                          </span>
                        )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className='ml-5'>
                    <DropdownMenuLabel>Friend Requests</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {Array.isArray(friendRequests) &&
                    friendRequests.length === 0 ? (
                      <DropdownMenuItem className='text-xs text-zinc-500'>
                        No new friend requests.
                      </DropdownMenuItem>
                    ) : (
                      Array.isArray(friendRequests) &&
                      friendRequests.map((request) => (
                        <DropdownMenuItem
                          key={request.senderId}
                          className='flex items-center justify-between'
                        >
                          <div className='avatar'>
                            <div className='size-7'>
                              <img
                                src={
                                  request.senderProfilePic
                                    ? request.senderProfilePic
                                    : "./avatar.png"
                                }
                                alt=''
                              />
                            </div>
                          </div>
                          <span className='text-xs'>{request.senderName}</span>

                          <div className='flex gap-2'>
                            <div
                              className='text-sm rounded-full cursor-pointer bg-primary p-1 hover:bg-yellow-500 transition-colors duration-200 ease-in-out'
                              onClick={() =>
                                acceptFriendRequest(request.senderId)
                              }
                            >
                              <Check className='text-accent-foreground' />
                            </div>
                            <div
                              className='text-sm text-white rounded-full cursor-pointer bg-slate-200 p-1 hover:bg-slate-300 transition-colors duration-200 ease-in-out'
                              onClick={() =>
                                declineFriendRequest(request.senderId)
                              }
                            >
                              <X className='text-red-500' />
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size='icon' className='rounded-full cursor-pointer'>
                      <div className='avatar'>
                        <div className='size-8'>
                          <img
                            src={
                              authUser.ProfilePic
                                ? authUser.ProfilePic
                                : "./avatar.png"
                            }
                            alt=''
                          />
                        </div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link to='/profile'>
                      <DropdownMenuItem className='cursor-pointer'>
                        <User />
                        Profile
                      </DropdownMenuItem>
                    </Link>
                    <Link to='/settings'>
                      <DropdownMenuItem className='cursor-pointer'>
                        <Settings />
                        Settings
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem
                      onClick={logout}
                      className='cursor-pointer'
                    >
                      <LogOut /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
