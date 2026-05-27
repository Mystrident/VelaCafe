const optimizeImage = (url, width = 500) => {
  if (!url) return "";

  if (!url.includes("cloudinary")) {
    return url;
  }

  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
};

export default optimizeImage;
