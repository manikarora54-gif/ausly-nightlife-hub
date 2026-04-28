import { useMemo, useState } from "react";
import { useMenuItems } from "@/hooks/useMenuItems";
import { Skeleton } from "@/components/ui/skeleton";
import { UtensilsCrossed, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Props {
  venueId: string;
  venueType?: string | null;
}

const titleFor = (type?: string | null) => {
  const t = (type || "").toLowerCase();
  if (t === "bar" || t === "lounge") return "Drinks & Menu";
  if (t === "club") return "Bar Menu";
  if (t === "cafe") return "Café Menu";
  return "Menu";
};

const MenuSection = ({ venueId, venueType }: Props) => {
  const { data: items, isLoading } = useMenuItems(venueId);
  const [query, setQuery] = useState("");

  const grouped = useMemo(() => {
    const list = (items || []).filter((i) => {
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        i.name.toLowerCase().includes(q) ||
        i.description?.toLowerCase().includes(q) ||
        i.category?.toLowerCase().includes(q)
      );
    });
    const map = new Map<string, typeof list>();
    list.forEach((i) => {
      const cat = i.category || "Other";
      if (!map.has(cat)) map.set(cat, [] as typeof list);
      map.get(cat)!.push(i);
    });
    return Array.from(map.entries());
  }, [items, query]);

  if (isLoading) {
    return (
      <div className="glass-card p-6 space-y-3">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (!items || items.length === 0) return null;

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="w-5 h-5 text-primary" />
          <h2 className="font-heading font-semibold text-xl">{titleFor(venueType)}</h2>
          <span className="text-xs text-muted-foreground">({items.length} items)</span>
        </div>
        <div className="relative w-full sm:w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search menu…"
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      <div className="space-y-6">
        {grouped.map(([category, list]) => (
          <div key={category}>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary/80 mb-3">
              {category}
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {list.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors card-lift"
                >
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      loading="lazy"
                      className="w-16 h-16 rounded-lg object-cover shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2">
                      <h4 className="font-medium text-sm truncate">{item.name}</h4>
                      {item.price != null && (
                        <span className="font-semibold text-sm text-primary shrink-0">
                          {item.currency === "EUR" ? "€" : item.currency || "€"}
                          {Number(item.price).toFixed(2)}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {grouped.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No items match "{query}"
          </p>
        )}
      </div>
    </div>
  );
};

export default MenuSection;
