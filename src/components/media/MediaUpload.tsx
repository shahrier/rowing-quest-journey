import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Media } from '@/lib/supabase-types';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Image, Video } from 'lucide-react';

export function MediaUpload() {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check file type
    const fileType = selectedFile.type.split('/')[0];
    if (fileType !== 'image' && fileType !== 'video') {
      toast({
        title: 'Error',
        description: 'Please select an image or video file',
        variant: 'destructive',
      });
      return;
    }

    // Check file size (max 50MB)
    if (selectedFile.size > 50 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'File size must be less than 50MB',
        variant: 'destructive',
      });
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({
        title: 'Error',
        description: 'Please select a file to upload',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);

      // Get user's team
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('team_id')
        .eq('user_id', user?.id)
        .single();

      if (profileError) throw profileError;

      if (!profile.team_id) {
        toast({
          title: 'Error',
          description: 'You must be part of a team to upload media',
          variant: 'destructive',
        });
        return;
      }

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `media/${profile.team_id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrl } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      // Create media record
      const { error: mediaError } = await supabase
        .from('media')
        .insert({
          user_id: user?.id,
          team_id: profile.team_id,
          media_type: file.type.startsWith('image/') ? 'photo' : 'video',
          url: publicUrl.publicUrl,
          caption: caption.trim() || null,
        });

      if (mediaError) throw mediaError;

      toast({
        title: 'Success',
        description: 'Media uploaded successfully',
      });

      // Reset form
      setFile(null);
      setCaption('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading media:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload media',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Media</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Select File</Label>
            <div className="flex items-center space-x-2">
              <Input
                ref={fileInputRef}
                id="file"
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </Button>
              {file && (
                <span className="text-sm text-gray-600">
                  {file.type.startsWith('image/') ? (
                    <Image className="w-4 h-4 inline mr-1" />
                  ) : (
                    <Video className="w-4 h-4 inline mr-1" />
                  )}
                  {file.name}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="caption">Caption (optional)</Label>
            <Textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Enter a caption for your media"
            />
          </div>

          <Button type="submit" disabled={isLoading || !file}>
            {isLoading ? 'Uploading...' : 'Upload'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
