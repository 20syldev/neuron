import { Ch1 } from "./Ch1";
import { Ch2 } from "./Ch2";
import { Ch3 } from "./Ch3";
import { Ch4 } from "./Ch4";
import { DigitProvider } from "./DigitProvider";
import { Opener } from "./Opener";
import { SampleStage } from "./SampleStage";

/**
 * Part I of the essay: the opener and chapters 1 to 4, sharing one live drawing, its network input
 * and its inference through a DigitProvider, and drawing samples by itself while untouched.
 */
export function PartOne() {
    return (
        <DigitProvider>
            <SampleStage>
                <Opener />
                <Ch1 />
                <Ch2 />
                <Ch3 />
                <Ch4 />
            </SampleStage>
        </DigitProvider>
    );
}
