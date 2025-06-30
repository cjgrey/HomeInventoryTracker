import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Star, Trophy, Crown, Diamond } from "lucide-react";
import type { Achievement } from "@shared/schema";

interface AchievementBannerProps {
  achievement: Achievement;
}

const iconMap = {
  star: Star,
  trophy: Trophy,
  crown: Crown,
  diamond: Diamond,
};

export default function AchievementBanner({ achievement }: AchievementBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const IconComponent = iconMap[achievement.icon as keyof typeof iconMap] || Star;

  return (
    <Card className="bg-gradient-to-r from-vault-gold to-yellow-500 text-white achievement-pulse">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <IconComponent className="w-6 h-6" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm">Achievement Unlocked!</div>
            <div className="text-xs opacity-90 truncate">
              "{achievement.name}" - {achievement.description}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="text-white/80 hover:text-white hover:bg-white/10 p-1 h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
