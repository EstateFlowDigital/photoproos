"use client";

import Link from "next/link";
import Image from "next/image";
import { HomeIcon, ExternalLinkIcon } from "../icons";
import { formatPrice } from "../utils";
import type { PropertyData } from "../types";

interface PropertiesTabProps {
  properties: PropertyData[];
}

export function PropertiesTab({ properties }: PropertiesTabProps) {
  if (properties.length === 0) {
    return (
      <div className="col-span-full rounded-xl border border-[#262626] bg-[#141414] p-12 text-center">
        <HomeIcon className="mx-auto h-12 w-12 text-[#7c7c7c]" />
        <p className="mt-4 text-lg font-medium text-white">No property websites yet</p>
        <p className="mt-2 text-sm text-[#7c7c7c]">
          Property websites will appear here once created by your photographer
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}

function PropertyCard({ property }: { property: PropertyData }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#262626] bg-[#141414]">
      <div className="relative aspect-video bg-[#191919]">
        {property.thumbnailUrl ? (
          <Image
            src={property.thumbnailUrl}
            alt={property.address}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <HomeIcon className="h-12 w-12 text-[#7c7c7c]" />
          </div>
        )}
        <div className="absolute left-3 top-3">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              property.status === "published"
                ? "bg-[#22c55e]/20 text-[#22c55e]"
                : "bg-[#7c7c7c]/20 text-[#a7a7a7]"
            }`}
          >
            {property.status}
          </span>
        </div>
      </div>
      <div className="p-4">
        {property.price && (
          <p className="font-bold text-white">{formatPrice(property.price)}</p>
        )}
        <p className="mt-1 font-medium text-white">{property.address}</p>
        <p className="text-sm text-[#7c7c7c]">
          {property.city}, {property.state} {property.zipCode}
        </p>
        <div className="mt-4 flex items-center gap-4 text-xs text-[#7c7c7c]">
          <span>{property.viewCount.toLocaleString()} views</span>
          <span>{property.leadCount} leads</span>
          <span>{property.photoCount} photos</span>
        </div>
        {property.status === "published" && (
          <Link
            href={`/p/${property.slug}`}
            target="_blank"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#3b82f6] py-2 text-sm font-medium text-white transition-colors hover:bg-[#3b82f6]/90"
          >
            View Website
            <ExternalLinkIcon className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
