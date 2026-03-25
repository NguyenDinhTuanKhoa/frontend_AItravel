'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { userApi } from '../../lib/api';

const travelStyles = [
  { id: 'beach', icon: '🏖️', label: 'Biển & Đảo', desc: 'Nghỉ dưỡng, tắm biển' },
  { id: 'mountain', icon: '🏔️', label: 'Núi & Cao nguyên', desc: 'Trekking, khám phá' },
  { id: 'city', icon: '🌆', label: 'Thành phố', desc: 'Mua sắm, nightlife' },
  { id: 'historical', icon: '🏛️', label: 'Di tích & Văn hóa', desc: 'Lịch sử, kiến trúc' },
  { id: 'countryside', icon: '🌾', label: 'Nông thôn', desc: 'Yên bình, homestay' },
  { id: 'adventure', icon: '🎢', label: 'Mạo hiểm', desc: 'Thể thao, cảm giác mạnh' },
];

const budgetOptions = [
  { id: 'budget', label: 'Tiết kiệm', desc: 'Dưới 2 triệu/người', icon: '💰' },
  { id: 'mid-range', label: 'Trung bình', desc: '2-5 triệu/người', icon: '💵' },
  { id: 'luxury', label: 'Cao cấp', desc: 'Trên 5 triệu/người', icon: '💎' },
];

const interests = [
  { id: 'food', icon: '🍜', label: 'Ẩm thực' },
  { id: 'photography', icon: '📸', label: 'Chụp ảnh' },
  { id: 'nature', icon: '🌿', label: 'Thiên nhiên' },
  { id: 'shopping', icon: '🛍️', label: 'Mua sắm' },
  { id: 'nightlife', icon: '🎉', label: 'Nightlife' },
  { id: 'wellness', icon: '🧘', label: 'Spa & Wellness' },
  { id: 'family', icon: '👨‍👩‍👧‍👦', label: 'Gia đình' },
  { id: 'romantic', icon: '💑', label: 'Lãng mạn' },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedBudget, setSelectedBudget] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggleStyle = (id: string) => {
    setSelectedStyles(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleComplete = async () => {
    setLoading(true);
    await userApi.updateProfile({
      preferences: {
        travelStyle: selectedStyles,
        budget: selectedBudget,
        interests: selectedInterests
      }
    });
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-violet-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Image src="/logowebsite.png" alt="Logo" width={60} height={60} className="mx-auto rounded-xl mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Chào mừng đến với TravelAI! 🎉
          </h1>
          <p className="text-gray-600">
            Hãy cho chúng tôi biết sở thích của bạn để nhận gợi ý phù hợp nhất
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                s === step ? 'w-12 bg-sky-500' : s < step ? 'w-8 bg-sky-300' : 'w-8 bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Travel Style */}
        {step === 1 && (
          <div className="fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              Bạn thích du lịch kiểu nào?
            </h2>
            <p className="text-gray-500 text-center mb-8">Chọn một hoặc nhiều loại hình</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {travelStyles.map(style => (
                <button
                  key={style.id}
                  onClick={() => toggleStyle(style.id)}
                  className={`p-6 rounded-2xl border-2 transition-all text-left ${
                    selectedStyles.includes(style.id)
                      ? 'border-sky-500 bg-sky-50 shadow-lg shadow-sky-100'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <span className="text-4xl mb-3 block">{style.icon}</span>
                  <h3 className="font-semibold text-gray-900">{style.label}</h3>
                  <p className="text-sm text-gray-500">{style.desc}</p>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={selectedStyles.length === 0}
              className="w-full mt-8 py-4 bg-gradient-to-r from-sky-500 to-violet-500 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
            >
              Tiếp tục →
            </button>
          </div>
        )}

        {/* Step 2: Budget */}
        {step === 2 && (
          <div className="fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              Ngân sách du lịch của bạn?
            </h2>
            <p className="text-gray-500 text-center mb-8">Chọn mức ngân sách phù hợp</p>

            <div className="space-y-4">
              {budgetOptions.map(budget => (
                <button
                  key={budget.id}
                  onClick={() => setSelectedBudget(budget.id)}
                  className={`w-full p-6 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                    selectedBudget === budget.id
                      ? 'border-sky-500 bg-sky-50 shadow-lg shadow-sky-100'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <span className="text-4xl">{budget.icon}</span>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">{budget.label}</h3>
                    <p className="text-sm text-gray-500">{budget.desc}</p>
                  </div>
                  {selectedBudget === budget.id && (
                    <div className="ml-auto w-6 h-6 rounded-full bg-sky-500 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-4 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
              >
                ← Quay lại
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!selectedBudget}
                className="flex-1 py-4 bg-gradient-to-r from-sky-500 to-violet-500 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
              >
                Tiếp tục →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Interests */}
        {step === 3 && (
          <div className="fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              Bạn quan tâm đến điều gì?
            </h2>
            <p className="text-gray-500 text-center mb-8">Chọn các hoạt động bạn yêu thích</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {interests.map(interest => (
                <button
                  key={interest.id}
                  onClick={() => toggleInterest(interest.id)}
                  className={`p-4 rounded-2xl border-2 transition-all text-center ${
                    selectedInterests.includes(interest.id)
                      ? 'border-sky-500 bg-sky-50 shadow-lg shadow-sky-100'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <span className="text-3xl mb-2 block">{interest.icon}</span>
                  <span className="font-medium text-gray-900">{interest.label}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-4 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
              >
                ← Quay lại
              </button>
              <button
                onClick={handleComplete}
                disabled={loading}
                className="flex-1 py-4 bg-gradient-to-r from-sky-500 to-violet-500 text-white font-semibold rounded-xl disabled:opacity-50 hover:shadow-lg transition-all"
              >
                {loading ? 'Đang lưu...' : '🚀 Bắt đầu khám phá!'}
              </button>
            </div>
          </div>
        )}

        {/* Skip */}
        <button
          onClick={() => router.push('/')}
          className="w-full mt-4 py-3 text-gray-500 hover:text-gray-700 transition-colors"
        >
          Bỏ qua, tôi sẽ thiết lập sau
        </button>
      </div>
    </div>
  );
}
