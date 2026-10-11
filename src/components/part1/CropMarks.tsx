const MARKS = [
    "-left-4 top-0 h-px w-2.5",
    "left-0 -top-4 h-2.5 w-px",
    "-right-4 top-0 h-px w-2.5",
    "right-0 -top-4 h-2.5 w-px",
    "-left-4 bottom-0 h-px w-2.5",
    "left-0 -bottom-4 h-2.5 w-px",
    "-right-4 bottom-0 h-px w-2.5",
    "right-0 -bottom-4 h-2.5 w-px",
];

/**
 * Eight hairline crop marks, two at each corner of the positioned parent, drawn 16 px outside it.
 */
export function CropMarks() {
    return (
        <>
            {MARKS.map((mark) => (
                <span
                    key={mark}
                    aria-hidden="true"
                    className={`absolute bg-muted-foreground ${mark}`}
                />
            ))}
        </>
    );
}
