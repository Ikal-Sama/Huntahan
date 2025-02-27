import { useAuthStore } from "@/store/useAuthStore";
import { LogOut, MessageSquare, Settings, User } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { ModeToggle } from "./ModeToggle";

export default function Navbar() {
  const { logout, authUser } = useAuthStore();
  return (
    <header className=' fixed w-full top-0 z-40 shadow-md backdrop-blur-lg bg-slate-900/70'>
      <div className='container mx-auto px-4 h-14'>
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
            <Link
              to={"/settings"}
              className={`transition-colors flex items-center gap-2 text-slate-400`}
            >
              <Button
                variant='ghost'
                size='sm'
                className='text-slate-400 cursor-pointer'
              >
                <Settings className='w-4 h-4' />
                <span className='hidden sm:inline text-xs'>Settings</span>
              </Button>
            </Link>

            {authUser && (
              <>
                <Link to={"/profile"}>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='text-slate-400 cursor-pointer'
                  >
                    <User className='w-4 h-4' />
                    <span className='hidden sm:inline text-xs'>Profile</span>
                  </Button>
                </Link>

                <Button
                  variant='ghost'
                  size='sm'
                  className='text-slate-400 cursor-pointer'
                  onClick={logout}
                >
                  <LogOut />
                  <span className='hidden sm:inline text-xs'>Logout</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
