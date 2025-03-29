
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ProfileImageUploadProps {
  userId: string;
  currentImageUrl: string | null;
  userName: string;
  onImageUpdated: (newImageUrl: string) => void;
  size?: 'sm' | 'md' | 'lg';
  allowUpload?: boolean;
}

const ProfileImageUpload = ({
  userId,
  currentImageUrl,
  userName,
  onImageUpdated,
  size = 'md',
  allowUpload = true
}: ProfileImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  
  const sizeClasses = {
    sm: 'h-20 w-20',
    md: 'h-32 w-32',
    lg: 'h-48 w-48'
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Create a unique file path with user ID
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${Date.now()}.${fileExt}`;

      // Use the correct MIME type from the file object
      const fileOptions = {
        upsert: true,
        contentType: file.type // This ensures the correct MIME type is used
      };

      // Upload to Supabase Storage with the correct content type
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('barber_profiles')
        .upload(filePath, file, fileOptions);
        
      if (uploadError) throw uploadError;

      console.log("Upload success data:", uploadData);

      // Get the public URL
      let { data: publicUrlData } = supabase.storage
        .from('barber_profiles')
        .getPublicUrl(uploadData.path);

      let publicUrl = publicUrlData.publicUrl;
      // Append cache-buster
      publicUrl += `?cb=${Date.now()}`;
      console.log("Final Public URL:", publicUrl);

      // Update 'profiles' table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ image_url: publicUrl })
        .eq('id', userId);
      if (updateError) throw updateError;

      // Notify parent
      onImageUpdated(publicUrl);
      toast.success('Profile image updated successfully');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <Avatar className={`${sizeClasses[size]} border-2 border-primary/20`}>
        <AvatarImage
          src={currentImageUrl || undefined}
          alt={userName}
        />
        <AvatarFallback className="bg-primary/10 text-primary text-xl">
          {getInitials(userName)}
        </AvatarFallback>
      </Avatar>

      {allowUpload && (
        <div className="mt-4">
          <input
            type="file"
            id="profile-image"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          <label htmlFor="profile-image">
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              disabled={isUploading}
              asChild
            >
              <span>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Image
                  </>
                )}
              </span>
            </Button>
          </label>
        </div>
      )}
    </div>
  );
};

export default ProfileImageUpload;
