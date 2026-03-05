
import React from 'react';
import { MOCK_REVIEWS } from '../../constants.js';
import { SectionHeader, Badge, StarRating } from '../../components/super_admin/UI.tsx';
import { MessageSquare, Calendar, User } from 'lucide-react';

export const ReviewsView = () => {
  return (
    <div className="space-y-6">
      <SectionHeader title="Reviews & Ratings" description="Detailed performance feedback and cycle management." />

      <div className="grid grid-cols-1 gap-4">
        {MOCK_REVIEWS.map((review) => (
          <div key={review.id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-blue-200 transition-all shadow-xl group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-blue-600">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{review.employeeName}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="font-semibold">Reviewer:</span> {review.reviewerName}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-start md:items-end gap-2">
                <StarRating rating={review.rating} />
                <Badge color={review.status === 'completed' ? 'green' : review.status === 'pending' ? 'yellow' : 'blue'}>
                  {review.status.toUpperCase()}
                </Badge>
              </div>
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-start gap-3">
                <MessageSquare size={16} className="text-gray-400 mt-1 shrink-0" />
                <p className="text-sm text-gray-500 leading-relaxed italic">"{review.feedback}"</p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              <div className="flex items-center gap-1.5">
                <Calendar size={12} />
                {review.cycle}
              </div>
              <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
              <div>Submitted {review.date}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
