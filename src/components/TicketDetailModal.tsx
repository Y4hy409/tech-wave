import { StatusBadge, SLATimer } from "@/components/FixoraUI";
import { X, Clock, User, Tag, CheckCircle, AlertTriangle, Star } from "lucide-react";
import { useState } from "react";

interface TimelineEvent {
  label: string;
  time: string;
  done: boolean;
  escalated?: boolean;
}

interface Ticket {
  id: string;
  title: string;
  category: string;
  status: "open" | "in_progress" | "escalated" | "resolved" | "closed";
  priority: string;
  date: string;
  slaHours: number;
  slaTotalHours: number;
  description: string;
  timeline: TimelineEvent[];
  images?: string[];
  rating?: number;
}

interface TicketDetailModalProps {
  ticket: Ticket;
  onClose: () => void;
}

export function TicketDetailModal({ ticket, onClose }: TicketDetailModalProps) {
  const [rating, setRating] = useState(ticket.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [rated, setRated] = useState(!!ticket.rating);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up shadow-lg border border-border">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-5 py-4 flex items-start justify-between z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-muted-foreground">{ticket.id}</span>
              <StatusBadge status={ticket.status} />
            </div>
            <p className="font-bold text-foreground pr-8">{ticket.title}</p>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Info chips */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 bg-muted rounded-lg px-3 py-1.5 text-xs text-muted-foreground">
              <Tag className="w-3.5 h-3.5" />
              {ticket.category}
            </div>
            <div className="flex items-center gap-1.5 bg-muted rounded-lg px-3 py-1.5 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              {ticket.date}
            </div>
            <div className="flex items-center gap-1.5 bg-muted rounded-lg px-3 py-1.5 text-xs text-muted-foreground">
              <User className="w-3.5 h-3.5" />
              Flat 3B
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Description</p>
            <p className="text-sm text-foreground leading-relaxed">{ticket.description}</p>
          </div>

          {!!ticket.images?.length && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Images</p>
              <div className="grid grid-cols-2 gap-2">
                {ticket.images.map((image, index) => (
                  <img
                    key={`${ticket.id}-img-${index}`}
                    src={image}
                    alt={`Complaint ${index + 1}`}
                    className="h-28 w-full rounded-lg border border-border object-cover"
                  />
                ))}
              </div>
            </div>
          )}

          {/* SLA */}
          {(ticket.status === "open" || ticket.status === "in_progress" || ticket.status === "escalated") && (
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">SLA Status</p>
              <SLATimer hoursRemaining={ticket.slaHours} totalHours={ticket.slaTotalHours} />
            </div>
          )}

          {/* Escalation banner */}
          {ticket.status === "escalated" && (
            <div className="bg-escalation/10 border border-escalation/30 rounded-xl p-3.5 flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-escalation flex-shrink-0" />
              <p className="text-sm text-foreground">
                This ticket has been <strong className="text-escalation">auto-escalated</strong> to the society committee due to SLA breach.
              </p>
            </div>
          )}

          {/* Timeline */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Timeline</p>
            <div className="space-y-0">
              {ticket.timeline.map((event, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      event.escalated
                        ? "bg-escalation border-escalation"
                        : event.done
                        ? "bg-success border-success"
                        : "bg-muted border-border"
                    }`}>
                      {event.done ? (
                        <CheckCircle className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                      )}
                    </div>
                    {i < ticket.timeline.length - 1 && (
                      <div className={`w-0.5 h-8 mt-0.5 ${event.done ? "bg-success/30" : "bg-border"}`} />
                    )}
                  </div>
                  <div className="pb-6">
                    <p className={`text-sm font-medium ${event.escalated ? "text-escalation" : event.done ? "text-foreground" : "text-muted-foreground"}`}>
                      {event.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{event.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rating */}
          {ticket.status === "resolved" && (
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Rate Your Experience</p>
              {rated ? (
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-5 h-5 ${s <= rating ? "fill-warning text-warning" : "text-muted"}`} />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">Thank you for your feedback!</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        onMouseEnter={() => setHoverRating(s)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => { setRating(s); setRated(true); }}
                        className="transition-transform hover:scale-110"
                      >
                        <Star className={`w-7 h-7 transition-colors ${s <= (hoverRating || rating) ? "fill-warning text-warning" : "text-muted"}`} />
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">How satisfied are you with the resolution?</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
