import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

const f = createUploadthing();

export const ourFileRouter = {
  // "vendorDocument" is the endpoint name — the client refers to it by
  // this exact string when uploading.
  vendorDocument: f({
    image: { maxFileSize: "8MB", maxFileCount: 1 },
    pdf: { maxFileSize: "8MB", maxFileCount: 1 },
  })
    // This runs on OUR server, before the upload is allowed to proceed —
    // it's the actual security check. A logged-out user, or a logged-in
    // buyer, gets rejected here before any file is accepted.
    .middleware(async () => {
      const user = await getCurrentUser();

      if (!user || user.role !== "VENDOR") {
        throw new UploadThingError("Only vendors can upload verification documents");
      }

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Runs on UploadThing's own server after the file is safely stored.
      // We don't need to save anything here ourselves — the browser gets
      // the file's URL directly and sends it to our own API afterward.
      console.log(`Vendor document uploaded by user ${metadata.userId}: ${file.url}`);
    }),

  // Product images: multiple files allowed, only verified vendors can use it.
  productImages: f({
    image: { maxFileSize: "4MB", maxFileCount: 5 },
  })
    .middleware(async () => {
      const user = await getCurrentUser();

      if (!user || user.role !== "VENDOR") {
        throw new UploadThingError("Only vendors can upload product images");
      }

      if (!user.isVerified) {
        throw new UploadThingError("Only verified vendors can upload product images");
      }

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log(`Product image uploaded by user ${metadata.userId}: ${file.url}`);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
