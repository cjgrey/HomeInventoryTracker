import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { 
  Download, 
  TrendingUp, 
  DollarSign, 
  Package, 
  MapPin,
  Calendar,
  AlertTriangle,
  Shield,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Item, Location, Achievement } from "@shared/schema";

export default function Reports() {
  const { toast } = useToast();

  const { data: items = [], isLoading: itemsLoading } = useQuery<Item[]>({
    queryKey: ['/api/items'],
  });

  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: ['/api/locations'],
  });

  const { data: achievements = [] } = useQuery<Achievement[]>({
    queryKey: ['/api/achievements'],
  });

  const handleExportCSV = async () => {
    try {
      const response = await fetch('/api/export/csv');
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'inventory.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Export successful",
        description: "Your inventory has been exported to CSV.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting your data.",
        variant: "destructive",
      });
    }
  };

  // Calculate statistics
  const totalValue = items.reduce((sum, item) => sum + (parseFloat(item.value || '0') || 0), 0);
  const avgValue = items.length > 0 ? totalValue / items.length : 0;
  
  const locationMap = new Map(locations.map(l => [l.id, l]));
  
  // Items by location for chart
  const itemsByLocation = locations.map(location => ({
    name: location.name,
    count: items.filter(item => item.locationId === location.id).length,
    value: items
      .filter(item => item.locationId === location.id)
      .reduce((sum, item) => sum + (parseFloat(item.value || '0') || 0), 0)
  })).filter(loc => loc.count > 0);

  // Value distribution
  const valueRanges = [
    { name: 'Under $100', min: 0, max: 100, color: '#8884d8' },
    { name: '$100-$500', min: 100, max: 500, color: '#82ca9d' },
    { name: '$500-$1000', min: 500, max: 1000, color: '#ffc658' },
    { name: 'Over $1000', min: 1000, max: Infinity, color: '#ff7300' },
  ];

  const valueDistribution = valueRanges.map(range => ({
    name: range.name,
    count: items.filter(item => {
      const value = parseFloat(item.value || '0');
      return value >= range.min && value < range.max;
    }).length,
    color: range.color
  }));

  // Warranty status
  const warrantyStatus = {
    valid: 0,
    expiring: 0,
    expired: 0,
    noWarranty: 0
  };

  items.forEach(item => {
    if (!item.warrantyEndDate) {
      warrantyStatus.noWarranty++;
      return;
    }
    
    const endDate = new Date(item.warrantyEndDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      warrantyStatus.expired++;
    } else if (daysUntilExpiry <= 30) {
      warrantyStatus.expiring++;
    } else {
      warrantyStatus.valid++;
    }
  });

  // Recent additions trend (last 30 days)
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toISOString().split('T')[0],
      count: items.filter(item => {
        const itemDate = new Date(item.createdAt).toISOString().split('T')[0];
        return itemDate === date.toISOString().split('T')[0];
      }).length
    };
  });

  if (itemsLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-muted rounded-xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground">Insights into your inventory</p>
        </div>
        
        <Button onClick={handleExportCSV}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Package className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">{items.length}</div>
            <div className="text-sm text-muted-foreground">Total Items</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">${totalValue.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Value</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{locations.length}</div>
            <div className="text-sm text-muted-foreground">Locations</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">${avgValue.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Avg. Value</div>
          </CardContent>
        </Card>
      </div>

      {/* Items by Location Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Items by Location</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={itemsByLocation}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Value Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Value Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={valueDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                dataKey="count"
                label={({ name, count }) => `${name}: ${count}`}
              >
                {valueDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Warranty Status */}
      <Card>
        <CardHeader>
          <CardTitle>Warranty Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-xl font-bold text-green-600">{warrantyStatus.valid}</div>
              <div className="text-sm text-muted-foreground">Valid</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="text-xl font-bold text-yellow-600">{warrantyStatus.expiring}</div>
              <div className="text-sm text-muted-foreground">Expiring Soon</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-xl font-bold text-red-600">{warrantyStatus.expired}</div>
              <div className="text-sm text-muted-foreground">Expired</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Package className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="text-xl font-bold text-muted-foreground">{warrantyStatus.noWarranty}</div>
              <div className="text-sm text-muted-foreground">No Warranty</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievement Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Achievement Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {achievements.map(achievement => {
              let progress = 0;
              if (achievement.type === 'items_count') {
                progress = Math.min((items.length / achievement.threshold) * 100, 100);
              } else if (achievement.type === 'total_value') {
                progress = Math.min((totalValue / achievement.threshold) * 100, 100);
              } else if (achievement.type === 'locations_count') {
                progress = Math.min((locations.length / achievement.threshold) * 100, 100);
              }

              return (
                <div key={achievement.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant={achievement.isUnlocked ? "default" : "secondary"}>
                      {achievement.icon}
                    </Badge>
                    <div>
                      <h4 className="font-medium text-foreground">{achievement.name}</h4>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-medium text-foreground">
                      {Math.round(progress)}%
                    </div>
                    {achievement.isUnlocked && (
                      <Badge variant="default" className="text-xs">Unlocked</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
