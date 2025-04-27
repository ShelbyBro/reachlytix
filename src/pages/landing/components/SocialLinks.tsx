
import { Linkedin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SocialLinks() {
  return (
    <div className="flex items-center gap-4">
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full hover:text-primary"
        asChild
      >
        <a
          href="https://linkedin.com/company/reachlytix"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Linkedin className="h-5 w-5" />
        </a>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full hover:text-primary"
        asChild
      >
        <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer">
          <Phone className="h-5 w-5" />
        </a>
      </Button>
    </div>
  );
}
