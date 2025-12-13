"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useJobs, useEscrow, useRegistry } from "@/contexts";
import { Checkbox } from "@/components/ui/checkbox";
import { useWallet } from "@/providers/WalletProvider";

interface PostGigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void | Promise<void>;
}

export function PostGigDialog({
  open,
  onOpenChange,
  onSuccess,
}: PostGigDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: "",
    deadline: "",
    category: "",
    skills: [] as string[],
    isUrgent: false,
  });

  const [skillInput, setSkillInput] = useState("");

  const { postJob, isLoading } = useJobs();
  const { meetsMinimumUSD } = useEscrow();
  const { isRegisteredUser, getUserType } = useRegistry();
  const { address } = useWallet();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !formData.title ||
      !formData.description ||
      !formData.budget ||
      !formData.deadline
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to post a job.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Checking registration for address:", address);
      const isRegistered = await isRegisteredUser(address!);
      console.log("Is registered:", isRegistered);
      if (!isRegistered) {
        toast({
          title: "Registration Required",
          description: "You must register as a client before posting jobs.",
          variant: "destructive",
        });
        return;
      }

      const userType = await getUserType(address!);
      if (userType !== 2 && userType !== 3) {
        // 2 = Client, 3 = Both
        toast({
          title: "Client Account Required",
          description: "You must be registered as a client to post jobs.",
          variant: "destructive",
        });
        return;
      }

      // Check if budget meets minimum USD requirement ($5)
      console.log("Checking budget:", formData.budget);
      const meetsMin = await meetsMinimumUSD(formData.budget);
      console.log("Meets minimum:", meetsMin);
      if (!meetsMin) {
        toast({
          title: "Budget Too Low",
          description: "Budget must be at least $5 USD equivalent in ETH.",
          variant: "destructive",
        });
        return;
      }

      // Convert deadline to Unix timestamp
      const deadlineDate = new Date(formData.deadline);
      const deadlineTimestamp = Math.floor(deadlineDate.getTime() / 1000);
      console.log("Deadline timestamp:", deadlineTimestamp);

      // Validate deadline is in the future
      if (deadlineTimestamp <= Math.floor(Date.now() / 1000)) {
        toast({
          title: "Invalid Deadline",
          description: "Deadline must be in the future.",
          variant: "destructive",
        });
        return;
      }
      console.log("Posting job with data:", {
        title: formData.title,
        description: formData.description,
        budget: formData.budget,
        deadline: deadlineTimestamp,
        requiredSkills: formData.skills,
        tags: [formData.category],
        isUrgent: formData.isUrgent,
      });

      // Post the job to the blockchain
      await postJob({
        title: formData.title,
        description: formData.description,
        metadataURI: "", // You can upload to IPFS here if needed
        budget: formData.budget,
        deadline: deadlineTimestamp,
        requiredSkills: formData.skills,
        tags: [formData.category],
        isUrgent: formData.isUrgent,
      });

      toast({
        title: "Job Posted Successfully",
        description:
          "Your job has been posted and is now visible to freelancers.",
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        budget: "",
        deadline: "",
        category: "",
        skills: [],
        isUrgent: false,
      });
      setSkillInput("");

      onOpenChange(false);

      // Call onSuccess callback if provided
      if (onSuccess) {
        await onSuccess();
      }
    } catch (error: any) {
      console.error("Error creating job:", error);

      // More detailed error message
      let errorMessage = "Please make sure your wallet is connected and try again."
      
      if (error.message) {
        if (error.message.includes("user denied")) {
          errorMessage = "Transaction was rejected by user."
        } else if (error.message.includes("insufficient funds")) {
          errorMessage = "Insufficient funds in your wallet."
        } else if (error.message.includes("execution reverted")) {
          errorMessage = "Transaction reverted. You may not be registered correctly in the JobManager contract. Check the console for details."
        } else {
          errorMessage = error.message
        }
      }


      toast({
        title: "Error Creating Job",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif">Post a New Job</DialogTitle>
          <DialogDescription>
            Create a new freelance job posting. Your job will be visible to all
            freelancers on the platform.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Build a React Landing Page"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe your project requirements, deliverables, and any specific skills needed..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget">Budget (ETH) *</Label>
            <Input
              id="budget"
              type="number"
              step="0.001"
              placeholder="0.5"
              value={formData.budget}
              onChange={(e) => handleInputChange("budget", e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Minimum: $5 USD equivalent
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline *</Label>
            <Input
              id="deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => handleInputChange("deadline", e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleInputChange("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Web Development">Web Development</SelectItem>
                <SelectItem value="Mobile Development">
                  Mobile Development
                </SelectItem>
                <SelectItem value="Design">Design</SelectItem>
                <SelectItem value="Writing">Writing</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Blockchain">Blockchain</SelectItem>
                <SelectItem value="Data Science">Data Science</SelectItem>
                <SelectItem value="DevOps">DevOps</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Required Skills</Label>
            <div className="flex gap-2">
              <Input
                id="skills"
                placeholder="e.g., React, TypeScript"
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
                    className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:text-destructive"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isUrgent"
              checked={formData.isUrgent}
              onCheckedChange={(checked) =>
                handleInputChange("isUrgent", checked as boolean)
              }
            />
            <Label
              htmlFor="isUrgent"
              className="text-sm font-normal cursor-pointer"
            >
              Mark as urgent (will be highlighted to freelancers)
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Posting..." : "Post Job"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
