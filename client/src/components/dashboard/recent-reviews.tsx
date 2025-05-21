import { formatDistance } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, StarHalf } from "lucide-react";

interface Review {
  id: number;
  customerId: number;
  rating: number;
  comment: string;
  date: string;
  customer: {
    id: number;
    fullName: string;
  };
}

interface RecentReviewsProps {
  reviews: Review[];
  isLoading: boolean;
}

export function RecentReviews({ reviews, isLoading }: RecentReviewsProps) {
  // Function to render stars based on rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={`full-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      );
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <StarHalf key="half" className="h-4 w-4 text-yellow-400" />
      );
    }
    
    // Add empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="h-4 w-4 text-yellow-400" strokeOpacity={0.4} fillOpacity={0} />
      );
    }
    
    return stars;
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-medium">Recent Reviews</h3>
        <a href="#" className="text-primary text-sm font-medium">View All</a>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="p-4 border border-slate-100 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <Skeleton className="w-8 h-8 rounded-full mr-2" />
                  <div>
                    <Skeleton className="h-4 w-28 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-4 w-full mt-2" />
              <Skeleton className="h-4 w-3/4 mt-1" />
            </div>
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="p-4 border border-slate-100 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium mr-2">
                    {review.customer.fullName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{review.customer.fullName}</p>
                    <div className="flex text-yellow-400">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-slate-400">
                  {formatDistance(new Date(review.date), new Date(), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm text-slate-600">{review.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-slate-500">No reviews yet</p>
        </div>
      )}
    </Card>
  );
}
