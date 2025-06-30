import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  QrCode, 
  Plus, 
  Camera, 
  Star, 
  TrendingUp, 
  MapPin,
  Package,
  DollarSign,
  Clock,
  AlertTriangle,
  Shield
} from "lucide-react";
import AchievementBanner from "@/components/achievement-banner";
import type { Item, Location } from "@shared/schema";

interface StatsData {
  totalItems: number;
  totalValue: number;
  locationsCount: number;
  recentItems: Item[];
}

export default function Home() {
  const { data: stats, isLoading: statsLoading } = useQuery<StatsData>({
    queryKey: ['/api/stats'],
  });

  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: ['/api/locations'],
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ['/api/achievements'],
  });

  const locationMap = new Map(locations.map(l => [l.id, l]));
  const recentlyUnlockedAchievement = achievements.find(a => 
    a.isUnlocked && a.unlockedAt && 
    new Date(a.unlockedAt).getTime() > Date.now() - 24 * 60 * 60 * 1000 // Last 24 hours
  );

  const getWarrantyStatus = (item: Item) => {
    if (!item.warrantyEndDate) return null;
    
    const endDate = new Date(item.warrantyEndDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return { status: 'expired', color: 'bg-red-500', text: 'Warranty Expired' };
    } else if (daysUntilExpiry <= 30) {
      return { status: 'expiring', color: 'bg-yellow-500', text: 'Warranty Expires Soon' };
    } else {
      return { status: 'valid', color: 'bg-green-500', text: 'Warranty Valid' };
    }
  };

  if (statsLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-muted rounded-xl"></div>
        <div className="h-24 bg-muted rounded-xl"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-muted rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const progressPercentage = stats ? Math.min((stats.totalItems / 100) * 100, 100) : 0;

  return (
    <div className="space-y-6 pb-6">
      {/* Achievement Banner */}
      {recentlyUnlockedAchievement && (
        <AchievementBanner achievement={recentlyUnlockedAchievement} />
      )}

      {/* Dashboard Stats */}
      <div className="bg-gradient-to-r from-primary/10 to-blue-50 dark:from-primary/5 dark:to-blue-950/20 rounded-xl p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-foreground">{stats?.totalItems || 0}</div>
              <div className="text-xs text-muted-foreground mt-1">Items</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                ${stats?.totalValue?.toLocaleString() || '0'}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Total Value</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">{stats?.locationsCount || 0}</div>
              <div className="text-xs text-muted-foreground mt-1">Locations</div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Indicator */}
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-foreground">Inventory Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/scanner">
          <Button className="w-full h-16 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-transform">
            <QrCode className="w-5 h-5 mr-2" />
            Scan Item
          </Button>
        </Link>
        
        <Link href="/add-item">
          <Button variant="outline" className="w-full h-16 active:scale-95 transition-transform">
            <Plus className="w-5 h-5 mr-2" />
            Add Manually
          </Button>
        </Link>
      </div>

      {/* Recent Items */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Recent Items</h2>
          <Link href="/inventory">
            <Button variant="ghost" className="text-primary text-sm font-medium">
              View All
            </Button>
          </Link>
        </div>

        <div className="space-y-3">
          {stats?.recentItems?.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-foreground mb-2">No items yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start building your inventory by adding your first item
                </p>
                <Link href="/add-item">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Item
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            stats?.recentItems?.map((item) => {
              const location = item.locationId ? locationMap.get(item.locationId) : null;
              const warrantyStatus = getWarrantyStatus(item);
              
              return (
                <Link key={item.id} href={`/item/${item.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {item.photos?.[0] ? (
                            <img 
                              src={item.photos[0]} 
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-foreground truncate">{item.name}</h3>
                            {item.value && (
                              <span className="text-sm font-medium text-green-600">
                                ${parseFloat(item.value).toLocaleString()}
                              </span>
                            )}
                          </div>
                          
                          {location && (
                            <p className="text-sm text-muted-foreground truncate flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {location.path}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-muted-foreground flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              Added {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                            
                            {warrantyStatus && (
                              <div className="flex items-center space-x-1">
                                <div className={`w-2 h-2 rounded-full ${warrantyStatus.color}`}></div>
                                <span className="text-xs text-muted-foreground">{warrantyStatus.text}</span>
                              </div>
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
    </div>
  );
}
