const optimizeImage = (url) => {
  if (!url) return "";

  // Keep stored CDN URLs intact; this also preserves legacy records.
  return url;
};

export default optimizeImage;
