import manifest from "../../public/battuta/demo-audio/manifest.json";

export const battutaDemoProfiles = manifest.profiles.map((profile) => ({
  id: profile.id,
  name: profile.displayName,
  family: profile.family,
  tone: profile.tone,
}));

export const battutaDemoProfileCount = battutaDemoProfiles.length;
