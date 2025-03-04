import React from "react";
import { Link } from "react-router-dom";

const MediaItem = ({ file }) => {
  return (
    <Link to={`/file/${file._id}`} className='group relative cursor-pointer'>
      {file && (
        <div>
          {file.type === "image" ? (
            <img
              src={file.url}
              alt='Media'
              className='w-19 md:w-35 lg:w-40 h-30 md:h-48 lg:h-48 object-cover rounded-lg'
            />
          ) : (
            <video
              src={file.url}
              controls
              className='w-19 md:w-35 lg:w-40 h-30 md:h-48 lg:h-48 object-cover rounded-lg'
            />
          )}
        </div>
      )}
      {/* Black overlay on hover */}
      <div className='absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-lg'></div>
    </Link>
  );
};

export default MediaItem;
