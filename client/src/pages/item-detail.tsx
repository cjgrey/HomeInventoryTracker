import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Package, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Shield, 
  Edit,
  Trash2,
  Camera,
  FileText,
  Barcode,
  Clock,
  ArrowLeft
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Item, Location } from "@shared/schema";

export default function ItemDetail() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const itemId = parseInt(params.id as string);

  const { data: item, isLoading } = useQuery<Item>({
    queryKey: ['/api/items', itemId],
    enabled: !!itemId,
  });

  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: ['/api/locations'],
  });

  const deleteItemMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('DELETE', `/api/items/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Item deleted",
        description: "The item has been removed from your inventory.",
      });
      setLocation('/inventory');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete item. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded animate-pulse"></div>
        <div className="h-64 bg-muted rounded-xl animate-pulse"></div>
        <div className="h-32 bg-muted rounded-xl animate-pulse"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Item not found</h2>
        <p className="text-muted-foreground mb-6">The item you're looking for doesn't exist.</p>
        <Button onClick={() => setLocation('/inventory')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Inventory
        </Button>
      </div>
    );
  }

  const location = item.locationId ? locations.find(l => l.id === item.locationId) : null;

  const getWarrantyStatus = () => {
    if (!item.warrantyEndDate) return null;
    
    const endDate = new Date(item.warrantyEndDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return { status: 'expired', color: 'destructive', text: 'Warranty Expired' };
    } else if (daysUntilExpiry <= 30) {
      return { status: 'expiring', color: 'destructive', text: `Expires in ${daysUntilExpiry} days` };
    } else {
      return { status: 'valid', color: 'default', text: `Valid for ${daysUntilExpiry} days` };
    }
  };

  const warrantyStatus = getWarrantyStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setLocation('/inventory')}
          className="p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Item</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{item.name}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteItemMutation.mutate()}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Main Photo */}
      {item.photos && item.photos.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              <img
                src={item.photos[0]}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
            {item.photos.length > 1 && (
              <div className="p-4">
                <div className="flex gap-2 overflow-x-auto">
                  {item.photos.slice(1).map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`${item.name} ${index + 2}`}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{item.name}</CardTitle>
              {item.description && (
                <p className="text-muted-foreground mt-2">{item.description}</p>
              )}
            </div>
            {item.value && (
              <Badge variant="secondary" className="text-lg px-3 py-1">
                <DollarSign className="w-4 h-4 mr-1" />
                {parseFloat(item.value).toLocaleString()}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Location */}
          {location && (
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">{location.path}</span>
            </div>
          )}

          {/* Barcode */}
          {item.barcode && (
            <div className="flex items-center space-x-2">
              <Barcode className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground font-mono">{item.barcode}</span>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {item.purchaseDate && (
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Purchase Date</p>
                  <p className="text-foreground">
                    {new Date(item.purchaseDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            {item.warrantyEndDate && (
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Warranty</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-foreground">
                      {new Date(item.warrantyEndDate).toLocaleDateString()}
                    </span>
                    {warrantyStatus && (
                      <Badge variant={warrantyStatus.color} className="text-xs">
                        {warrantyStatus.text}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 pt-2 border-t border-border">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Added</p>
              <p className="text-foreground">
                {new Date(item.createdAt).toLocaleDateString()} at{' '}
                {new Date(item.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Fields */}
      {item.customFields && Object.keys(item.customFields).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Custom Fields</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(item.customFields).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <span className="text-foreground font-medium">{String(value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {item.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground whitespace-pre-wrap">{item.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Receipts */}
      {item.receipts && item.receipts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Receipts & Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {item.receipts.map((receipt, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">Receipt {index + 1}</span>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={receipt} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
