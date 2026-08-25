import { Building2, MapPin, Phone } from "lucide-react";
import { cn } from "@/lib/cn";

export function CustomerContactInfo({
  businessName,
  address,
  phone,
  className,
}: {
  businessName: string;
  address: string;
  phone: string;
  className?: string;
}) {
  const rows = [
    { Icon: Building2, value: businessName },
    { Icon: MapPin, value: address },
    { Icon: Phone, value: phone },
  ];

  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      {rows.map(({ Icon, value }, index) => (
        <div key={index} className="flex items-center gap-3 text-sm text-neutral-700">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-maroon-50 text-maroon-700">
            <Icon size={15} />
          </span>
          <span className="break-words">{value}</span>
        </div>
      ))}
    </div>
  );
}
