import cloudinary from "../lib/cloudinary.js";
import Media from "../models/media.model.js";

export const uploadContent = async(req, res) => {
    try {
        const {title, description, files} = req.body

        if(!files || !files.length) {
            return res.status(400).json({message: "No files were uploaded"});
        }
        const uploadedFiles = await Promise.all(
            files.map(async (file) => {
                const result = await cloudinary.uploader.upload(file.base64, {
                    resource_type: "auto",
                });
                return {
                    url : result.secure_url,
                    type: result.resource_type
                }
            })
        )

        // Save media details to the database
        const media = await Media.create({
            title,
            description,
            files: uploadedFiles,
            user: req.user._id, // Assuming protectRoute middleware attaches the user to req.user
        });

        res.status(201).json({
            message: "Content uploaded successfully",
            media,
        });
    } catch (error) {
        console.error("Error in uploadContent controller:", error);
    res.status(500).json({ message: "Internal server error" });
    }
}

export const getUserContent = async (req, res) => {
    try {
      // Fetch all media content for the logged-in user
      const media = await Media.find({ user: req.user._id }).sort({ createdAt: -1 }); // Sort by latest first
  
      // Return the media content
      res.status(200).json({
        message: "User content fetched successfully",
        media,
      });
    } catch (error) {
      console.error("Error fetching user content:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  export const getUserMedia = async (req, res) => {
    try {
      const { userId } = req.params;
  
      // Fetch media content for the user
      const media = await Media.find({ user: userId }).sort({ createdAt: -1 });
  
      res.status(200).json({
        message: "User media fetched successfully",
        media,
      });
    } catch (error) {
      console.error("Error fetching user media:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };