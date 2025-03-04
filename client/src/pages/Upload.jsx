import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUp, Trash, X } from "lucide-react"; // Import Trash icon for file removal
import { useMediaStore } from "@/store/useMediaStore"; // Import the media store
import { toast } from "react-hot-toast";

export default function Upload() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]); // Store selected files
  const { uploadContent, isLoading } = useMediaStore();

  // Handle file selection
  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files); // Convert FileList to an array

    // Convert files to base64
    const base64Files = await Promise.all(
      selectedFiles.map((file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () =>
            resolve({
              base64: reader.result,
              file,
              name: file.name,
              type: file.type.startsWith("image") ? "image" : "video", // Determine file type
            });
          reader.onerror = (error) => reject(error);
        });
      })
    );

    setFiles((prevFiles) => [...prevFiles, ...base64Files]); // Add new files to the existing list
  };

  // Handle file removal
  const handleRemoveFile = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files.length || !title || !description) {
      return toast.error("Please fill all fields and select at least one file");
    }

    try {
      await uploadContent(title, description, files);
      setTitle(""); // Reset form fields
      setDescription("");
      setFiles([]);
    } catch (error) {
      console.error("Error uploading content:", error);
      toast.error(error.response?.data?.message || "Failed to upload content");
    }
  };

  return (
    <div className='h-full py-23'>
      <div className='max-w-xl mx-auto py-8 px-4'>
        <form className='space-y-5' onSubmit={handleSubmit}>
          {/* File Upload Section */}
          <div className='flex justify-center'>
            <label htmlFor='uploadFile'>
              <div className='cursor-pointer hover:text-primary transition-colors duration-300 ease-in rounded-full border-2 border-accent-foreground hover:border-primary p-2'>
                <ImageUp size={100} className='stroke-[1px]' />
              </div>
              <input
                type='file'
                className='hidden'
                id='uploadFile'
                onChange={handleFileChange}
                multiple // Allow multiple file selection
              />
            </label>
          </div>

          <p className='text-center text-sm text-accent-foreground'>
            The file size limit is only 10mb
          </p>

          {/* Display Selected Files */}
          {files.length > 0 && (
            <div className='flex flex-wrap justify-center'>
              {files.map((file, index) => (
                <div
                  key={index}
                  className='flex items-center justify-between p-2 border rounded-lg relative'
                >
                  <div className='flex  items-center gap-3'>
                    {file.type === "image" ? (
                      <img
                        src={file.base64}
                        alt={file.name}
                        className='w-25 h-25 object-cover rounded-lg '
                      />
                    ) : (
                      <video
                        src={file.base64}
                        className='w-12 h-12 object-cover rounded-lg relative'
                      />
                    )}
                  </div>
                  <Button
                    type='button'
                    size='icon'
                    className='absolute top-0 left-0 rounded-full bg-transparent  hover:bg-accent-foreground cursor-pointer'
                    onClick={() => handleRemoveFile(index)}
                  >
                    <X className='w-3 h-3 text-muted-foreground' />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Title Input */}
          <Input
            type='text'
            placeholder='Enter Title'
            className='border border-accent-foreground'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* Description Textarea */}
          <Textarea
            placeholder='Enter description'
            className='border border-accent-foreground'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Submit Button */}
          <Button
            type='submit'
            className='w-full cursor-pointer text-accent'
            disabled={isLoading}
          >
            {isLoading ? "Uploading..." : "Upload"}
          </Button>
        </form>
      </div>
    </div>
  );
}
