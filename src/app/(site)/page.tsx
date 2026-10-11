import { setRequestLocale } from "next-intl/server";

import { Essay } from "@/components/essay";
import { routing } from "@/i18n/routing";

/**
 * Home page of the default locale. Pins the request locale for the static export.
 */
export default function HomePage() {
    setRequestLocale(routing.defaultLocale);

    return <Essay />;
}
