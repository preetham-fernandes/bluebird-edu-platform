// src/app/(dashboard)/profile/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [username, setUsername] = useState("");
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [avatarChoice, setAvatarChoice] = useState<string>("air");

  // Available avatars
  const avatars = [
    { id: "air", alt: "Air Element" },
    { id: "water", alt: "Water Element" },
    { id: "fire", alt: "Fire Element" },
    { id: "earth", alt: "Earth Element" },
    { id: "spirit", alt: "Spirit Element" },
  ];

  // Load user data
  const fetchUserProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched user data:", data.user);
        
        // Set state with fetched data
        setUsername(data.user.username || "");
        setAge(data.user.age?.toString() || "");
        setGender(data.user.gender || "");
        setAvatarChoice(data.user.avatarChoice || "air");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your profile. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (session?.user) {
      fetchUserProfile();
    }
  }, [session, toast, fetchUserProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate input
      if (!username) {
        setError("Username is required");
        setIsLoading(false);
        return;
      }

      console.log("Submitting profile update:", { username, age, gender, avatarChoice });

      // First update the user profile (username, age, gender)
      const profileResponse = await fetch("/api/user/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          age: age ? parseInt(age) : undefined,
          gender,
        }),
      });

      if (!profileResponse.ok) {
        const data = await profileResponse.json();
        throw new Error(data.error || "Failed to update profile");
      }

      console.log("Profile updated successfully");

      // Then update the avatar if it has changed
      console.log("Updating avatar to:", avatarChoice);
      const avatarResponse = await fetch("/api/user/avatar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          avatarChoice,
        }),
      });

      if (!avatarResponse.ok) {
        const errorData = await avatarResponse.json();
        console.error("Avatar update error response:", errorData);
        throw new Error(errorData.error || "Failed to update avatar");
      }

      const avatarData = await avatarResponse.json();
      console.log("Avatar updated successfully:", avatarData);

      // Update the session
      await update();
      
      // Refresh user data to show the updated avatar
      fetchUserProfile();
      
      setSuccess(true);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error("Profile update error:", error);
      setError(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="container py-8">
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <Alert>
              <AlertDescription>
                Please sign in to view your profile.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex justify-center">
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>
              View and update your profile information
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-500 text-green-500 mb-6">
                  <AlertDescription>
                    Profile updated successfully!
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid gap-6 md:grid-cols-2">
                {/* Left column - Basic info */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={session.user.email || ""}
                      disabled
                      readOnly
                    />
                    <p className="text-xs text-muted-foreground">
                      Your email cannot be changed
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                                          <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Choose a username"
                      disabled={isLoading}
                      autoComplete="off"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="Your age"
                      min="18"
                      max="100"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <RadioGroup
                      value={gender}
                      onValueChange={setGender}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="profile-male" />
                        <Label htmlFor="profile-male">Male</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="profile-female" />
                        <Label htmlFor="profile-female">Female</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="profile-other" />
                        <Label htmlFor="profile-other">Other</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                {/* Right column - Avatar selection */}
                <div className="space-y-4">
                  <Label>Select Your Avatar</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Choose an avatar to represent you in the community.
                  </p>
                  
                  <div className="grid grid-cols-3 gap-4 md:grid-cols-5">
                    {avatars.map((avatar) => (
                      <div
                        key={avatar.id}
                        onClick={() => setAvatarChoice(avatar.id)}
                        className={`relative cursor-pointer rounded-lg p-2 border-2 transition-all ${
                          avatarChoice === avatar.id
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
                        
                        {avatarChoice === avatar.id && (
                          <div className="absolute inset-0 flex items-center justify-center bg-primary/10 rounded-lg">
                            <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                              ✓
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground">
                      Your current avatar: <span className="font-medium capitalize">{avatarChoice || "None selected"}</span>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  "Save All Changes"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}