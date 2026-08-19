import * as React from "react";
import { NumberOverlayEditorStyle } from "./number-overlay-editor-style.js";
import { NumericFormat } from "react-number-format";
import type { SelectionRange } from "../../data-grid/data-grid-types.js";
import type { NumberFormatValues } from "react-number-format/types/types.js";

interface Props {
    readonly value: number | undefined;
    readonly disabled?: boolean;
    readonly onChange: (values: NumberFormatValues) => void;
    readonly highlight: boolean;
    readonly validatedSelection?: SelectionRange;
    readonly fixedDecimals?: number;
    readonly allowNegative?: boolean;
    readonly thousandSeparator?: boolean | string;
    readonly decimalSeparator?: string;
}

const ZERO_WIDTH_SPACE = "\u200b";

function getDecimalSeparator() {
    const numberWithDecimalSeparator = 1.1;
    const result = Intl.NumberFormat()
        ?.formatToParts(numberWithDecimalSeparator)
        ?.find(part => part.type === "decimal")?.value;

    return result ?? ".";
}

function getThousandSeprator() {
    return getDecimalSeparator() === "." ? "," : ".";
}

const NumberOverlayEditor: React.FunctionComponent<Props> = p => {
    const {
        value,
        onChange,
        disabled,
        highlight,
        validatedSelection,
        fixedDecimals,
        allowNegative,
        thousandSeparator,
        decimalSeparator,
    } = p;

    const inputRef = React.useRef<HTMLInputElement>();
    const [displayValue, setDisplayValue] = React.useState<string>(ZERO_WIDTH_SPACE);

    const syncDisplay = React.useCallback(() => {
        const v = inputRef.current?.value;
        setDisplayValue(v ? v : ZERO_WIDTH_SPACE);
    }, []);

    React.useLayoutEffect(() => {
        syncDisplay();
        if (validatedSelection !== undefined) {
            const range = typeof validatedSelection === "number" ? [validatedSelection, null] : validatedSelection;
            inputRef.current?.setSelectionRange(range[0], range[1]);
        }
    }, [validatedSelection, syncDisplay]);

    React.useEffect(() => {
        requestAnimationFrame(syncDisplay);
    }, [value, syncDisplay]);

    return (
        <NumberOverlayEditorStyle>
            <span className="npc-shadow">{displayValue}</span>
            <NumericFormat
                autoFocus={true}
                getInputRef={inputRef}
                className="gdg-input npc-input"
                onFocus={(e: React.FocusEvent<HTMLInputElement>) =>
                    e.target.setSelectionRange(highlight ? 0 : e.target.value.length, e.target.value.length)
                }
                disabled={disabled === true}
                decimalScale={fixedDecimals}
                allowNegative={allowNegative}
                thousandSeparator={thousandSeparator ?? getThousandSeprator()}
                decimalSeparator={decimalSeparator ?? getDecimalSeparator()}
                value={Object.is(value, -0) ? "-" : value ?? ""}
                onValueChange={(values) => {
                    setDisplayValue(values.formattedValue || ZERO_WIDTH_SPACE);
                    onChange(values);
                }}
            />
        </NumberOverlayEditorStyle>
    );
};

export default NumberOverlayEditor;
