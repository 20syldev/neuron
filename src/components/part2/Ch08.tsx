"use client";

import { useTranslations } from "next-intl";

import { Ch08Row } from "@/components/part2/Ch08Row";
import { useVariantView } from "@/components/part2/Ch08Shared";
import {
    Accent,
    Callout,
    Caption,
    Chapter,
    ChapterHeader,
    ChapterNext,
    Disclosure,
    Fact,
    Facts,
    Figure,
    MarginNote,
    Plate,
    Prose,
    VariantLine,
} from "@/components/part2/kit";
import { dotWinner, KEY_ANIMAL, KEY_BOULEVARD, products, rawProducts } from "@/lib/attention";

const MAX_PRODUCT = 2.3;

/**
 * Chapter 8, the dot product: the query of "il" is multiplied component by component with the key
 * of "animal" and with the key of "boulevard", the eight products are drawn as circles and their
 * sum is the score. Everything follows the sentence variant chosen in chapter 5.
 */
export function Ch08() {
    const t = useTranslations("part2.ch8");
    const titles = useTranslations("header.chapters");
    const { word, data, decimal } = useVariantView();

    const winner = dotWinner(data);
    const rawAnimal = rawProducts(data.query, KEY_ANIMAL);
    const rawBoulevard = rawProducts(data.query, KEY_BOULEVARD);
    const listAnimal = products(data.query, KEY_ANIMAL).map(decimal).join(t("separator"));
    const listBoulevard = products(data.query, KEY_BOULEVARD).map(decimal).join(t("separator"));
    const scoreAnimal = decimal(data.dotAnimal);
    const scoreBoulevard = decimal(data.dotBoulevard);

    const marker = {
        c1: () => <Callout n={1} />,
        c2: () => <Callout n={2} />,
    };

    return (
        <Chapter number={8}>
            <ChapterHeader number={8} title={titles("8")}>
                {t.rich("statement", {
                    a: scoreAnimal,
                    b: scoreBoulevard,
                    n: (chunks) => <Accent>{chunks}</Accent>,
                })}
            </ChapterHeader>
            <Prose>{t("intro")}</Prose>
            <MarginNote label={t("formulaLabel")}>{t("formulaNote")}</MarginNote>
            <Prose>
                {t.rich("scores", { word, a: scoreAnimal, b: scoreBoulevard, ...marker })}
            </Prose>
            <MarginNote>{t("rounding")}</MarginNote>
            <Figure>
                <Plate number="08" aside={<VariantLine />}>
                    <div className="-mt-1.5">
                        <Ch08Row
                            n={1}
                            title={t("pairAnimal")}
                            label={t("labelAnimal", { word, list: listAnimal })}
                            products={rawAnimal}
                            maxAbs={MAX_PRODUCT}
                            score={scoreAnimal}
                            scoreLabel={t("scoreAnimal")}
                            wins={winner === "animal"}
                        />
                        <Ch08Row
                            n={2}
                            title={t("pairBoulevard")}
                            label={t("labelBoulevard", { word, list: listBoulevard })}
                            products={rawBoulevard}
                            maxAbs={MAX_PRODUCT}
                            score={scoreBoulevard}
                            scoreLabel={t("scoreBoulevard")}
                            wins={winner === "boulevard"}
                            last
                        />
                    </div>
                </Plate>
                <Caption
                    figure={8}
                    disclosure={
                        <Disclosure id="c8">
                            <Facts min={290}>
                                <Fact label={t("numbers.formula")}>{t("formula")}</Fact>
                                <Fact label={t("numbers.animal")}>{listAnimal}</Fact>
                                <Fact label={t("numbers.boulevard")}>{listBoulevard}</Fact>
                                <Fact label={t("numbers.scores")}>
                                    {t("numbers.scoreAnimal", { score: scoreAnimal })}
                                    <br />
                                    {t("numbers.scoreBoulevard", { score: scoreBoulevard })}
                                </Fact>
                            </Facts>
                        </Disclosure>
                    }
                >
                    {t.rich("caption", { word, ...marker })}
                </Caption>
            </Figure>
            <MarginNote label={t("readingLabel")}>{t("reading")}</MarginNote>
            <ChapterNext next={9} title={titles("9")}>
                {t("next")}
            </ChapterNext>
        </Chapter>
    );
}
