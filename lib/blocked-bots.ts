// High-volume scrapers kept out of the whole site (see app/robots.ts).
// To cut bot traffic, add the bot here: never switch '*' to an allowlist.
export const BLOCKED_BOTS = [
  'Bytespider', // ByteDance, very high volume
  'PetalBot', // Huawei
  'MJ12bot', // Majestic
  'DotBot', // Moz
  'BLEXBot', // WebMeUp
]
