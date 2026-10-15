import React from 'react';
import { ArrowRight, Wrench, CheckCircle2, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroProps {
  onExploreClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreClick }) => {
  return (
    <section className="container-custom relative py-8 md:py-12 overflow-hidden min-w-0">
      {/* Background Soft Glow */}
      <div className="absolute -top-1/4 left-1/5 w-96 h-96 rounded-full bg-orange-400/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/6 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

      {/* Grid Container */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 items-center gap-8 lg:gap-10 w-full min-w-0">
        {/* Left Column */}
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-full px-3.5 py-1.5 mb-5 max-w-full">
            <Flame className="w-4 h-4 text-[#ff5636] shrink-0" />
            <span className="text-xs font-semibold text-[#ff5636] truncate">
              Chuyên Linh Kiện PC & Gaming Gear Cao Cấp
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-tight mb-5 tracking-tight text-slate-900">
            Xây Dựng Cỗ Máy <br />
            <span className="gradient-text">Gaming & Đồ Họa</span> <br />
            Hiệu Năng Vượt Trội
          </h1>

          <p className="text-base sm:text-lg text-slate-600 mb-8 max-w-xl leading-relaxed">
            Hệ thống phân phối linh kiện máy tính chính hãng từ ASUS, MSI, GIGABYTE, Colorful, Intel, AMD. Cam kết 100% nguyên seal, bảo hành đổi mới 30 ngày, tư vấn cấu hình chuẩn xác.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-10">
            <Button
              variant="glow"
              size="lg"
              onClick={onExploreClick}
              className="rounded-full px-7 font-bold shadow-md shadow-orange-500/25"
            >
              <span>Xem Linh Kiện Mới Nhất</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="rounded-full px-6 border-slate-300 text-slate-800 hover:bg-slate-100"
            >
              <Wrench className="w-4 h-4 mr-2 text-[#004147]" />
              <span>Tư Vấn Build PC</span>
            </Button>
          </div>

          {/* Mini Trust Highlights */}
          <div className="flex flex-wrap gap-6 text-xs sm:text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>100% Hàng Chính Hãng</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Bảo Hành 1-Đổi-1 30 Ngày</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Hỗ Trợ Kỹ Thuật Trọn Đời</span>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Visual Card (Clean White Shadow Card) */}
        <div className="relative">
          <div className="glass-panel p-7 relative bg-white border border-slate-200 rounded-2xl shadow-xl hover-lift">
            <div className="flex justify-between items-center mb-4">
              <span className="bg-[#ff5636] text-white text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                HOT DEAL CẤU HÌNH
              </span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                ● Đang có sẵn hàng
              </span>
            </div>

            <div className="relative h-64 sm:h-72 w-full rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center p-4 border border-slate-100 mb-5">
              <img
                src="https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80"
                alt="Flagship Graphics Card"
                className="max-h-full max-w-full object-contain drop-shadow-md hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div className="flex items-end justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Card Đồ Họa Cao Cấp
                </div>
                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  ASUS ROG Strix RTX 4090 24GB GDDR6X
                </h3>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs text-slate-400 line-through">55.990.000₫</div>
                <div className="text-xl font-extrabold text-[#ff5636]">52.990.000₫</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
