import { Link } from "react-router-dom";

const NavbarLogo = () => (
  <Link to="/" className="flex items-center gap-2.5 group">
    <div className="relative w-9 h-9 rounded-lg overflow-hidden transition-transform duration-300 group-hover:scale-105">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-primary opacity-90" />
      <div className="absolute inset-[2px] rounded-[6px] bg-background flex items-center justify-center">
        <span className="text-base font-heading font-extrabold gradient-text leading-none">A</span>
      </div>
    </div>
    <span className="text-xl font-heading font-extrabold tracking-tight">
      <span className="gradient-text">Ausly</span>
    </span>
  </Link>
);

export default NavbarLogo;
