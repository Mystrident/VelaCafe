import { generateReactHelpers } from "@uploadthing/react";

const apiUrl = import.meta.env.VITE_API_URL;

if (!apiUrl) {
  throw new Error("VITE_API_URL must be configured for image uploads");
}

export const { useUploadThing } = generateReactHelpers({
  url: `${apiUrl.replace(/\/$/, "")}/uploadthing`,
});
