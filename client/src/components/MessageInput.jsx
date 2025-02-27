import { useChatStore } from "@/store/useChatStore";
import { Image, Send, SendHorizonal, X } from "lucide-react";
import { useRef, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import toast from "react-hot-toast";

export default function MessageInput() {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const { sendMessage } = useChatStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });

      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  return (
    <div className='p-4 w-full'>
      {imagePreview && (
        <div className='mb-3 flex items-center gap-2'>
          <div className='relative'>
            <img
              src={imagePreview}
              alt='Preview'
              className='w-20 h-20 object-cover rounded-lg border  border-zinc-700'
            />

            <button
              onClick={removeImage}
              className='absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center'
            >
              <X className='size-3' />
            </button>
          </div>
        </div>
      )}

      {/* FOrm */}
      <form onSubmit={handleSendMessage} className='flex items-center gap-2'>
        <div className='flex-1 flex gap-2'>
          <Input
            type='text'
            className='w-full border border-primary/50'
            placeholder='Type a message...'
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <Input
            type='file'
            accept='image/*'
            className='hidden'
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <Button
            variant='ghost'
            size='icon'
            type='button'
            className={`hidden sm:flex cursor-pointer  ${
              imagePreview ? "text-emerald-500" : "text-zinc-400"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image className='size-6 stroke-1' />
          </Button>
        </div>

        <Button
          variant='ghost'
          size='icon'
          className='cursor-pointer'
          disabled={!text.trim() && !imagePreview}
        >
          <Send className='size-6 stroke-1' />
        </Button>
      </form>
    </div>
  );
}
