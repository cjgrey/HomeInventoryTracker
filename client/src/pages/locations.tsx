import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  MapPin, 
  Plus, 
  Package, 
  ChevronRight,
  Home,
  Building,
  Folder
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Location, Item } from "@shared/schema";

export default function Locations() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newLocationName, setNewLocationName] = useState("");
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);
  const { toast } = useToast();

  const { data: locations = [], isLoading } = useQuery<Location[]>({
    queryKey: ['/api/locations'],
  });

  const { data: items = [] } = useQuery<Item[]>({
    queryKey: ['/api/items'],
  });

  const createLocationMutation = useMutation({
    mutationFn: async (data: { name: string; parentId: number | null }) => {
      const parent = data.parentId ? locations.find(l => l.id === data.parentId) : null;
      const path = parent ? `${parent.path}/${data.name}` : data.name;
      
      return apiRequest('POST', '/api/locations', {
        name: data.name,
        parentId: data.parentId,
        path,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/locations'] });
      setIsAddDialogOpen(false);
      setNewLocationName("");
      setSelectedParentId(null);
      toast({
        title: "Location created",
        description: "Your new location has been added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create location. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Build location hierarchy
  const buildLocationHierarchy = (locations: Location[]) => {
    const locationMap = new Map(locations.map(l => [l.id, { ...l, children: [] as Location[] }]));
    const roots: Location[] = [];

    locations.forEach(location => {
      const locationWithChildren = locationMap.get(location.id)!;
      if (location.parentId && locationMap.has(location.parentId)) {
        locationMap.get(location.parentId)!.children.push(locationWithChildren);
      } else {
        roots.push(locationWithChildren);
      }
    });

    return roots;
  };

  const getItemCountForLocation = (locationId: number): number => {
    return items.filter(item => item.locationId === locationId).length;
  };

  const getLocationIcon = (location: Location) => {
    const name = location.name.toLowerCase();
    if (name.includes('home') || name.includes('house')) return <Home className="w-4 h-4" />;
    if (name.includes('room') || name.includes('kitchen') || name.includes('bedroom')) return <Building className="w-4 h-4" />;
    return <Folder className="w-4 h-4" />;
  };

  const renderLocationTree = (locations: Location[], level = 0) => {
    return locations.map((location) => {
      const itemCount = getItemCountForLocation(location.id);
      
      return (
        <div key={location.id}>
          <Card className="mb-2">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3" style={{ marginLeft: level * 20 }}>
                  {getLocationIcon(location)}
                  <div>
                    <h3 className="font-medium text-foreground">{location.name}</h3>
                    <p className="text-sm text-muted-foreground">{location.path}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">
                    <Package className="w-3 h-3 mr-1" />
                    {itemCount} items
                  </Badge>
                  
                  <Link href={`/inventory?location=${location.id}`}>
                    <Button variant="ghost" size="sm">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              
              {location.description && (
                <p className="text-sm text-muted-foreground mt-2 ml-7">
                  {location.description}
                </p>
              )}
            </CardContent>
          </Card>
          
          {location.children && location.children.length > 0 && (
            <div className="ml-4">
              {renderLocationTree(location.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const handleCreateLocation = () => {
    if (!newLocationName.trim()) return;
    
    createLocationMutation.mutate({
      name: newLocationName.trim(),
      parentId: selectedParentId,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-20 bg-muted rounded-xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  const locationHierarchy = buildLocationHierarchy(locations);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Locations</h1>
          <p className="text-muted-foreground">{locations.length} locations total</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Location</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="locationName">Location Name</Label>
                <Input
                  id="locationName"
                  value={newLocationName}
                  onChange={(e) => setNewLocationName(e.target.value)}
                  placeholder="e.g., Kitchen, Living Room, Storage Box"
                />
              </div>
              
              <div>
                <Label htmlFor="parentLocation">Parent Location (Optional)</Label>
                <select
                  id="parentLocation"
                  className="w-full p-2 border border-input rounded-md bg-background"
                  value={selectedParentId || ''}
                  onChange={(e) => setSelectedParentId(e.target.value ? parseInt(e.target.value) : null)}
                >
                  <option value="">No parent (top level)</option>
                  {locations.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.path}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateLocation}
                  disabled={!newLocationName.trim() || createLocationMutation.isPending}
                  className="flex-1"
                >
                  {createLocationMutation.isPending ? 'Creating...' : 'Create Location'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Location Hierarchy */}
      <div>
        {locationHierarchy.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No locations yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first location to start organizing your inventory
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Location
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div>
            {renderLocationTree(locationHierarchy)}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Location Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{locations.length}</div>
              <div className="text-sm text-muted-foreground">Total Locations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{items.length}</div>
              <div className="text-sm text-muted-foreground">Items Stored</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
