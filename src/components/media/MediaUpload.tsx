import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Image, Upload, X } from "lucide-react";

export function MediaUpload() {
  const { user, teamId } = useAuth();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [teamMedia, setTeamMedia] = useState<any[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !teamId || !user) {
      toast({
        title: "Missing information",
        description: "Please select a file and add a caption",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Upload to Supabase Storage
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `team-${teamId}-${Date.now()}.${fileExt}`;
      const filePath = `team-media/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(filePath, selectedFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from("media")
        .getPublicUrl(filePath);

      if (!urlData.publicUrl) throw new Error("Failed to get public URL");

      // Save media info to database
      const { error: dbError } = await supabase.from("team_media").insert({
        team_id: teamId,
        user_id: user.id,
        media_url: urlData.publicUrl,
        caption: caption,
        created_at: new Date().toISOString(),
      });

      if (dbError) throw dbError;

      toast({
        title: "Upload successful",
        description: "Your media has been shared with the team",
      });

      // Reset form
      setSelectedFile(null);
      setCaption("");
      setPreview(null);

      // Refresh media list
      fetchTeamMedia();
    } catch (error) {
      console.error("Error uploading media:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your media",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const fetchTeamMedia = async () => {
    try {
      const { data, error } = await supabase
        .from("team_media")
        .select(
          `
          id,
          media_url,
          caption,
          created_at,
          profiles:user_id (full_name)
        `
        )
        .eq("team_id", teamId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTeamMedia(data || []);
    } catch (error) {
      console.error("Error fetching team media:", error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Share Media</CardTitle>
          <CardDescription>
            Share photos and updates with your team
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="media">Upload Image</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="media"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
              </div>
            </div>

            {preview && (
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-64 rounded-md object-contain"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreview(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="grid w-full gap-1.5">
              <Label htmlFor="caption">Caption</Label>
              <Textarea
                id="caption"
                placeholder="Add a caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>

            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="w-full"
            >
              {isUploading ? (
                "Uploading..."
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" /> Share with Team
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team Gallery</CardTitle>
          <CardDescription>Photos shared by your team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamMedia.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <Image className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold">No media yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Be the first to share a photo with your team!
                </p>
              </div>
            ) : (
              teamMedia.map((item) => (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-lg border bg-background"
                >
                  <img
                    src={item.media_url}
                    alt={item.caption}
                    className="h-48 w-full object-cover"
                  />
                  <div className="p-4">
                    <p className="text-sm">{item.caption}</p>
                    <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                      <span>By {item.profiles.full_name}</span>
                      <span>
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}