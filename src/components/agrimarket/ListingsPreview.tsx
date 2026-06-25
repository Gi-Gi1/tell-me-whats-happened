import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Phone, MapPin, ImageOff, Sprout, Leaf, Apple, Truck, Package, LayoutGrid } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { listRecentListings, getSignedImageUrls, type CropListing } from "@/lib/agrimarket/listings";
import { REGION_LABEL_MY, TOWNSHIP_LABEL_MY, UNIT_LABEL_MY } from "@/lib/myanmar-regions";
import { useI18n } from "@/lib/i18n";

const mmNum = (n: number) =>
  n.toLocaleString("my-MM", { maximumFractionDigits: 0 });

type CategoryId = "all" | "grains" | "vegetables" | "fruits" | "delivery" | "pickup";

const CATEGORY_KEYWORDS: Record<Exclude<CategoryId, "all" | "delivery" | "pickup">, string[]> = {
  grains: ["rice", "paddy", "wheat", "corn", "maize", "bean", "pulse", "ဆန်", "စပါး", "ပြောင်း", "ဂျုံ", "ပဲ"],
  vegetables: ["vegetable", "tomato", "onion", "potato", "chili", "cabbage", "garlic", "ဟင်း", "ခရမ်း", "ကြက်သွန်", "အာလူး", "ငရုတ်"],
  fruits: ["mango", "banana", "fruit", "orange", "watermelon", "papaya", "သရက်", "ငှက်ပျော", "သစ်သီး", "လိမ္မော်", "ဖရဲ", "သင်္ဘော"],
};

function matchesCategory(listing: CropListing, cat: CategoryId): boolean {
  if (cat === "all") return true;
  if (cat === "delivery") return listing.delivery_option === "delivery";
  if (cat === "pickup") return listing.delivery_option === "pickup";
  const name = listing.crop_name?.toLowerCase() ?? "";
  return CATEGORY_KEYWORDS[cat].some((kw) => name.includes(kw.toLowerCase()));
}

export function ListingsPreview() {
  const { t } = useI18n();
  const [category, setCategory] = useState<CategoryId>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["agri-listings", "recent"],
    queryFn: () => listRecentListings(40),
  });

  const filtered = useMemo(
    () => (data ?? []).filter((l) => matchesCategory(l, category)),
    [data, category]
  );

  const categories: { id: CategoryId; label: string; icon: typeof Sprout }[] = [
    { id: "all",        label: t("filterAll",        { en: "All",        my: "အားလုံး" }),       icon: LayoutGrid },
    { id: "grains",     label: t("filterGrains",     { en: "Grains",     my: "ဆန်/စပါး" }),      icon: Sprout },
    { id: "vegetables", label: t("filterVegetables", { en: "Vegetables", my: "ဟင်းသီးဟင်းရွက်" }), icon: Leaf },
    { id: "fruits",     label: t("filterFruits",     { en: "Fruits",     my: "သစ်သီး" }),         icon: Apple },
    { id: "delivery",   label: t("filterDelivery",   { en: "Delivery",   my: "ပို့ဆောင်ပေး" }),    icon: Truck },
    { id: "pickup",     label: t("filterPickup",     { en: "Pickup",     my: "လာယူ" }),          icon: Package },
  ];

  return (
    <section id="listings" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-12 sm:py-16">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {t("recentListings")}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-white/85">
            {t("recentListingsBody")}
          </p>

        </div>
        <Link
          to="/agrimarket/post"
          className="text-sm font-semibold text-agri-butter hover:text-agri-tiger"
        >
          {t("postYourCrop")} →
        </Link>
      </div>

      {/* Category filter bar */}
      <div
        role="tablist"
        aria-label={t("filterBy", { en: "Filter by category", my: "အမျိုးအစားအလိုက် စစ်ထုတ်ရန်" })}
        className="mt-6 -mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
      >
        {categories.map((c) => {
          const active = category === c.id;
          const count = (data ?? []).filter((l) => matchesCategory(l, c.id)).length;
          return (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setCategory(c.id)}
              className={[
                "snap-start inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition-all",
                active
                  ? "border-agri-tiger bg-agri-tiger text-white shadow-lg shadow-agri-tiger/30 scale-[1.02]"
                  : "border-white/20 bg-white/10 text-white/85 hover:border-agri-butter hover:bg-white/15 hover:text-white",
              ].join(" ")}
            >
              <c.icon className="h-3.5 w-3.5" />
              <span>{c.label}</span>
              <span
                className={[
                  "rounded-full px-1.5 py-0.5 text-[10px] font-extrabold",
                  active ? "bg-white/25 text-white" : "bg-white/15 text-white/80",
                ].join(" ")}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-2xl border border-agri-border bg-white"
            />
          ))}

        {!isLoading && filtered.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-white/25 bg-white/5 p-10 text-center backdrop-blur">
            <p className="text-sm leading-relaxed text-white/80">
              {category === "all" ? (
                <>
                  {t("noListings")}{" "}
                  <Link to="/agrimarket/post" className="font-semibold text-agri-butter hover:underline">
                    {t("beFirstListing")}
                  </Link>
                  ။
                </>
              ) : (
                <>
                  {t("noListingsInCategory", {
                    en: "No listings in this category yet.",
                    my: "ဤအမျိုးအစားတွင် ကြော်ငြာ မရှိသေးပါ။",
                  })}{" "}
                  <button
                    type="button"
                    onClick={() => setCategory("all")}
                    className="font-semibold text-agri-butter hover:underline"
                  >
                    {t("showAll", { en: "Show all", my: "အားလုံးပြရန်" })}
                  </button>
                </>
              )}
            </p>
          </div>
        )}

        {filtered.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
      </div>
    </section>
  );
}

