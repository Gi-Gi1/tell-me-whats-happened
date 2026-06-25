import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Wheat, Phone, MapPin, FileText, Hash, BadgeDollarSign, Loader2 } from "lucide-react";

import {
  CROP_UNITS,
  MYANMAR_REGIONS,
  REGION_NAMES,
  REGION_LABEL_MY,
  TOWNSHIP_LABEL_MY,
  UNIT_LABEL_MY,
} from "@/lib/myanmar-regions";
import { createCropListing, uploadCropImage } from "@/lib/agrimarket/listings";
import { supabase } from "@/integrations/supabase/client";

import { ImageDropzone, type LocalImage } from "./ImageDropzone";
import { DeliveryOptionCards } from "./DeliveryOptionCards";
import { HarvestDatePicker } from "./HarvestDatePicker";
import { AdditionalInfoSection } from "./AdditionalInfoSection";
import { CropSetupAlert } from "./CropSetupAlert";
import { useI18n } from "@/lib/i18n";

const schema = z.object({
  crop_name: z.string().trim().min(2, "validationCropName"),
  quantity: z.coerce.number().positive("validationPositiveNumber"),
  unit: z.enum(CROP_UNITS),
  price_per_unit: z.coerce.number().nonnegative("validationPrice"),
  region: z.string().min(1, "validationRegion"),
  township: z.string().min(1, "validationTownship"),
  contact: z.string().trim().min(5, "validationContact"),
  description: z.string().trim().max(800).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export function PostCropForm() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const localizeUnit = (u: (typeof CROP_UNITS)[number]) => t(`unit.${u}`, { en: u, my: UNIT_LABEL_MY[u] ?? u });
  const localizeRegion = (r: string) => t(`region.${r}`, { en: r, my: REGION_LABEL_MY[r] ?? r });
  const localizeTownship = (tw: string) => t(`township.${tw}`, { en: tw, my: TOWNSHIP_LABEL_MY[tw] ?? tw });
  const [images, setImages] = useState<LocalImage[]>([]);
  const [delivery, setDelivery] = useState<"delivery" | "pickup" | null>(null);
  const [harvestDate, setHarvestDate] = useState<Date | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { unit: "kg" },
  });

  const region = watch("region");
  const townships = region ? MYANMAR_REGIONS[region] ?? [] : [];

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error(t("signInToPost"));
        setSubmitting(false);
        return;
      }

      let imagePaths: string[] = [];
      if (images.length > 0) {
        toast.message(t("uploadingImages"));
        imagePaths = await Promise.all(images.map((img) => uploadCropImage(img.file)));
      }

      await createCropListing({
        crop_name: values.crop_name,
        quantity: values.quantity,
        unit: values.unit,
        price_per_unit: values.price_per_unit,
        region: values.region,
        township: values.township,
        contact: values.contact,
        description: values.description || null,
        image_paths: imagePaths,
        delivery_option: delivery,
        harvest_date: harvestDate ? harvestDate.toISOString().slice(0, 10) : null,
      });

      toast.success(t("listingCreated"));
      navigate({ to: "/agrimarket" });
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : t("listingFailed");
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <CropSetupAlert />
      <div className="rounded-3xl border border-agri-border bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-agri-primary text-white shadow-sm">
            <Wheat className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold text-agri-ink sm:text-2xl">
              🌾 {t("postTitle")}
            </h1>
            <p className="text-xs leading-relaxed text-agri-ink/60 sm:text-sm">
              {t("postSubtitle")}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field
            label={t("cropName")}
            icon={<Wheat className="h-4 w-4" />}
            error={errors.crop_name?.message ? t(errors.crop_name.message) : undefined}
            className="sm:col-span-2"
          >
            <input
              {...register("crop_name")}
              placeholder={t("cropNamePlaceholder")}
              className={inputClass}
            />
          </Field>

          <Field
            label={t("quantity")}
            icon={<Hash className="h-4 w-4" />}
            error={errors.quantity?.message ? t(errors.quantity.message) : undefined}
          >
            <input
              type="number"
              step="any"
              {...register("quantity")}
              placeholder="၁၀၀"
              className={inputClass}
            />
          </Field>

          <Field label={t("unit")} error={errors.unit?.message}>
            <select {...register("unit")} className={inputClass}>
              {CROP_UNITS.map((u) => (
                <option key={u} value={u}>
                  {localizeUnit(u)}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label={t("pricePerUnit")}
            icon={<BadgeDollarSign className="h-4 w-4" />}
            error={errors.price_per_unit?.message ? t(errors.price_per_unit.message) : undefined}
            className="sm:col-span-2"
          >
            <input
              type="number"
              step="any"
              {...register("price_per_unit")}
              placeholder="၇၅၀၀၀"
              className={inputClass}
            />
          </Field>

          <Field
            label={t("region")}
            icon={<MapPin className="h-4 w-4" />}
            error={errors.region?.message ? t(errors.region.message) : undefined}
          >
            <select
              {...register("region")}
              className={inputClass}
              onChange={(e) => {
                register("region").onChange(e);
                setValue("township", "");
              }}
              defaultValue=""
            >
              <option value="" disabled>
                {t("selectRegion")}
              </option>
              {REGION_NAMES.map((r) => (
                <option key={r} value={r}>
                  {localizeRegion(r)}
                </option>
              ))}
            </select>
          </Field>

          <Field label={t("township")} error={errors.township?.message ? t(errors.township.message) : undefined}>
            <select
              {...register("township")}
              disabled={!region}
              className={inputClass + (region ? "" : " opacity-60")}
              defaultValue=""
            >
              <option value="" disabled>
                {region ? t("selectTownship") : t("selectRegionFirst")}
              </option>
              {townships.map((tw) => (
                <option key={tw} value={tw}>
                  {localizeTownship(tw)}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label={t("contactPhoneViber")}
            icon={<Phone className="h-4 w-4" />}
            error={errors.contact?.message ? t(errors.contact.message) : undefined}
            className="sm:col-span-2"
          >
            <input
              {...register("contact")}
              placeholder="+၉၅ ၉ ၁၂၃ ၄၅၆ ၇၈၉"
              className={inputClass}
            />
          </Field>

          <Field
            label={t("description")}
            icon={<FileText className="h-4 w-4" />}
            error={errors.description?.message}
            className="sm:col-span-2"
          >
            <textarea
              {...register("description")}
              rows={3}
              placeholder={t("descriptionPlaceholder")}
              className={inputClass + " resize-none"}
            />
          </Field>
        </div>
      </div>

      <AdditionalInfoSection>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-agri-ink">{t("cropImages")}</label>
          <ImageDropzone value={images} onChange={setImages} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-agri-ink">{t("deliveryOptions")}</label>
          <DeliveryOptionCards value={delivery} onChange={setDelivery} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-agri-ink">{t("harvestDate")}</label>
          <HarvestDatePicker value={harvestDate} onChange={setHarvestDate} />
          <p className="text-xs leading-relaxed text-agri-ink/60">
            {t("harvestHelp")}
          </p>
        </div>
      </AdditionalInfoSection>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => navigate({ to: "/agrimarket" })}
          className="rounded-2xl border border-agri-border bg-white px-5 py-3 text-sm font-semibold text-agri-ink transition-colors hover:bg-agri-primary-soft/30"
        >
          {t("cancel")}
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-agri-primary px-6 py-3 text-sm font-semibold text-white shadow-md shadow-agri-primary/20 transition-all hover:bg-agri-primary-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? t("submitting") : t("submitListing")}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "w-full rounded-xl border border-agri-border bg-white px-4 py-2.5 text-sm text-agri-ink shadow-sm transition-colors placeholder:text-agri-ink/40 focus:border-agri-primary focus:outline-none focus:ring-2 focus:ring-agri-primary/30";

function Field({
  label,
  icon,
  error,
  className,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={["space-y-1.5", className].filter(Boolean).join(" ")}>
      <label className="flex items-center gap-1.5 text-sm font-semibold text-agri-ink">
        {icon && <span className="text-agri-primary">{icon}</span>}
        {label}
      </label>
      {children}
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
