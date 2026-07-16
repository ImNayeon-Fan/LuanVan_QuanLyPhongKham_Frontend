import { useNavigate } from 'react-router-dom';
import { ShieldCheck, UserRoundCheck, Heart } from 'lucide-react';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-slate-50 to-indigo-100 flex flex-col justify-between p-6 md:p-12 relative overflow-hidden">
      {/* Background blobs for premium look */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-300/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-300/20 blur-[130px] pointer-events-none" />

      {/* Top Header / Branding */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-md p-1.5 border border-slate-100">
            <img 
              src="/clinic_logo.png" 
              alt="Logo Phòng khám Đa khoa Nhật Tảo" 
              className="w-full h-full object-contain rounded-full"
            />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight leading-none">
              Phòng Khám Đa Khoa Nhật Tảo
            </h1>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">Uy tín - Tận tâm - Chuyên nghiệp</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center flex-1 my-6 z-10">
        {/* Tagline */}
        <div className="text-center mb-6 max-w-xl">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">
            Chào mừng đến với <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-blue-600">
              Phòng Khám Đa Khoa Nhật Tảo
            </span>
          </h2>
        </div>

        {/* Choice Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-3xl">
          {/* Card 1: Khách hàng */}
          <div 
            onClick={() => navigate('/khach-hang')}
            className="group cursor-pointer bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/60 shadow-[0_10px_20px_-8px_rgba(148,163,184,0.1)] hover:shadow-[0_15px_30px_-5px_rgba(14,165,233,0.15)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[250px] relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 w-20 h-20 bg-gradient-to-bl from-sky-500/5 to-transparent rounded-bl-full pointer-events-none" />
            
            <div>
              <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4 group-hover:scale-105 group-hover:bg-sky-500 group-hover:text-white transition-all duration-300 shadow-sm">
                <UserRoundCheck size={22} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 group-hover:text-sky-700 transition-colors duration-300 mb-2">
                Khách hàng & Bệnh nhân
              </h3>
              <p className="text-slate-500 text-[13px] leading-relaxed">
                Đăng ký đặt lịch hẹn khám bệnh trực tuyến, tra cứu hồ sơ bệnh án cá nhân, và tìm hiểu đội ngũ bác sĩ chuyên khoa giỏi của phòng khám.
              </p>
            </div>
            
            <div className="mt-6 flex items-center gap-1.5 text-sky-600 font-semibold text-[13px] group-hover:translate-x-1.5 transition-transform duration-300">
              Truy cập cổng bệnh nhân &rarr;
            </div>
          </div>

          {/* Card 2: Nhân sự */}
          <div 
            onClick={() => navigate('/login')}
            className="group cursor-pointer bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/60 shadow-[0_10px_20px_-8px_rgba(148,163,184,0.1)] hover:shadow-[0_15px_30px_-5px_rgba(37,99,235,0.15)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[250px] relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 w-20 h-20 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-bl-full pointer-events-none" />
            
            <div>
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                <ShieldCheck size={22} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-700 transition-colors duration-300 mb-2">
                Nhân sự phòng khám
              </h3>
              <p className="text-slate-500 text-[13px] leading-relaxed">
                Dành cho Bác sĩ, Lễ tân phòng khám và Ban quản trị để thực hiện tiếp đón bệnh nhân, khám lâm sàng, kê đơn và quản trị hệ thống.
              </p>
            </div>
            
            <div className="mt-6 flex items-center gap-1.5 text-blue-600 font-semibold text-[13px] group-hover:translate-x-1.5 transition-transform duration-300">
              Đăng nhập hệ thống quản trị &rarr;
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 font-medium border-t border-slate-200/50 pt-6 z-10">
        <div>&copy; {new Date().getFullYear()} Phòng Khám Đa Khoa Nhật Tảo.</div>
      </footer>
    </div>
  );
}

export default LandingPage;
