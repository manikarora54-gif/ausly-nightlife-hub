import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search } from "lucide-react";
import SearchWithSuggestions from "@/components/search/SearchWithSuggestions";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSearch: (query: string) => void;
}

const SearchDialog = ({ open, onOpenChange, onSearch }: SearchDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-lg rounded-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Search className="w-5 h-5 text-primary" />
          Search Ausly
        </DialogTitle>
        <DialogDescription>
          Find restaurants, bars, events, and experiences across Germany
        </DialogDescription>
      </DialogHeader>
      <div className="pt-2">
        <SearchWithSuggestions
          showButton={false}
          placeholder="Search by name, city, cuisine..."
          onSearch={onSearch}
        />
      </div>
    </DialogContent>
  </Dialog>
);

export default SearchDialog;
