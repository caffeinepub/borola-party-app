import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getPhotoUrl } from "@/hooks/useQueries";
import { MapPin } from "lucide-react";
import type { Candidate, Mla, Supporter } from "../backend";

type PersonCardProps =
  | { type: "mla"; data: Mla; index: number }
  | { type: "candidate"; data: Candidate; index: number }
  | { type: "supporter"; data: Supporter; index: number };

export default function PersonCard(props: PersonCardProps) {
  const { type, data, index } = props;

  const photoUrl =
    "photo" in data && data.photo ? getPhotoUrl(data.photo) : null;

  const initials = data.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const ocidScope =
    type === "mla"
      ? "mlas"
      : type === "candidate"
        ? "candidates"
        : "supporters";

  return (
    <article
      data-ocid={`${ocidScope}.item.${index + 1}`}
      className="group bg-white rounded-xl border border-border shadow-card hover:shadow-navy hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
    >
      {/* Photo header */}
      <div className="relative h-48 bg-gradient-to-br from-navy to-navy-light overflow-hidden flex items-center justify-center">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={data.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Avatar className="w-24 h-24 ring-4 ring-saffron/30">
            <AvatarImage src="" alt={data.name} />
            <AvatarFallback className="bg-saffron text-navy font-display text-2xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        )}
        {/* Saffron corner accent */}
        <div
          className="absolute bottom-0 right-0 w-16 h-16 opacity-30"
          style={{
            background:
              "radial-gradient(circle at bottom right, oklch(var(--saffron)), transparent 70%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-display text-navy font-bold text-xl mb-2 leading-tight">
          {data.name}
        </h3>

        {type !== "supporter" && "constituency" in data && (
          <div className="flex items-center gap-1.5 mb-3">
            <MapPin className="w-3.5 h-3.5 text-saffron flex-shrink-0" />
            <Badge className="bg-saffron/10 text-saffron-dark border border-saffron/20 font-semibold text-xs px-2 py-0.5">
              {data.constituency}
            </Badge>
          </div>
        )}

        {type === "supporter" && "address" in data && (
          <div className="flex items-center gap-1.5 mb-3">
            <MapPin className="w-3.5 h-3.5 text-saffron flex-shrink-0" />
            <span className="text-muted-foreground text-sm truncate">
              {data.address}
            </span>
          </div>
        )}

        {type !== "supporter" && "bio" in data && data.bio && (
          <p className="text-muted-foreground text-sm leading-relaxed flex-1 line-clamp-3">
            {data.bio}
          </p>
        )}

        {type === "supporter" && <div className="flex-1" />}
      </div>
    </article>
  );
}
