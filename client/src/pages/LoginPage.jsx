import AuthImagePattern from "@/components/AuthImagePattern";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Eye,
  EyeClosed,
  Loader,
  Lock,
  Mail,
  MessageSquare,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { login, isLoggingIn } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    login(formData);
  };
  return (
    <div className='min-h-screen grid lg:grid-cols-2 mt-10 w-full'>
      {/* left side */}
      <div className='flex flex-col justify-center items-center p-6 sm:p-12'>
        <div className='w-full max-w-md space-y-8'>
          {/* LOGO */}
          <div className='flex flex-col items-center gap-2 group'>
            <div className='bg-primary/10 rounded-xl size-12 flex justify-center items-center group-hover:bg-primary/20 transition-colors'>
              <img src='./logo.png' alt='Logo' className='size-12' />
            </div>
            <h1 className='text-foreground text-2xl font-bold'>Welcome Back</h1>
            <p className='text-muted-foreground text-md'>
              Sign in to your account
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className='space-y-6 mt-6 w-[230px] md:w-[300px] lg:w-[340px]'
        >
          <div className='flex flex-col gap-2'>
            <label className=''>
              <span className='font-normal text-md text-foreground'>Email</span>
            </label>
            <div className='flex relative border border-muted-foreground items-center rounded-md'>
              <div className='px-1'>
                <Mail size={20} className='text-gray-500 stroke-[1px]' />
              </div>
              <Input
                type='email'
                placeholder='john@gmail.com'
                value={formData.email}
                className='border-none ring-0 focus:ring-0 focus-visible:ring-0 placeholder:text-gray-500'
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          </div>

          <div className='flex flex-col gap-2'>
            <label className=''>
              <span className='font-normal text-md text-foreground'>
                Password
              </span>
            </label>
            <div className='flex relative border border-muted-foreground items-center rounded-md'>
              <div className='px-1'>
                <Lock size={20} className='text-gray-500 stroke-[1px]' />
              </div>
              <Input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                className='border-none ring-0 focus:ring-0 focus-visible:ring-0'
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />

              <button
                type='button'
                className='pr-2 cursor-pointer transition-all duration-300 ease-in-out text-gray-500 group'
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeClosed size={20} className='group-hover:text-gray-900' />
                ) : (
                  <Eye size={20} className='group-hover:text-gray-900' />
                )}
              </button>
            </div>
          </div>

          <Button
            type='submit'
            disabled={isLoggingIn}
            className='w-full cursor-pointer'
          >
            {isLoggingIn ? (
              <>
                <Loader size={10} className='animate-spin' />
                Loading...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        <div className='mt-2 text-foreground text-sm'>
          <p>
            Don&apos;t have an account?{" "}
            <Link
              to='/signup'
              className='text-primary hover:text-yellow-500 underline'
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* right side */}
      <AuthImagePattern
        title='Join our community'
        subtitle='Connect with your friends, share moments, and stay in touch with your loved ones.'
      />
    </div>
  );
}
