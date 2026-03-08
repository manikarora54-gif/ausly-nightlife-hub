import { Link } from "react-router-dom";

export interface NavLinkItem {
  href: string;
  label: string;
  icon: string;
}

interface DesktopNavLinksProps {
  links: NavLinkItem[];
  isActiveLink: (path: string) => boolean;
}

const DesktopNavLinks = ({ links, isActiveLink }: DesktopNavLinksProps) => (
  <div className="hidden lg:flex items-center">
    <div className="flex items-center gap-1 bg-muted/50 backdrop-blur-sm rounded-full px-2 py-1.5">
      {links.map((link) => (
        <Link
          key={link.href}
          to={link.href}
          className={`relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
            isActiveLink(link.href)
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <span className="flex items-center gap-2">{link.label}</span>
        </Link>
      ))}
    </div>
  </div>
);

export default DesktopNavLinks;
