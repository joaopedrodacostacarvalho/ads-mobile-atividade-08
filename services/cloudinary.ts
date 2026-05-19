import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "@env";

export const uploadImage = async (uri: string) => {
  try {
    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
    const formData = new FormData();
    // @ts-ignore - React Native aceita esse formato
    formData.append("file", {
      uri,
      type: "image/jpeg",
      name: "upload.jpg",
    });
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      },
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.secure_url;
  } catch (error) {
    console.error("Erro no upload:", error);
    throw error;
  }
};
