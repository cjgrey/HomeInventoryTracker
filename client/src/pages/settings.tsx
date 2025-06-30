import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Palette, 
  Download, 
  Camera, 
  Bell, 
  Shield, 
  Smartphone,
  Moon,
  Sun,
  Trophy,
  Database,
  HelpCircle,
  ExternalLink
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(true);
  const [autoBackup, setAutoBackup] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(true);

  const { data: achievements = [] } = useQuery({
    queryKey: ['/api/achievements'],
  });

  const handleInstallPWA = () => {
    // This would trigger PWA installation
    toast({
      title: "Install Vault",
      description: "Look for the install prompt in your browser.",
    });
  };

  const handleExportData = async () => {
    try {
      const response = await fetch('/api/export/csv');
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vault-backup-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Export successful",
        description: "Your data has been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting your data.",
        variant: "destructive",
      });
    }
  };

  const themeOptions = [
    { value: 'minimalist', label: 'Minimalist White', description: 'Clean and bright' },
    { value: 'classic', label: 'Classic Ledger', description: 'Vintage brown theme' },
    { value: 'collector', label: "Collector's Dark", description: 'Dark with gold accents' },
  ];

  const unlockedAchievements = achievements.filter(a => a.isUnlocked).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Customize your Vault experience</p>
      </div>

      {/* Theme Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Palette className="w-5 h-5 mr-2" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-base font-medium">Theme</Label>
            <p className="text-sm text-muted-foreground mb-4">
              Choose your preferred visual style
            </p>
            
            <div className="grid gap-3">
              {themeOptions.map((option) => (
                <div key={option.value}>
                  <Button
                    variant={theme === option.value ? "default" : "outline"}
                    className="w-full justify-start h-auto p-4"
                    onClick={() => setTheme(option.value as any)}
                  >
                    <div className="text-left">
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm opacity-70">{option.description}</div>
                    </div>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* App Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Smartphone className="w-5 h-5 mr-2" />
            App Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Install App</Label>
              <p className="text-sm text-muted-foreground">
                Install Vault as a PWA for better performance
              </p>
            </div>
            <Button variant="outline" onClick={handleInstallPWA}>
              <Download className="w-4 h-4 mr-2" />
              Install
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get reminders about warranty expiration
              </p>
            </div>
            <Switch
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Camera Access</Label>
              <p className="text-sm text-muted-foreground">
                Allow camera for barcode scanning and photos
              </p>
            </div>
            <Switch
              checked={cameraPermission}
              onCheckedChange={setCameraPermission}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto Backup</Label>
              <p className="text-sm text-muted-foreground">
                Automatically sync data to cloud storage
              </p>
            </div>
            <Switch
              checked={autoBackup}
              onCheckedChange={setAutoBackup}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="w-5 h-5 mr-2" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Export Data</Label>
              <p className="text-sm text-muted-foreground">
                Download your inventory as CSV
              </p>
            </div>
            <Button variant="outline" onClick={handleExportData}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <Separator />

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium text-foreground mb-2">Storage Info</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Data stored locally on your device</p>
              <p>• Backup available via CSV export</p>
              <p>• No data shared with third parties</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="w-5 h-5 mr-2" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">
                You've unlocked {unlockedAchievements} of {achievements.length} achievements
              </p>
            </div>
            <Badge variant="secondary">
              {unlockedAchievements}/{achievements.length}
            </Badge>
          </div>

          <div className="space-y-2">
            {achievements.slice(0, 3).map(achievement => (
              <div key={achievement.id} className="flex items-center justify-between p-2 rounded-lg border border-border">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{achievement.icon}</span>
                  <div>
                    <p className="font-medium text-sm">{achievement.name}</p>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  </div>
                </div>
                {achievement.isUnlocked && (
                  <Badge variant="default" className="text-xs">Unlocked</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Help & Support */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <HelpCircle className="w-5 h-5 mr-2" />
            Help & Support
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full justify-between">
            <span>User Guide</span>
            <ExternalLink className="w-4 h-4" />
          </Button>
          
          <Button variant="outline" className="w-full justify-between">
            <span>Privacy Policy</span>
            <ExternalLink className="w-4 h-4" />
          </Button>
          
          <Button variant="outline" className="w-full justify-between">
            <span>Terms of Service</span>
            <ExternalLink className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card>
        <CardContent className="p-4 text-center text-sm text-muted-foreground">
          <p>Vault v1.0.0</p>
          <p>Built with ❤️ for inventory management</p>
        </CardContent>
      </Card>
    </div>
  );
}
