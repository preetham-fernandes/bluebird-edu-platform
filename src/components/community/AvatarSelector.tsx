// src/components/community/AvatarSelector.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface AvatarSelectorProps {
  currentAvatar: string | null;
  onAvatarChange?: (avatar: string) => void;
}

export default function AvatarSelector({ 
  currentAvatar, 
  onAvatarChange 
}: AvatarSelectorProps) {
  const [selectedAvatar, setSelectedAvatar] = useState<string>(currentAvatar || "air");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const avatars = [
    { id: "air", alt: "Air Element" },
    { id: "water", alt: "Water Element" },
    { id: "fire", alt: "Fire Element" },
    { id: "earth", alt: "Earth Element" },
    { id: "spirit", alt: "Spirit Element" },
  ];

  const handleSelectAvatar = (avatarId: string) => {
    setSelectedAvatar(avatarId);
  };

  const handleSave = async () => {
    if (selectedAvatar === currentAvatar) return;
    
    setIsLoading(true);

    try {
      const response = await fetch("/api/user/avatar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          avatarChoice: selectedAvatar,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update avatar");
      }

      // Get the updated data
      const data = await response.json();
      console.log("Avatar updated successfully:", data);

      toast({
        title: "Avatar updated",
        description: "Your avatar has been updated successfully.",
      });

      if (onAvatarChange) {
        onAvatarChange(selectedAvatar);
      }
    } catch (error) {
      console.error("Error updating avatar:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update avatar. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-4">
        {avatars.map((avatar) => (
          <div
            key={avatar.id}
            onClick={() => handleSelectAvatar(avatar.id)}
            className={`relative cursor-pointer rounded-lg p-2 border-2 transition-all ${
              selectedAvatar === avatar.id
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            }`}
          >
            <Image
              src={`/avatars/${avatar.id}.svg`}
              width={64}
              height={64}
              alt={avatar.alt}
              className="rounded-full mx-auto"
            />
            <p className="text-xs text-center mt-1 font-medium capitalize">{avatar.id}</p>
          </div>
        ))}
      </div>

      <Button 
        onClick={handleSave} 
        disabled={isLoading || selectedAvatar === currentAvatar}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Avatar"
        )}
      </Button>
    </div>
  );
}