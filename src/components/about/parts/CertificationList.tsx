import { AiFillSafetyCertificate } from "react-icons/ai";
import type { Certification } from "../types";

interface Props {
  items: Certification[];
  className?: string;
}

export const CertificationList = ({ items, className = "" }: Props) => (
  <ul className={`space-y-3 ${className}`}>
    {items.map((cert) => (
      <li key={cert.name} className="flex items-start gap-3">
        <AiFillSafetyCertificate className="mt-[3px] shrink-0 text-base text-accent" />
        <div className="min-w-0">
          <p className="text-sm font-medium leading-snug text-fg">{cert.name}</p>
          <p className="text-xs text-fg-3">
            {cert.issuer}
            {/* CKA carries no date on purpose — never render a stray separator */}
            {cert.date && ` · ${cert.date}`}
          </p>
        </div>
      </li>
    ))}
  </ul>
);
