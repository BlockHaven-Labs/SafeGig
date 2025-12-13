"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useRegistry, UserType } from "@/contexts";
import { useWallet } from "@/providers/WalletProvider";
import { Loader2, Briefcase, Users } from "lucide-react";

interface RegistrationDialogProps {
  userType: "client" | "freelancer";
}

export function RegistrationDialog({ userType }: RegistrationDialogProps) {
  const [open, setOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    location: "",
    skills: [] as string[],
    portfolioUrl: "",
    hourlyRate: "",
  });
  const [skillInput, setSkillInput] = useState("");

  const { address } = useWallet();
  const { registerUser, isRegisteredUser, isLoading } = useRegistry();
  const { toast } = useToast();

  useEffect(() => {
    checkRegistration();
  }, [address]);

  const checkRegistration = async () => {
    if (!address) {
      setIsChecking(false);
      return;
    }

    try {
      setIsChecking(true);
      const isRegistered = await isRegisteredUser(address);
      setOpen(!isRegistered); // Show dialog if not registered
    } catch (error) {
      console.error("Error checking registration:", error);
      setOpen(true); // Show dialog on error (safer to assume not registered)
    } finally {
      setIsChecking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.bio || !formData.location) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (userType === "freelancer" && formData.skills.length === 0) {
      toast({
        title: "Skills Required",
        description: "Please add at least one skill.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Determine UserType enum value
      let userTypeEnum: UserType;
      if (userType === "freelancer") {
        userTypeEnum = UserType.Freelancer;
      } else {
        userTypeEnum = UserType.Client;
      }

      // Create metadata object (in production, upload this to IPFS)
      const metadata = {
        name: formData.name,
        bio: formData.bio,
        portfolioUrl: formData.portfolioUrl,
        hourlyRate: formData.hourlyRate,
        registeredAt: new Date().toISOString(),
      };

      // For now, we'll use a JSON string as metadataURI
      // In production, you'd upload to IPFS and use the hash
      const metadataURI = `data:application/json,${encodeURIComponent(
        JSON.stringify(metadata)
      )}`;

      await registerUser(
        userTypeEnum,
        metadataURI,
        formData.location,
        formData.skills
      );

      toast({
        title: "Registration Successful!",
        description: `Welcome to SafeGig! You're now registered as a ${userType}.`,
      });

      setOpen(false);
    } catch (error: any) {
      console.error("Error registering user:", error);
      toast({
        title: "Registration Failed",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  // Show loading spinner while checking registration
  if (isChecking) {
    return (
      <Dialog open={true}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">
              Checking registration status...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto scrollbar-hide"
        showCloseButton={false}
      >
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              {userType === "client" ? (
                <Briefcase className="w-8 h-8 text-primary" />
              ) : (
                <Users className="w-8 h-8 text-primary" />
              )}
            </div>
          </div>
          <DialogTitle className="font-serif text-center text-2xl">
            Welcome to SafeGig!
          </DialogTitle>
          <DialogDescription className="text-center">
            Complete your {userType} profile to get started on the platform.
            This information will be stored on the blockchain.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              {userType === "client" ? "Company/Your Name" : "Full Name"} *
            </Label>
            <Input
              id="name"
              placeholder={
                userType === "client" ? "safegig $ clients" : "John Doe"
              }
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">
              {userType === "client"
                ? "Company Description"
                : "Professional Bio"}{" "}
              *
            </Label>
            <Textarea
              id="bio"
              placeholder={
                userType === "client"
                  ? "Tell us about your company and what kind of projects you need..."
                  : "Describe your experience, expertise, and what makes you unique..."
              }
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              placeholder="e.g., New York, USA"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              required
            />
          </div>

          {userType === "freelancer" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="skills">Skills * (Add at least one)</Label>
                <div className="flex gap-2">
                  <Input
                    id="skills"
                    placeholder="e.g., React, Python, Design"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleSkillKeyDown}
                  />
                  <Button type="button" variant="outline" onClick={addSkill}>
                    Add
                  </Button>
                </div>
                {formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.skills.map((skill) => (
                      <div
                        key={skill}
                        className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="hover:text-destructive font-bold"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="portfolioUrl">Portfolio URL (Optional)</Label>
                <Input
                  id="portfolioUrl"
                  type="url"
                  placeholder="https://yourportfolio.com"
                  value={formData.portfolioUrl}
                  onChange={(e) =>
                    handleInputChange("portfolioUrl", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Hourly Rate (ETH) (Optional)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  step="0.001"
                  placeholder="0.05"
                  value={formData.hourlyRate}
                  onChange={(e) =>
                    handleInputChange("hourlyRate", e.target.value)
                  }
                />
              </div>
            </>
          )}

          {userType === "client" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="portfolioUrl">Website (Optional)</Label>
                <Input
                  id="portfolioUrl"
                  type="url"
                  placeholder="https://safegig.com"
                  value={formData.portfolioUrl}
                  onChange={(e) =>
                    handleInputChange("portfolioUrl", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skills">
                  Skills/Role in the Company
                </Label>
                  <Input
                    id="skills"
                    placeholder="Project manager, Developer, ...?"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleSkillKeyDown}
                  />
                  <Button type="button" variant="outline" onClick={addSkill}>
                    Add
                  </Button>
              </div>
              {formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.skills.map((skill) => (
                      <div
                        key={skill}
                        className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="hover:text-destructive font-bold"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
            </>
          )}

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium">Important:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• This will create a blockchain transaction</li>
              <li>• You'll need to confirm it in your wallet</li>
              <li>• Profile data will be stored on-chain</li>
              <li>• You can update your profile later</li>
            </ul>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Registering...
              </>
            ) : (
              `Complete Registration as ${
                userType === "client" ? "Client" : "Freelancer"
              }`
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
