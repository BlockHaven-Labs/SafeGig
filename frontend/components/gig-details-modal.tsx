"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  DollarSign,
  MapPin,
  Star,
  MessageCircle,
  Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Gig {
  id: number;
  title: string;
  description: string;
  price: string;
  currency: string;
  deadline: string;
  category: string;
  client: string;
  postedDate: string;
  requirements?: string[];
  skills?: string[];
  clientInfo?: {
    name: string;
    avatar: string;
    rating: number;
    totalJobs: number;
    location: string;
    memberSince: string;
  };
}

interface GigDetailsModalProps {
  gig: Gig | null;
  isOpen: boolean;
  onClose: () => void;
  onAcceptGig: (gigId: number) => void;
  isLoading: boolean;
}

export function GigDetailsModal({
  gig,
  isOpen,
  onClose,
  onAcceptGig,
  isLoading,
}: GigDetailsModalProps) {
  const router = useRouter();
  const [requestSent, setRequestSent] = useState(false);

  if (!gig) return null;

  const handleAcceptGig = () => {
    setRequestSent(true);
    onAcceptGig(gig.id);
  };

  const handleViewProfile = () => {
    router.push(`/client/${gig.client}`);
  };

  if (!gig) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">
              Loading client details...
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif">{gig.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Client Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Avatar
                  className="w-16 h-16 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                  onClick={handleViewProfile}
                >
                  <AvatarImage
                    src={gig.clientInfo?.avatar || "/placeholder.svg"}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {gig.clientInfo?.name?.charAt(0) ||
                      gig.client.slice(2, 4).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3
                    className="font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                    onClick={handleViewProfile}
                  >
                    {gig.clientInfo?.name ||
                      `Client ${gig.client.slice(0, 6)}...${gig.client.slice(
                        -4
                      )}`}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{gig.clientInfo?.rating || 4.8}</span>
                    </div>
                    <span>•</span>
                    <span>{gig.clientInfo?.totalJobs || 12} jobs posted</span>
                    {gig.clientInfo?.location && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{gig.clientInfo.location}</span>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleViewProfile}
                    >
                      View Profile
                    </Button>
                    <Button size="sm" variant="ghost">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Contact
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gig Details */}
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">
                Project Description
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                {gig.description}
              </p>
            </div>

            {gig.requirements && (
              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  Requirements
                </h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {gig.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {gig.skills && (
              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  Required Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {gig.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Project Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="font-semibold text-foreground">
                  {gig.price} {gig.currency}
                </div>
                <div className="text-xs text-muted-foreground">Fixed Price</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="font-semibold text-foreground">
                  {gig.deadline}
                </div>
                <div className="text-xs text-muted-foreground">
                  Delivery Date
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="font-semibold text-foreground">
                  {gig.postedDate}
                </div>
                <div className="text-xs text-muted-foreground">Posted</div>
              </div>
            </div>
            <div>
              <Badge
                variant="outline"
                className="text-primary border-primary/20"
              >
                {gig.category}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              className="flex-1"
              onClick={handleAcceptGig}
              disabled={isLoading || requestSent}
            >
              {requestSent ? "Request Sent" : "Send Request"}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
