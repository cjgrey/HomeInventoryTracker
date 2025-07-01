import { useQuery } from "@tanstack/react-query";
import { Calendar, MapPin, Package, Clock, DollarSign } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { ShareableList, Item, ShareableListItem } from "@shared/schema";

interface SharedListViewProps {
  shareId: string;
}

interface SharedListData {
  list: ShareableList;
  items: (ShareableListItem & { item: Item })[];
}

export default function SharedListView({ shareId }: SharedListViewProps) {
  const { data, isLoading, error } = useQuery<SharedListData>({
    queryKey: ['/api/share', shareId],
    queryFn: () => fetch(`/api/share/${shareId}`).then(res => {
      if (!res.ok) throw new Error('Failed to fetch shared list');
      return res.json();
    }),
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getWarrantyStatus = (item: Item) => {
    if (!item.warrantyEndDate) return null;
    
    const warrantyDate = new Date(item.warrantyEndDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((warrantyDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return { status: 'expired', label: 'Expired', variant: 'destructive' as const };
    } else if (daysUntilExpiry <= 30) {
      return { status: 'expiring', label: `${daysUntilExpiry} days left`, variant: 'secondary' as const };
    } else {
      return { status: 'valid', label: `Valid until ${formatDate(item.warrantyEndDate)}`, variant: 'outline' as const };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="h-8 w-64 bg-muted animate-pulse rounded mb-2" />
          <div className="h-4 w-96 bg-muted animate-pulse rounded mb-6" />
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">List not found</h3>
            <p className="text-sm text-muted-foreground text-center">
              The shared list you're looking for doesn't exist or has been removed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { list, items } = data;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">{list.name}</h1>
          </div>
          {list.description && (
            <p className="text-muted-foreground mb-4">{list.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Created {formatDate(list.createdAt)}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Last updated {formatDateTime(list.updatedAt)}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        {items.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No items in this list</h3>
              <p className="text-sm text-muted-foreground text-center">
                This list doesn't have any items yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Items ({items.length})
              </h2>
            </div>

            <div className="grid gap-4">
              {items.map((listItem) => {
                const { item } = listItem;
                const warrantyStatus = getWarrantyStatus(item);
                
                return (
                  <Card key={listItem.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        {/* Item Photo */}
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                          {item.photos && item.photos.length > 0 ? (
                            <img 
                              src={`/uploads/${item.photos[0]}`} 
                              alt={item.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Package className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>

                        {/* Item Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg text-foreground mb-1">
                                {item.name}
                              </h3>
                              {item.description && (
                                <p className="text-muted-foreground text-sm mb-2">
                                  {item.description}
                                </p>
                              )}
                            </div>
                            
                            {item.value && (
                              <div className="flex items-center gap-1 text-sm font-medium">
                                <DollarSign className="w-4 h-4" />
                                {parseFloat(item.value.toString()).toLocaleString()}
                              </div>
                            )}
                          </div>

                          {/* Item Metadata */}
                          <div className="flex flex-wrap gap-2 mt-3">
                            {item.barcode && (
                              <Badge variant="outline" className="text-xs">
                                {item.barcode}
                              </Badge>
                            )}
                            
                            {item.purchaseDate && (
                              <Badge variant="outline" className="text-xs">
                                <Calendar className="w-3 h-3 mr-1" />
                                Purchased {formatDate(item.purchaseDate)}
                              </Badge>
                            )}

                            {warrantyStatus && (
                              <Badge variant={warrantyStatus.variant} className="text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                {warrantyStatus.label}
                              </Badge>
                            )}
                          </div>

                          {/* Added to list info */}
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs text-muted-foreground">
                              Added to list {formatDateTime(listItem.addedAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-12 border-t bg-muted/30">
        <div className="max-w-4xl mx-auto p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Powered by Vault • Professional inventory management
          </p>
        </div>
      </div>
    </div>
  );
}