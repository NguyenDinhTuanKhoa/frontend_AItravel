'use client';
import Link from 'next/link';

export default function AISection() {
  return (
    <section className="py-24 bg-gradient-to-br from-gray-900 via-violet-950 to-gray-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl float float-delay-1"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <span className="inline-block px-4 py-2 bg-violet-500/20 text-violet-300 rounded-full text-sm font-semibold mb-6 border border-violet-500/30">
              🤖 Powered by Llama 3.1
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Trợ Lý Du Lịch
              <br />
              <span className="gradient-text">Thông Minh</span>
            </h2>
            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
              Hỏi bất cứ điều gì về du lịch. AI của chúng tôi sẽ giúp bạn lên kế hoạch, 
              gợi ý điểm đến, và tạo lịch trình hoàn hảo.
            </p>

            {/* Features List */}
            <div className="space-y-4 mb-8">
              {[
                'Gợi ý điểm đến dựa trên sở thích',
                'Tạo lịch trình tự động',
                'Tư vấn ngân sách chi tiết',
                'Đề xuất khách sạn & nhà hàng',
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-sky-500 to-violet-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-300">{item}</span>
                </div>
              ))}
            </div>

            <Link
              href="/ai-chat"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-sky-500 to-violet-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-violet-500/30 transition-all hover:scale-105"
            >
              <span>🤖</span>
              Bắt đầu chat với AI
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Right - Chat Preview */}
          <Link href="/ai-chat" className="relative group cursor-pointer">
            {/* Glow Effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-sky-500 via-violet-500 to-orange-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
            
            <div className="relative bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-700 overflow-hidden group-hover:border-violet-500/50 transition-colors">
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-gray-700 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl animated-gradient flex items-center justify-center">
                  <span className="text-white text-lg">🤖</span>
                </div>
                <div>
                  <h4 className="text-white font-semibold">TravelAI Assistant</h4>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-green-400 text-sm">Online</span>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="p-6 space-y-4 h-80 overflow-y-auto">
                {/* AI Message */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <span>🤖</span>
                  </div>
                  <div className="bg-gray-700/50 rounded-2xl rounded-tl-none px-4 py-3 max-w-[80%]">
                    <p className="text-gray-200">
                      Xin chào! Tôi là trợ lý du lịch AI. Bạn muốn đi đâu? Tôi có thể giúp bạn lên kế hoạch chuyến đi hoàn hảo! 🌴
                    </p>
                  </div>
                </div>

                {/* User Message */}
                <div className="flex gap-3 justify-end">
                  <div className="bg-gradient-to-r from-sky-500 to-violet-500 rounded-2xl rounded-tr-none px-4 py-3 max-w-[80%]">
                    <p className="text-white">
                      Tôi muốn đi biển vào cuối tuần này, ngân sách khoảng 3 triệu
                    </p>
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <span>🤖</span>
                  </div>
                  <div className="bg-gray-700/50 rounded-2xl rounded-tl-none px-4 py-3 max-w-[80%]">
                    <p className="text-gray-200">
                      Tuyệt vời! Với ngân sách 3 triệu cho cuối tuần, tôi gợi ý:
                    </p>
                    <ul className="mt-2 space-y-1 text-gray-300 text-sm">
                      <li>🏖️ Vũng Tàu - Gần TP.HCM, tiết kiệm</li>
                      <li>🌊 Mũi Né - Biển đẹp, nhiều resort</li>
                      <li>🐚 Côn Đảo - Hoang sơ, yên bình</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent flex items-end justify-center pb-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="px-6 py-3 bg-white text-gray-900 font-semibold rounded-full">
                  Click để bắt đầu chat →
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
