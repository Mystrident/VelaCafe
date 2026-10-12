const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const {
  createUploadthing,
  createRouteHandler,
} = require("uploadthing/express");
const { UploadThingError } = require("uploadthing/server");

const f = createUploadthing();

// Files are uploaded directly to UploadThing. This route only issues upload
// permissions after confirming that the caller still has an admin account.
const uploadRouter = {
  productImage: f({
    "image/jpeg": {
      maxFileSize: "5MB",
      maxFileCount: 1,
    },
    "image/png": {
      maxFileSize: "5MB",
      maxFileCount: 1,
    },
    "image/webp": {
      maxFileSize: "5MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const authorization = req.headers.authorization;

      if (!authorization?.startsWith("Bearer ")) {
        throw new UploadThingError({
          code: "FORBIDDEN",
          message: "Admin authentication is required to upload images",
        });
      }

      try {
        const token = authorization.slice("Bearer ".length);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== "admin") {
          throw new Error("Not an admin token");
        }

        const admin = await Admin.findById(decoded.id).select("_id");
        if (!admin) throw new Error("Admin no longer exists");

        return { adminId: admin._id.toString() };
      } catch (error) {
        throw new UploadThingError({
          code: "FORBIDDEN",
          message: "Only authenticated admins can upload images",
          cause: error,
        });
      }
    })
    .onUploadComplete(async ({ file, metadata }) => {
      console.log(
        `Product image uploaded by admin ${metadata.adminId}: ${file.key}`,
      );
    }),
};

module.exports = createRouteHandler({ router: uploadRouter });
