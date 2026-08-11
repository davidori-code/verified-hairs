import { generateUploadButton, generateUploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

// Generating these once, typed against our specific file router, means
// TypeScript will warn us if we ever reference an upload endpoint name
// that doesn't actually exist in core.ts.
export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();
