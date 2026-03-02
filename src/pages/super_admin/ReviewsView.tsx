
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
          <div key={review.id} className="bg-[#0b1220] border border-[#1f2937] rounded-2xl p-6 hover:border-[#f37321]/30 transition-all shadow-xl group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#0f172a] border border-[#1f2937] flex items-center justify-center text-[#f37321]">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-[#e6eef8] group-hover:text-[#f37321] transition-colors">{review.employeeName}</h3>
                  <div className="flex items-center gap-2 text-xs text-[#9aa8bd]">
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

            <div className="mt-4 p-4 bg-[#0f172a] rounded-xl border border-[#1f2937]">
              <div className="flex items-start gap-3">
                <MessageSquare size={16} className="text-[#9aa8bd] mt-1 shrink-0" />
                <p className="text-sm text-[#9aa8bd] leading-relaxed italic">"{review.feedback}"</p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-4 text-[10px] font-bold text-[#9aa8bd] uppercase tracking-widest">
              <div className="flex items-center gap-1.5">
                <Calendar size={12} />
                {review.cycle}
              </div>
              <div className="w-1 h-1 bg-[#1f2937] rounded-full"></div>
              <div>Submitted {review.date}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
