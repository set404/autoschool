/**
 * Google AdSense configuration.
 *
 * Fill these in once you have an AdSense account:
 * - publisherId: your account id, shown as "ca-pub-XXXXXXXXXXXXXXXX" in AdSense.
 * - resultsBannerSlotId / interstitialSlotId: ad unit ids created in AdSense
 *   ("Ads" > "By ad unit" > create a display ad unit, copy its data-ad-slot value).
 *
 * Until publisherId is set to a real "ca-pub-..." value, ad components render
 * nothing (no script is loaded, no layout is reserved) so the app behaves
 * exactly as it does today.
 */
export const AD_CONFIG = {
  publisherId: 'ca-pub-1234567890123456',
  resultsBannerSlotId: '0000000000',
  interstitialSlotId: '0000000000',
} as const;

export function isAdSenseConfigured(): boolean {
  return /^ca-pub-\d+$/.test(AD_CONFIG.publisherId);
}
