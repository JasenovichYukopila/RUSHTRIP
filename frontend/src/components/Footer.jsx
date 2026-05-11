import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#1A1208] text-[#FAF7F2]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
          <div>
            <Link to="/" className="font-display text-2xl tracking-tight">
              Rush<span className="text-[#E8611A]">Trip</span>
            </Link>
            <p className="mt-3 text-sm text-[#8C7B6B] leading-relaxed">
              Dinos tu presupuesto. Nosotros armamos el plan de viaje perfecto para ti.
            </p>
          </div>

          <div>
            <h4 className="font-display text-sm uppercase tracking-widest text-[#C4A882] mb-4">
              Navegar
            </h4>
            <div className="flex flex-col gap-2.5">
              <Link to="/" className="text-sm text-[#8C7B6B] hover:text-[#FAF7F2] transition-colors">
                Inicio
              </Link>
              <Link to="/plan" className="text-sm text-[#8C7B6B] hover:text-[#FAF7F2] transition-colors">
                Buscar plan
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-display text-sm uppercase tracking-widest text-[#C4A882] mb-4">
              Contacto
            </h4>
            <p className="text-sm text-[#8C7B6B] leading-relaxed">
              support@myrushtrip.com
            </p>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#8C7B6B]">
            &copy; {new Date().getFullYear()} RushTrip. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-3 text-xs text-[#8C7B6B]">
            <span>Hecho con</span>
            <span className="text-[#E8611A]">✦</span>
            <span>para viajeros</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
