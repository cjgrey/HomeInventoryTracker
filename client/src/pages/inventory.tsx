import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Plus, 
  Package, 
  MapPin, 
  DollarSign,
  Filter,
  Clock,
  AlertTriangle,
  Shield
} from "lucide-react";
import type { Item, Location } from "@shared/schema";

export default function Inventory() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: items = [], isLoading } = useQuery<Item[]>({
    queryKey: searchQuery ? ['/api/items', { search: searchQuery }] : ['/api/items'],
  });

  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: ['/api/locations'],
  });

  const locationMap = new Map(locations.map(l => [l.id, l]));

  const getWarrantyStatus = (item: Item) => {
    if (!item.warrantyEndDate) return null;
    
    const endDate = new Date(item.warrantyEndDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return { status: 'expired', color: 'destructive', text: 'Expired' };
    } else if (daysUntilExpiry <= 30) {
      return { status: 'expiring', color: 'warning', text: 'Expires Soon' };
    } else {
      return { status: 'valid', color: 'success', text: 'Valid' };
    }
  };

  const getCategoryBadge = (item: Item) => {
    const value = parseFloat(item.value || '0');
    if (value > 1000) return { text: 'High Value', variant: 'default' as const };
    if (item.customFields && typeof item.customFields === 'object' && 'category' in item.customFields) {
      return { text: item.customFields.category as string, variant: 'secondary' as const };
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-muted rounded-lg animate-pulse"></div>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-20 bg-muted rounded-xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
          <p className="text-muted-foreground">{items.length} items total</p>
        </div>
        <Link href="/add-item">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {items.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {searchQuery ? 'No items found' : 'No items yet'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery 
                  ? 'Try adjusting your search terms' 
                  : 'Start building your inventory by adding your first item'
                }
              </p>
              {!searchQuery && (
                <Link href="/add-item">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Item
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          items.map((item) => {
            const location = item.locationId ? locationMap.get(item.locationId) : null;
            const warrantyStatus = getWarrantyStatus(item);
            const categoryBadge = getCategoryBadge(item);
            
            return (
              <Link key={item.id} href={`/item/${item.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {item.photos?.[0] ? (
                          <img 
                            src={item.photos[0]} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground truncate mb-1">
                              {item.name}
                            </h3>
                            
                            {item.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                {item.description}
                              </p>
                            )}
                            
                            {location && (
                              <p className="text-sm text-muted-foreground flex items-center mb-2">
                                <MapPin className="w-3 h-3 mr-1" />
                                {location.path}
                              </p>
                            )}
                            
                            <div className="flex items-center gap-2 flex-wrap">
                              {item.value && (
                                <Badge variant="outline" className="text-green-600">
                                  <DollarSign className="w-3 h-3 mr-1" />
                                  {parseFloat(item.value).toLocaleString()}
                                </Badge>
                              )}
                              
                              {warrantyStatus && (
                                <Badge 
                                  variant={warrantyStatus.status === 'valid' ? 'default' : 'destructive'}
                                  className="text-xs"
                                >
                                  <Shield className="w-3 h-3 mr-1" />
                                  {warrantyStatus.text}
                                </Badge>
                              )}
                              
                              {categoryBadge && (
                                <Badge variant={categoryBadge.variant} className="text-xs">
                                  {categoryBadge.text}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {item.value && (
                            <div className="text-right ml-4">
                              <div className="text-lg font-semibold text-green-600">
                                ${parseFloat(item.value).toLocaleString()}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
                          <span className="text-xs text-muted-foreground flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            Added {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                          
                          {item.barcode && (
                            <span className="text-xs text-muted-foreground">
                              Barcode: {item.barcode}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
