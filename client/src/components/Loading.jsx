import { Loader } from "lucide-react";

export default function Loading() {
  return (
    <div className='flex gap-2 items-center justify-center min-h-screen'>
      <Loader className='animate-spin text-gray-200' size={20} />
      <span className='text-gray-200 text-md'>Loading...</span>
    </div>
  );
}
