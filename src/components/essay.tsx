import { preload } from "react-dom";

import { Header } from "@/components/header/header";
import { Toc } from "@/components/header/toc";
import { Interlude } from "@/components/part1/Interlude";
import { PartOne } from "@/components/part1/PartOne";
import { Prologue } from "@/components/part1/Prologue";
import { Ch05 } from "@/components/part2/Ch05";
import { Ch06 } from "@/components/part2/Ch06";
import { Ch07 } from "@/components/part2/Ch07";
import { Ch08 } from "@/components/part2/Ch08";
import { Ch09 } from "@/components/part2/Ch09";
import { Ch10 } from "@/components/part2/Ch10";
import { Ch11 } from "@/components/part2/Ch11";
import { Ch12 } from "@/components/part2/Ch12";
import { Ch13 } from "@/components/part2/Ch13";
import { Ch14 } from "@/components/part2/Ch14";
import { Ch15 } from "@/components/part2/Ch15";
import { Epilogue } from "@/components/part2/Epilogue";
import { SiteFooter } from "@/components/part2/Footer";
import { PartTwoProvider } from "@/components/part2/kit";
import { Opener } from "@/components/part2/Opener";
import { MODEL_URL } from "@/lib/mlp";

/**
 * The whole essay on one page: the header system around the main landmark (prologue, table of
 * contents, Part I, interlude, Part II with its shared sentence variant, epilogue) and the footer.
 * Part I shares its live drawing through its own provider and Part II its variant switch, so the
 * two parts never read each other's state. The network weights are preloaded at low priority, so
 * they download while the page hydrates without competing with the fonts and scripts.
 */
export function Essay() {
    preload(MODEL_URL, { as: "fetch", crossOrigin: "anonymous", fetchPriority: "low" });

    return (
        <Header>
            <main>
                <Prologue />
                <Toc />
                <PartOne />
                <Interlude />
                <PartTwoProvider>
                    <Opener />
                    <Ch05 />
                    <Ch06 />
                    <Ch07 />
                    <Ch08 />
                    <Ch09 />
                    <Ch10 />
                    <Ch11 />
                    <Ch12 />
                    <Ch13 />
                    <Ch14 />
                    <Ch15 />
                    <Epilogue />
                </PartTwoProvider>
            </main>
            <SiteFooter />
        </Header>
    );
}
