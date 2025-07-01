import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Share2, QrCode, Trash2, Users, Calendar, MapPin } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ShareableList, Location } from "@shared/schema";
import QRCode from "qrcode";

export default function ShareableLists() {
  const [showQR, setShowQR] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const { toast } = useToast();

  const { data: lists = [], isLoading } = useQuery<ShareableList[]>({
    queryKey: ['/api/shareable-lists'],
  });

  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: ['/api/locations'],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/shareable-lists/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shareable-lists'] });
      toast({
        title: "List deleted",
        description: "The shareable list has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete the list. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleShowQR = async (shareId: string) => {
    try {
      const shareUrl = `${window.location.origin}/share/${shareId}`;
      const qrCode = await QRCode.toDataURL(shareUrl, { width: 256 });
      setQrCodeUrl(qrCode);
      setShowQR(shareId);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate QR code.",
        variant: "destructive",
      });
    }
  };

  const copyShareLink = (shareId: string) => {
    const shareUrl = `${window.location.origin}/share/${shareId}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link copied",
      description: "Share link has been copied to clipboard.",
    });
  };

  const getLocationName = (locationId: number | null) => {
    if (!locationId) return "No location";
    const location = locations.find(l => l.id === locationId);
    return location?.name || "Unknown location";
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Shareable Lists</h1>
          <p className="text-muted-foreground mt-1">
            Create QR codes for public inventory sharing
          </p>
        </div>
        <Link href="/shareable-lists/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New List
          </Button>
        </Link>
      </div>

      {lists.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No shareable lists yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
              Create lists that others can access by scanning QR codes. Perfect for sharing fridge contents, tool inventories, or any collection.
            </p>
            <Link href="/shareable-lists/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First List
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {lists.map((list) => (
            <Card key={list.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {list.name}
                      {list.isPublic && (
                        <Badge variant="secondary" className="text-xs">
                          <Users className="w-3 h-3 mr-1" />
                          Public
                        </Badge>
                      )}
                    </CardTitle>
                    {list.description && (
                      <CardDescription className="mt-1">
                        {list.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShowQR(list.shareId)}
                    >
                      <QrCode className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyShareLink(list.shareId)}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteMutation.mutate(list.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {getLocationName(list.locationId)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Created {formatDate(list.createdAt)}
                  </div>
                </div>
                <div className="mt-2">
                  <Link href={`/shareable-lists/${list.id}`}>
                    <Button variant="outline" size="sm">
                      Manage Items
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!showQR} onOpenChange={() => setShowQR(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code for Sharing</DialogTitle>
            <DialogDescription>
              Print this QR code and place it where people can scan it to view the list.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-center p-6">
            {qrCodeUrl && (
              <img 
                src={qrCodeUrl} 
                alt="QR Code" 
                className="border rounded-lg"
              />
            )}
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Share URL: {window.location.origin}/share/{showQR}
            </p>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => showQR && copyShareLink(showQR)}
            >
              Copy Link
            </Button>
            <Button onClick={() => setShowQR(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}