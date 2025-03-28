
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, User } from 'lucide-react';
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
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    
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
      
      // Upload image to Supabase Storage
      const { data, error } = await supabase.storage
        .from('barber_profiles')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type
        });
      
      if (error) throw error;
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('barber_profiles')
        .getPublicUrl(data.path);
      
      const publicUrl = publicUrlData.publicUrl;
      
      // Update user profile with new image URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ image_url: publicUrl })
        .eq('id', userId);
      
      if (updateError) throw updateError;
      
      // Call the callback with the new image URL
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
        <AvatarImage src={currentImageUrl || undefined} alt={userName} />
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
