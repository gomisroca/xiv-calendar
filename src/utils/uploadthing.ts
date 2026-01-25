import { generateReactHelpers, generateUploadButton, generateUploadDropzone } from '@uploadthing/react';

import type { UploadThingRouter } from '@/app/api/uploadthing/core';

export const UploadButton = generateUploadButton<UploadThingRouter>();
export const UploadDropzone = generateUploadDropzone<UploadThingRouter>();
export const { useUploadThing, uploadFiles } = generateReactHelpers<UploadThingRouter>();
