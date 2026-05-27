const optimizeImage = (url, width = 400) => {
  if (!url) return "";

  return url.replace(
    "/upload/",
    `/upload/f_auto,q_auto,dpr_auto,w_${width},c_fill`,
  );
};

export default optimizeImage;
