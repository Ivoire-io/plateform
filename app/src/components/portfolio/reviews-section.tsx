"use client";

import { Loader2, Star } from "lucide-react";
import { useEffect, useState } from "react";

// ─── Types ───

interface ReviewItem {
  id: string;
  project_ref: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer: {
    full_name: string;
    slug: string;
    avatar_url: string | null;
  };
}

interface ReviewsData {
  reviews: ReviewItem[];
  rating: {
    avg_rating: number;
    review_count: number;
  };
}

interface ReviewsSectionProps {
  slug: string;
}

// ─── Star rating display ───

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = rating >= i;
        const half = !filled && rating >= i - 0.5;
        return (
          <Star
            key={i}
            size={size}
            className={
              filled
                ? "text-yellow-400"
                : half
                  ? "text-yellow-400"
                  : "text-gray-600"
            }
            fill={filled ? "currentColor" : half ? "currentColor" : "none"}
            strokeWidth={filled || half ? 0 : 1.5}
          />
        );
      })}
    </div>
  );
}

// ─── Date formatter ───

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// ─── Component ───

export function ReviewsSection({ slug }: ReviewsSectionProps) {
  const [data, setData] = useState<ReviewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchReviews() {
      setLoading(true);
      setError(false);

      try {
        const res = await fetch(`/api/profiles/${encodeURIComponent(slug)}/reviews`);
        if (!res.ok) throw new Error("Fetch failed");
        const json = await res.json();
        if (cancelled) return;
        setData({
          reviews: json.reviews ?? [],
          rating: json.rating ?? { avg_rating: 0, review_count: 0 },
        });
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchReviews();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground text-sm">
          Impossible de charger les avis.
        </p>
      </div>
    );
  }

  const { reviews, rating } = data;

  if (reviews.length === 0) {
    return (
      <section className="py-8">
        <h2 className="text-xl font-bold mb-4">Avis</h2>
        <p className="text-muted-foreground text-sm">
          Aucun avis pour le moment.
        </p>
      </section>
    );
  }

  return (
    <section className="py-8">
      <h2 className="text-xl font-bold mb-4">Avis</h2>

      {/* ── Aggregate rating ── */}
      <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-surface border border-border">
        <div className="text-center">
          <p className="text-3xl font-bold">{rating.avg_rating.toFixed(1)}</p>
          <StarRating rating={rating.avg_rating} size={18} />
          <p className="text-xs text-muted-foreground mt-1">
            {rating.review_count} avis
          </p>
        </div>
      </div>

      {/* ── Review cards ── */}
      <div className="flex flex-col gap-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="p-4 rounded-xl bg-surface border border-border"
          >
            <div className="flex items-start gap-3">
              {/* Reviewer avatar */}
              {review.reviewer.avatar_url ? (
                <img
                  src={review.reviewer.avatar_url}
                  alt={review.reviewer.full_name}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-orange/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold">
                    {review.reviewer.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              <div className="flex-1 min-w-0">
                {/* Reviewer name + rating */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <span className="font-semibold text-sm">
                      {review.reviewer.full_name}
                    </span>
                    {review.project_ref && (
                      <span className="text-muted-foreground text-xs ml-2">
                        -- {review.project_ref}
                      </span>
                    )}
                  </div>
                  <StarRating rating={review.rating} size={14} />
                </div>

                {/* Comment */}
                {review.comment && (
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {review.comment}
                  </p>
                )}

                {/* Date */}
                <p className="text-xs text-muted-foreground mt-2">
                  {formatDate(review.created_at)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
