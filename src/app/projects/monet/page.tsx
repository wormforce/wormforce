import { permanentRedirect } from "next/navigation";

export default function LegacyMonetPage() {
  permanentRedirect("/projects/battuta");
}
