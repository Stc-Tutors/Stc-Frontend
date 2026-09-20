"use client";

import { useState } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { uploadToCloudinary } from "@/lib/cloudinary-upload";
import { AVATAR_MAX_SIZE_KB, AVATAR_UPLOAD_LIMITS } from "@/constants/upload-limits";

interface Props {
  // Current picture, and the name its initials fall back to when there isn't one.
  url?: string;
  name?: string;
  // Called with the uploaded file's URL (or "" when removed). The caller
  // persists it - throw to surface a save failure under the picture.
  onChange: (url: string) => Promise<void>;
}

// Pick-a-file profile picture: the image is uploaded straight to Cloudinary
// (see lib/cloudinary-upload.ts) and only the resulting URL is saved, so
// nobody has to host a picture somewhere else and paste a link. Rejects
// anything over AVATAR_MAX_SIZE_KB before it uploads; stcbe re-checks the
// stored file (validateAvatarUrl) since this check is only UX.
export default function AvatarUpload({ url, name, onChange }: Props) {
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (action: () => Promise<string>) => {
    setIsBusy(true);
    setError(null);
    try {
      await onChange(await action());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update your photo");
    } finally {
      setIsBusy(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const ext = file.name.split(".").pop()?.toUpperCase();
    if (!ext || !AVATAR_UPLOAD_LIMITS.allowedFormats.includes(ext)) {
      setError("Photo must be a JPG or PNG image");
      return;
    }
    if (file.size > AVATAR_MAX_SIZE_KB * 1024) {
      setError(`Photo must be ${AVATAR_MAX_SIZE_KB}KB or smaller (yours is ${Math.round(file.size / 1024)}KB)`);
      return;
    }

    await run(async () => (await uploadToCloudinary(file, "avatars")).url);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={url} alt={name} />
          <AvatarFallback>{name?.[0]}</AvatarFallback>
        </Avatar>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" disabled={isBusy} asChild>
            <label htmlFor="avatar-upload" className="cursor-pointer flex items-center gap-2">
              {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              {isBusy ? "Saving..." : url ? "Change photo" : "Upload photo"}
            </label>
          </Button>
          {url && !isBusy && (
            <Button type="button" variant="ghost" className="text-gray-600" onClick={() => run(async () => "")}>
              <Trash2 className="h-4 w-4 mr-1" /> Remove
            </Button>
          )}
          <input
            id="avatar-upload"
            type="file"
            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>
      <p className="text-xs text-gray-400">JPG or PNG, up to {AVATAR_MAX_SIZE_KB}KB</p>
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  );
}
