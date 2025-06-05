import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import '../styles/Rating.css'; // We'll create this CSS file later

const RatingPage = () => {
  const { t } = useTranslation();
  const [waiterRating, setWaiterRating] = useState<number>(0);
  const [foodRating, setFoodRating] = useState<number>(0);
  const [comments, setComments] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const StarRating = ({ rating, setRating, disabled }: { rating: number, setRating: (rating: number) => void, disabled: boolean }) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={star <= rating ? 'star-selected' : 'star-empty'}
            onClick={() => !disabled && setRating(star)}
            disabled={disabled}
            aria-label={`${star} ${t('stars')}`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitMessage(null);
    setSubmitError(null);

    if (waiterRating === 0 || foodRating === 0) {
      setSubmitError(t('rating_page.please_rate_both_service_food', 'Please rate both waiter service and food.'));
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase
      .from('service_ratings')
      .insert([{
        waiter_rating: waiterRating,
        food_rating: foodRating,
        comments: comments || null,
      }]);

    setIsSubmitting(false);

    if (error) {
      console.error('Error submitting rating:', error);
      setSubmitError(t('rating_page.error_submitting', 'There was an error submitting your rating. Please try again.'));
    } else {
      setSubmitMessage(t('rating_page.thank_you_feedback', 'Thank you for your feedback!'));
      // Reset form
      setWaiterRating(0);
      setFoodRating(0);
      setComments('');
      setTimeout(() => setSubmitMessage(null), 5000); // Clear message after 5s
    }
  };

  return (
    <div className="rating-page-container">
      <div className="rating-form-card">
        <h1>{t('rating_page.title', 'Rate Our Service')}</h1>
        {submitMessage && <p className="submit-message success">{submitMessage}</p>}
        {submitError && <p className="submit-message error">{submitError}</p>}

        {!submitMessage && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="waiter-rating">{t('rating_page.waiter_service', 'Waiter Service')}</label>
              <StarRating rating={waiterRating} setRating={setWaiterRating} disabled={isSubmitting} />
            </div>

            <div className="form-group">
              <label htmlFor="food-rating">{t('rating_page.food_quality', 'Food Quality')}</label>
              <StarRating rating={foodRating} setRating={setFoodRating} disabled={isSubmitting} />
            </div>

            <div className="form-group">
              <label htmlFor="comments">{t('rating_page.additional_comments', 'Additional Comments (Optional)')}</label>
              <textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={4}
                placeholder={t('rating_page.comments_placeholder', 'Let us know your thoughts...')}
                disabled={isSubmitting}
              />
            </div>

            <button type="submit" className="submit-button" disabled={isSubmitting}>
              {isSubmitting ? t('rating_page.submitting', 'Submitting...') : t('rating_page.submit_rating', 'Submit Rating')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default RatingPage; 