function ListingCard({ listing }: { listing: CropListing }) {
  const { t } = useI18n();
  const { data: signed } = useQuery({
    queryKey: ["agri-listing-thumb", listing.id, listing.image_paths?.[0]],
    queryFn: async () => {
      if (!listing.image_paths?.[0]) return null;
      const res = await getSignedImageUrls([listing.image_paths[0]], 60 * 60);
      return res[0]?.url ?? null;
    },
    staleTime: 50 * 60 * 1000,
  });

  const contactHref =
    listing.contact.startsWith("+") || /^\d/.test(listing.contact)
      ? `tel:${listing.contact.replace(/\s/g, "")}`
      : undefined;

  const region = t(`region.${listing.region}`, { en: listing.region, my: REGION_LABEL_MY[listing.region] ?? listing.region });
  const township = t(`township.${listing.township}`, { en: listing.township, my: TOWNSHIP_LABEL_MY[listing.township] ?? listing.township });
  const unit = t(`unit.${listing.unit}`, { en: listing.unit, my: UNIT_LABEL_MY[listing.unit] ?? listing.unit });

  return (
    <article className="agri-glass agri-glass-hover group overflow-hidden !rounded-3xl">
      <div className="relative aspect-[4/3] overflow-hidden bg-agri-primary-soft">
        {signed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={signed} alt={listing.crop_name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
        ) : (
          <div className="grid h-full w-full place-items-center text-agri-leaf/70">
            <ImageOff className="h-9 w-9" />
          </div>
        )}
        {/* Floating price badge */}
        <div className="absolute left-3 top-3 rounded-full bg-agri-primary-dark/95 px-3 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur">
          {mmNum(listing.price_per_unit)} ကျပ်/{unit}
        </div>
        <span className="absolute right-3 top-3 agri-chip-gold !bg-agri-gold-soft !text-agri-primary-dark">
          ✓ Verified
        </span>
      </div>
      <div className="space-y-2.5 p-5">
        <h3 className="truncate font-display text-base font-bold text-white">{listing.crop_name}</h3>
        <p className="flex items-center gap-1.5 text-xs text-white/75">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-agri-butter" />
          <span className="truncate">{township}၊ {region}</span>
        </p>
        <p className="text-xs text-white/70">
          {t("quantity")} — <span className="font-semibold text-white">{mmNum(listing.quantity)} {unit}</span>
        </p>
        {contactHref ? (
          <a
            href={contactHref}
            className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-agri-butter px-3 py-2 text-xs font-bold text-agri-primary-dark transition-all hover:bg-agri-tiger hover:text-white"
          >
            <Phone className="h-3.5 w-3.5" />
            {t("call")}
          </a>
        ) : (
          <p className="mt-1 text-xs text-white/70">{listing.contact}</p>
        )}
      </div>

    </article>
  );
}
