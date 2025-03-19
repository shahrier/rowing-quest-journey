import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image, Film, Upload, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Media {
  id: string;
  url: string;
  type: "image" | "video";
  caption: string | null;
  created_at: string;
  user_name: string;
}

export function MediaUpload() {
  const { user, teamId } = useAuth();
  const { toast } = useToast();
  const [media, setMedia] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"images" | "videos">("images");

  // Upload states
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Delete dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (user && teamId) {
      fetchMedia();
    } else {
      setIsLoading(false);
    }
  }, [user, teamId]);

  const fetchMedia = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("media")
        .select(
          `
          id,
          url,
          type,
          caption,
          created_at,
          profiles:user_id (full_name)
        `,
        )
        .eq("team_id", teamId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Format the data
      const formattedMedia = data.map((item) => ({
        id: item.id,
        url: item.url,
        type: item.type,
        caption: item.caption,
        created_at: item.created_at,
        user_name: item.profiles?.full_name || "Unknown",
      }));

      setMedia(formattedMedia);
    } catch (error) {
      console.error("Error fetching media:", error);
      toast({
        title: "Error",
        description: "Failed to load media",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check file type
    const fileType = selectedFile.type.split("/")[0];
    if (fileType !== "image" && fileType !== "video") {
      toast({
        title: "Invalid file type",
        description: "Please upload an image or video file",
        variant: "destructive",
      });
      return;
    }

    // Check file size (10MB limit)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);

    // Create preview URL
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);

    // Set active tab based on file type
    setActiveTab(fileType === "image" ? "images" : "videos");
  };

  const handleUpload = async () => {
    if (!file || !user || !teamId) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create a unique file name
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `media/${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("media")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from("media")
        .getPublicUrl(filePath);

      if (!urlData.publicUrl) throw new Error("Failed to get public URL");

      // Save to database
      const { error: dbError } = await supabase.from("media").insert({
        user_id: user.id,
        team_id: teamId,
        url: urlData.publicUrl,
        type: file.type.startsWith("image/") ? "image" : "video",
        caption: caption || null,
      });

      if (dbError) throw dbError;

      toast({
        title: "Upload successful",
        description: "Your media has been uploaded",
      });

      // Reset form
      setFile(null);
      setCaption("");
      setPreviewUrl(null);

      // Refresh media
      fetchMedia();
    } catch (error) {
      console.error("Error uploading media:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your media",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteMedia = async () => {
    if (!mediaToDelete) return;

    try {
      // Get the media item
      const mediaItem = media.find((m) => m.id === mediaToDelete);
      if (!mediaItem) return;

      // Extract the file path from the URL
      const url = new URL(mediaItem.url);
      const filePath = url.pathname.split("/").pop();

      if (filePath) {
        // Delete from storage
        const { error: storageError } = await supabase.storage
          .from("media")
          .remove([`media/${filePath}`]);

        if (storageError) {
          console.error("Error deleting from storage:", storageError);
        }
      }

      // Delete from database
      const { error } = await supabase
        .from("media")
        .delete()
        .eq("id", mediaToDelete);

      if (error) throw error;

      toast({
        title: "Media deleted",
        description: "Your media has been deleted",
      });

      // Refresh media
      fetchMedia();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting media:", error);
      toast({
        title: "Error",
        description: "Failed to delete media",
        variant: "destructive",
      });
    }
  };

  const confirmDelete = (mediaId: string) => {
    setMediaToDelete(mediaId);
    setIsDeleteDialogOpen(true);
  };

  if (!teamId) {
    return (
      <Card data-oid=":mt:1j7">
        <CardHeader data-oid="edqs0f5">
          <CardTitle data-oid="-lvcyd:">Team Media</CardTitle>
          <CardDescription data-oid="y_hwnge">
            Share photos and videos with your team
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8" data-oid="lncdlt3">
          <p data-oid="7k1enz1">
            You need to be part of a team to share media.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-oid="ash1i4c">
      <CardHeader data-oid="cnvcafg">
        <CardTitle data-oid="871tec:">Team Media</CardTitle>
        <CardDescription data-oid="p0.h-e4">
          Share photos and videos with your team
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6" data-oid="m79xj9-">
        <div className="space-y-4" data-oid="0y8v4rl">
          <div className="grid gap-4" data-oid="d6yov1f">
            <Label htmlFor="media-upload" data-oid="0v39lx4">
              Upload Photo or Video
            </Label>
            <div className="flex items-center gap-2" data-oid="no5p891">
              <Input
                id="media-upload"
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="flex-1"
                data-oid="t67fc1v"
              />

              <Button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="whitespace-nowrap"
                data-oid="vwnkdoh"
              >
                <Upload className="h-4 w-4 mr-2" data-oid="2l9ziro" />
                {isUploading ? `Uploading ${uploadProgress}%` : "Upload"}
              </Button>
            </div>

            {previewUrl && (
              <div className="mt-2" data-oid="myvyqpm">
                <Label data-oid="qztt_3x">Preview</Label>
                <div
                  className="mt-1 border rounded-md overflow-hidden"
                  data-oid="d6yk2a0"
                >
                  {file?.type.startsWith("image/") ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-[300px] w-full object-contain"
                      data-oid="iiszclo"
                    />
                  ) : (
                    <video
                      src={previewUrl}
                      controls
                      className="max-h-[300px] w-full"
                      data-oid="mtg6k6."
                    />
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2" data-oid="y::exd5">
              <Label htmlFor="caption" data-oid="k:4v84q">
                Caption
              </Label>
              <Textarea
                id="caption"
                placeholder="Add a caption to your upload"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={2}
                data-oid="rxfb24j"
              />
            </div>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "images" | "videos")}
          data-oid=":ynds65"
        >
          <TabsList className="grid w-full grid-cols-2" data-oid="sydnhy7">
            <TabsTrigger value="images" data-oid="yuj-r29">
              <Image className="h-4 w-4 mr-2" data-oid="dzpjl6w" />
              Photos
            </TabsTrigger>
            <TabsTrigger value="videos" data-oid="w_ipt18">
              <Film className="h-4 w-4 mr-2" data-oid="49peq8t" />
              Videos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="images" className="mt-4" data-oid="kj1s7ox">
            {isLoading ? (
              <div className="text-center py-4" data-oid="_ygmhwp">
                Loading images...
              </div>
            ) : (
              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                data-oid="c8qawnq"
              >
                {media
                  .filter((item) => item.type === "image")
                  .map((image) => (
                    <div
                      key={image.id}
                      className="relative group"
                      data-oid="w95ni4:"
                    >
                      <img
                        src={image.url}
                        alt={image.caption || "Team photo"}
                        className="w-full h-48 object-cover rounded-md"
                        data-oid="juw_tg2"
                      />

                      <div
                        className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-md flex items-end justify-between p-2"
                        data-oid="cmju6fg"
                      >
                        <div
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm"
                          data-oid="bt-53ge"
                        >
                          <p className="font-medium" data-oid="6s-fa42">
                            {image.user_name}
                          </p>
                          <p className="text-xs" data-oid="0a.olm9">
                            {new Date(image.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => confirmDelete(image.id)}
                          data-oid="1mhyinn"
                        >
                          <Trash2 className="h-4 w-4" data-oid="-wamt5u" />
                        </Button>
                      </div>
                      {image.caption && (
                        <div
                          className="mt-1 text-sm text-muted-foreground truncate"
                          data-oid="duly7t6"
                        >
                          {image.caption}
                        </div>
                      )}
                    </div>
                  ))}

                {media.filter((item) => item.type === "image").length === 0 && (
                  <div
                    className="col-span-full text-center py-8 text-muted-foreground"
                    data-oid="t9mnrv1"
                  >
                    No photos have been shared yet
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="videos" className="mt-4" data-oid="slce3j:">
            {isLoading ? (
              <div className="text-center py-4" data-oid="dta71mt">
                Loading videos...
              </div>
            ) : (
              <div
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                data-oid="ueatpd-"
              >
                {media
                  .filter((item) => item.type === "video")
                  .map((video) => (
                    <div
                      key={video.id}
                      className="space-y-2"
                      data-oid="e5ht.ha"
                    >
                      <div className="relative group" data-oid="w6l7xzz">
                        <video
                          src={video.url}
                          controls
                          className="w-full rounded-md"
                          data-oid="kkuoymm"
                        />

                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => confirmDelete(video.id)}
                          data-oid="zplg6j2"
                        >
                          <Trash2 className="h-4 w-4" data-oid="qc4masc" />
                        </Button>
                      </div>
                      {video.caption && (
                        <p className="text-sm" data-oid="0lepw5m">
                          {video.caption}
                        </p>
                      )}
                      <div
                        className="flex justify-between text-xs text-muted-foreground"
                        data-oid="8z255kb"
                      >
                        <span data-oid="sdftdbk">{video.user_name}</span>
                        <span data-oid="xi2:-_e">
                          {new Date(video.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}

                {media.filter((item) => item.type === "video").length === 0 && (
                  <div
                    className="col-span-full text-center py-8 text-muted-foreground"
                    data-oid="ir:cg0q"
                  >
                    No videos have been shared yet
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        data-oid="j74tzgf"
      >
        <DialogContent data-oid=":1ke01b">
          <DialogHeader data-oid="ujlxst_">
            <DialogTitle data-oid="qi:tmvl">Delete Media</DialogTitle>
            <DialogDescription data-oid="wc6h7b:">
              Are you sure you want to delete this media? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter data-oid="y414byu">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              data-oid="vvckj9k"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteMedia}
              data-oid="qbsn5c5"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
