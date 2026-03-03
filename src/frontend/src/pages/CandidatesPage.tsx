import PersonCard from "@/components/PersonCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAllCandidates } from "@/hooks/useQueries";
import { Users, Vote } from "lucide-react";

export default function CandidatesPage() {
  const { data: candidates, isLoading, isError } = useGetAllCandidates();

  return (
    <div data-ocid="candidates.page" className="min-h-screen font-body">
      {/* Page Header */}
      <section className="bg-navy py-16 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-45deg, oklch(var(--saffron)) 0, oklch(var(--saffron)) 1px, transparent 0, transparent 50%)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-saffron/20 border border-saffron/40 rounded-full px-4 py-1.5 mb-4">
            <Vote className="w-4 h-4 text-saffron" />
            <span className="text-saffron text-xs font-bold tracking-widest uppercase">
              Election 2026
            </span>
          </div>
          <h1 className="font-display text-white text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">
            Our Candidates
          </h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">
            Meet the Borola Party candidates standing for the upcoming
            elections.
          </p>
        </div>
      </section>

      {/* Saffron accent */}
      <div className="h-1 bg-saffron" />

      {/* Content */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading && (
            <div
              data-ocid="candidates.loading_state"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {["1", "2", "3", "4", "5", "6", "7", "8"].map((k) => (
                <div
                  key={k}
                  className="rounded-xl overflow-hidden border border-border"
                >
                  <Skeleton className="h-48 w-full" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {isError && (
            <div
              data-ocid="candidates.error_state"
              className="text-center py-16"
            >
              <p className="text-destructive font-semibold">
                Failed to load candidates. Please try again.
              </p>
            </div>
          )}

          {!isLoading && !isError && candidates && candidates.length === 0 && (
            <div
              data-ocid="candidates.empty_state"
              className="text-center py-24 flex flex-col items-center"
            >
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-5">
                <Users className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="font-display text-navy text-xl font-bold mb-2">
                No Candidates Listed Yet
              </h3>
              <p className="text-muted-foreground max-w-sm">
                Candidate profiles will be announced here. Stay tuned!
              </p>
            </div>
          )}

          {!isLoading && !isError && candidates && candidates.length > 0 && (
            <div
              data-ocid="candidates.list"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {candidates.map((candidate, i) => (
                <PersonCard
                  key={candidate.id.toString()}
                  type="candidate"
                  data={candidate}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
