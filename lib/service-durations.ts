/**
 * Default duration in minutes per service (for slot calculation and conflict check).
 * Services not listed default to DEFAULT_DURATION.
 */
export const DEFAULT_SERVICE_DURATION_MINUTES = 60;

export const SERVICE_DURATIONS: Record<string, number> = {
  'Timeless Facial': 60,
  'Hydra Facial': 60,
  'Royal Facial': 60,
  'Chemical Peels': 60,
  'Glow Fusion Facial': 75,
  'Oxygen Facial': 60,
  'Collagen Peptide Facial': 60,
  'Deep Treatment Facial': 75,
  'Anti-Aging Facials': 60,
  'Vitapharm Special': 120,
  'Pampering Facial': 90,
  'Back Massage': 60,
  'Reflexology': 60,
  'Soft Tissue Massage': 60,
  'Deep Tissue Massage': 75,
  'Body Scrub': 60,
  'Radio Frequency': 45,
  'Body Treatments': 60,
  'LED Light Therapy': 45,
  'Acne Treatment': 60,
  'Pigmentation Treatment': 60,
  'IV Therapy': 90,
  'Microdermabrasion': 45,
  'Mesotherapy': 60,
  'Microneedling': 75,
  'PRP Microneedling': 90,
  'Armpits Waxing': 20,
  'Bikini Waxing': 30,
  'Body Waxing': 45,
  'Consultation': 30,
};

export function getServiceDurationMinutes(serviceType: string): number {
  return SERVICE_DURATIONS[serviceType] ?? DEFAULT_SERVICE_DURATION_MINUTES;
}

export function getTotalDurationMinutes(services: string[]): number {
  return services.reduce((sum, s) => sum + getServiceDurationMinutes(s), 0);
}
