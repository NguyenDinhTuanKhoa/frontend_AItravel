'use client';

const features = [
  {
    icon: '🤖',
    title: 'Gợi Ý Thông Minh',
    description: 'AI phân tích sở thích và đề xuất điểm đến phù hợp nhất với bạn',
    color: 'from-sky-500 to-cyan-500',
  },
  {
    icon: '📍',
    title: 'Khám Phá Địa Điểm',
    description: 'Hàng ngàn điểm đến, khách sạn, nhà hàng với đánh giá chi tiết',
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: '📅',
    title: 'Lịch Trình Cá Nhân',
    description: 'Tạo và quản lý lịch trình du lịch theo cách của riêng bạn',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: '⭐',
    title: 'Đánh Giá Thực Tế',
    description: 'Tham khảo đánh giá từ cộng đồng du lịch đáng tin cậy',
    color: 'from-emerald-500 to-teal-500',
  },
];

export default function Features() {
  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 right-20 w-72 h-72 bg-sky-100 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-violet-100 rounded-full blur-3xl opacity-60"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-sky-100 text-sky-600 rounded-full text-sm font-semibold mb-4">
            Tính Năng Nổi Bật
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Tại Sao Chọn <span className="gradient-text">TravelAI</span>?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Công nghệ AI tiên tiến kết hợp với dữ liệu du lịch phong phú
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group bg-white rounded-3xl p-8 shadow-lg shadow-gray-200/50 card-hover border border-gray-100"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                {feature.icon}
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-sky-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>

              {/* Arrow */}
              <div className="mt-6 flex items-center text-sky-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Tìm hiểu thêm</span>
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
