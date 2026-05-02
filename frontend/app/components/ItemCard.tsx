interface ItemCardProps {
  name: string;
  category: string;
  status: "Lost" | "Found" | "Missing";
  location: string;
  date: string;
  imageUrl?: string;
}

const statusColors: Record<string, string> = {
  Lost: "#FF0000",
  Found: "#34C759",
  Missing: "#F6FF00",
};

export default function ItemCard({
  name,
  category,
  status,
  location,
  date,
  imageUrl,
}: ItemCardProps) {
  const badgeColor = statusColors[status] || "#D9D9D9";

  return (
    <div className="relative w-full">
      {/* Shield-shaped card background */}
      <svg
        viewBox="0 0 317 414"
        className="w-full h-auto drop-shadow-md"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          d="M46 0.5H271C296.129 0.5 316.5 20.871 316.5 46V305.309C316.5 322.16 307.187 337.632 292.295 345.519L240.766 372.809L185.439 402.109C172.59 408.914 157.262 409.168 144.194 402.793L26.0488 345.152C10.4164 337.525 0.5 321.654 0.5 304.26V46C0.5 20.871 20.871 0.5 46 0.5Z"
          fill="white"
          stroke="#FF0000"
          strokeWidth="1"
        />
      </svg>

      {/* Card Content Overlay */}
      <div className="absolute inset-0 flex flex-col px-[9%] pt-[4%] pb-[28%]">
        {/* Title */}
        <h3 className="text-center font-extrabold text-base sm:text-[clamp(12px,1.4vw,18px)] leading-tight mb-[4%]">
          {name}
        </h3>

        {/* Image Placeholder */}
        <div className="w-full aspect-[256/177] rounded-2xl sm:rounded-3xl bg-[#BEBEBE] mb-[5%] overflow-hidden shrink-0">
          {imageUrl ? (
            <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
          ) : null}
        </div>

        {/* Info Rows */}
        <div className="flex flex-col gap-y-[2%] text-[clamp(9px,1vw,12px)]">
          <div className="flex items-start gap-1">
            <span className="font-semibold text-black whitespace-nowrap w-[48%]">Category:</span>
            <span className="font-light text-black">{category}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold text-black whitespace-nowrap w-[48%]">Status:</span>
            <span
              className="inline-flex items-center justify-center rounded-full border border-black px-2 py-px text-[clamp(8px,0.9vw,11px)] font-light text-black whitespace-nowrap"
              style={{ backgroundColor: badgeColor, minWidth: "52px" }}
            >
              {status}
            </span>
          </div>
          <div className="flex items-start gap-1">
            <span className="font-semibold text-black whitespace-nowrap w-[48%]">Location:</span>
            <span className="font-light text-black">{location}</span>
          </div>
          <div className="flex items-start gap-1">
            <span className="font-semibold text-black whitespace-nowrap w-[48%]">Date:</span>
            <span className="font-light text-black">{date}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
