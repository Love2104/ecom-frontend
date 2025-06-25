import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '../ui/Button';
import { Separator } from '../ui/Separator';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/Avatar';

interface Review {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  rating: number;
  date: string;
  comment: string;
}

interface ProductReviewsProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

const ProductReviews = ({ reviews, averageRating, totalReviews }: ProductReviewsProps) => {
  const [visibleReviews, setVisibleReviews] = useState(3);
  
  const loadMoreReviews = () => {
    setVisibleReviews((prev) => Math.min(prev + 3, reviews.length));
  };
  
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        size={16}
        className={`${
          index < rating
            ? 'text-yellow-400 fill-yellow-400'
            : 'text-muted-foreground'
        }`}
      />
    ));
  };
  
  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-6">Customer Reviews</h2>
      
      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 mb-6">
        <div className="flex items-center space-x-2">
          <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
          <div className="flex flex-col">
            <div className="flex">{renderStars(Math.round(averageRating))}</div>
            <div className="text-sm text-muted-foreground">
              Based on {totalReviews} reviews
            </div>
          </div>
        </div>
        
        <div className="md:ml-auto">
          <Button variant="outline">Write a Review</Button>
        </div>
      </div>
      
      <Separator className="my-6" />
      
      {reviews.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.slice(0, visibleReviews).map((review) => (
            <div key={review.id} className="space-y-4">
              <div className="flex justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    {review.user.avatar && (
                      <AvatarImage src={review.user.avatar} alt={review.user.name} />
                    )}
                    <AvatarFallback>
                      {review.user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{review.user.name}</div>
                    <div className="text-sm text-muted-foreground">{review.date}</div>
                  </div>
                </div>
                <div className="flex">{renderStars(review.rating)}</div>
              </div>
              <p className="text-foreground">{review.comment}</p>
              <Separator />
            </div>
          ))}
          
          {visibleReviews < reviews.length && (
            <div className="text-center pt-4">
              <Button variant="outline" onClick={loadMoreReviews}>
                Load More Reviews
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductReviews;