import { Loader } from "lucide-react";

export default function Loading() {
  return (
    <div className='flex gap-2 items-center justify-center min-h-screen'>
      <Loader className='animate-spin text-accent-foreground' size={20} />
      <span className='text-accent-foreground text-md'>Loading...</span>
    </div>
  );
}
