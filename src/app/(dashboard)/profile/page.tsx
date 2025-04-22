// src/app/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
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

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [username, setUsername] = useState(
    session?.user?.name?.split(" ")[0]?.toLowerCase() || ""
  );
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<string>("");

  // Load user data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch("/api/user/profile");
        if (response.ok) {
          const data = await response.json();
          setUsername(data.user.username || username);
          setAge(data.user.age?.toString() || "");
          setGender(data.user.gender || "");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    if (session?.user) {
      fetchUserProfile();
    }
  }, [session, username]);

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

      // Send data to the API
      const response = await fetch("/api/user/profile", {
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

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update profile");
      }

      // Update the session
      await update();
      setSuccess(true);
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
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>
              View and update your profile information
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-500 text-green-500">
                  <AlertDescription>
                    Profile updated successfully!
                  </AlertDescription>
                </Alert>
              )}

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
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="prefer-not-to-say"
                      id="profile-prefer-not-to-say"
                    />
                    <Label htmlFor="profile-prefer-not-to-say">
                      Prefer not to say
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>

            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}