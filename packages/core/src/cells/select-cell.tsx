/* eslint-disable react/display-name */
import * as React from "react";
import * as ReactDOM from "react-dom";
import { styled } from "@linaria/react";

import {
    GridCellKind,
    type SelectCell,
    type SelectOption,
    type SelectConfig,
    type ProvideEditorComponent,
} from "../internal/data-grid/data-grid-types.js";
import { GrowingEntry } from "../internal/growing-entry/growing-entry.js";
import { drawTextCell, prepTextCell } from "../internal/data-grid/render/data-grid-lib.js";
import type { DrawArgs, InternalCellRenderer } from "./cell-types.js";
import type { FullTheme } from "../common/styles.js";

// re-export types for convenience
export type { SelectCell, SelectOption, SelectConfig };

// ==================== Helper Functions ====================

function getDisplayText(
    value: string | undefined | null,
    options: readonly SelectOption[] | undefined | null
): string {
    if (value === undefined || value === null || value === "") return "";
    if (!Array.isArray(options)) return value;
    const values = value.split(",");
    const labels: string[] = [];
    for (const v of values) {
        const opt = options.find(o => o.value === v);
        if (opt) {
            labels.push(opt.label);
        }
    }
    return labels.length > 0 ? labels.join(",") : value;
}

function isValueSelected(
    optionValue: string,
    cellValue: string | undefined | null,
    isMultiple: boolean
): boolean {
    if (cellValue === undefined || cellValue === null || cellValue === "") return false;
    if (isMultiple) {
        const values = cellValue.split(",");
        return values.includes(optionValue);
    }
    return cellValue === optionValue;
}

function toggleValue(
    optionValue: string,
    cellValue: string | undefined | null,
    isMultiple: boolean
): string {
    const current = cellValue ?? "";
    if (isMultiple) {
        const values = current === "" ? [] : current.split(",");
        const idx = values.indexOf(optionValue);
        if (idx >= 0) {
            values.splice(idx, 1);
        } else {
            values.push(optionValue);
        }
        return values.join(",");
    }
    return optionValue;
}

// ==================== Canvas Cell Rendering ====================

function drawTriangle(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    color: string
) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + size, y);
    ctx.lineTo(x + size / 2, y + size * 0.7);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
}

function drawSelectCell(args: DrawArgs<SelectCell>, cell: SelectCell) {
    const { ctx, theme, rect } = args;

    const { displayData, data, selectConfig } = cell;
    const showIcon = selectConfig?.showIcon === true;
    const options = selectConfig?.options;

    // Robust fallback chain for display text
    let displayText: string;
    if (displayData !== undefined && displayData !== null && displayData !== "") {
        displayText = displayData;
    } else if (data !== undefined && data !== null && data !== "") {
        displayText = getDisplayText(data, options);
        if (displayText === "") {
            displayText = String(data);
        }
    } else {
        displayText = "";
    }

    const iconWidth = showIcon ? 20 : 0;
    const textRect = {
        ...rect,
        width: Math.max(0, rect.width - iconWidth),
    };

    if (displayText.length > 0) {
        ctx.fillStyle = theme.textDark;
        drawTextCell(
            {
                ctx,
                theme,
                rect: textRect,
            },
            displayText
        );
    }

    if (showIcon) {
        const iconSize = 10;
        const iconX = rect.x + rect.width - theme.cellHorizontalPadding - iconSize;
        const iconY = rect.y + rect.height / 2 - iconSize / 2;
        drawTriangle(ctx, iconX, iconY, iconSize, theme.textMedium);
    }
}

// ==================== Editor Styles ====================

const EditorWrap = styled.div`
    display: flex;
    flex-direction: column;
    position: relative;
    width: 100%;
    background-color: var(--gdg-bg-cell);
`;

const DropdownOverlay = styled.div`
    position: fixed;
    max-height: 360px;
    background: #ffffff;
    border: 1px solid #4F5DFF;
    border-radius: 0;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
    z-index: 10000;
    display: flex;
    flex-direction: column;
    overflow: hidden;
`;

const OptionsList = styled.div`
    flex: 1;
    overflow-y: auto;
    max-height: 320px;
`;

const OptionItem = styled.div`
    display: flex;
    align-items: center;
    padding: 4px 10px;
    font-family: var(--gdg-font-family);
    font-size: var(--gdg-editor-font-size);
    user-select: none;
    transition: background 0.15s ease;
    line-height: 1.4;

    &[data-disabled="true"] {
        cursor: not-allowed;
        color: var(--gdg-text-light);
        opacity: 0.5;
    }
    &:not([data-disabled="true"]) {
        cursor: pointer;
        color: var(--gdg-text-dark);
        opacity: 1;
    }

    &[data-active="true"] {
        background: #e6f2ff;
    }
    &[data-active="false"] {
        background: transparent;
    }

    &:not([data-disabled="true"]):hover {
        background: #e6f2ff;
    }
`;

const CheckBox = styled.div`
    width: 14px;
    height: 14px;
    margin-right: 6px;
    border: 1.5px solid #d0d0d0;
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: transparent;

    &[data-checked="true"] {
        background: #1a73e8;
        border-color: #1a73e8;
    }

    &::after {
        content: "";
        width: 3px;
        height: 7px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg) translate(-1px, -1px);
        opacity: 0;
    }

    &[data-checked="true"]::after {
        opacity: 1;
    }
`;

const OptionLabel = styled.span`
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const FooterBar = styled.div`
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 4px 10px;
    border-top: 1px solid #e0e0e0;
    background: #ffffff;
`;

const ClearButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    font-size: 14px;
    color: #888888;
    padding: 2px 6px;
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;

    &:hover {
        background: #f0f0f0;
        color: #333333;
    }
`;

// ==================== Editor Component ====================

const Editor: ProvideEditorComponent<SelectCell> = p => {
    const { value: cell, onFinishedEditing, onChange, target } = p;

    const { selectConfig } = cell;
    const { options, isMultiple, canClear, canEdit } = selectConfig;
    const isMultipleBool = isMultiple === true;
    const canClearBool = canClear === true;
    const canEditBool = canEdit === true;

    const [value, setValue] = React.useState(cell.data);
    const [inputText, setInputText] = React.useState<string>(() =>
        getDisplayText(cell.data, options)
    );
    const [activeIndex, setActiveIndex] = React.useState(0);
    const [isOpen, setIsOpen] = React.useState(true);
    const [popupPos, setPopupPos] = React.useState<{ top: number, left: number, width: number, placement: "top" | "bottom" } | null>(null);
    const [popupHeight, setPopupHeight] = React.useState(0);

    const inputRef = React.useRef<HTMLTextAreaElement | null>(null);
    const optionsListRef = React.useRef<HTMLDivElement | null>(null);
    const dropdownRef = React.useRef<HTMLDivElement | null>(null);

    // Use target (canvas cell coords) directly for perfect alignment with cell borders
    const calcPosition = React.useCallback((measuredHeight: number) => {
        if (!target) return null;

        const MARGIN = 16;
        const MAX_HEIGHT = 360;
        const MIN_POPUP_WIDTH = 150;

        const cellX = target.x;
        const cellY = target.y;
        const cellHeight = target.height;
        const cellWidth = target.width;

        const popupWidth = Math.max(cellWidth, MIN_POPUP_WIDTH);

        const spaceBelow = window.innerHeight - (cellY + cellHeight) - MARGIN;
        const spaceAbove = cellY - MARGIN;

        let top: number;
        let placement: "top" | "bottom";

        if (spaceBelow >= MAX_HEIGHT || spaceBelow >= spaceAbove) {
            top = cellY + cellHeight;
            placement = "bottom";
        } else {
            const h = measuredHeight > 0 ? measuredHeight : Math.min(MAX_HEIGHT, options.length * 28 + 50);
            top = Math.max(8, cellY - h);
            placement = "top";
        }

        let left = cellX;
        if (left + popupWidth > window.innerWidth - 8) {
            left = Math.max(8, window.innerWidth - popupWidth - 8);
        }

        return { top, left, width: popupWidth, placement };
    }, [target, options.length]);

    React.useLayoutEffect(() => {
        if (!target) return;
        const pos = calcPosition(popupHeight);
        if (pos) setPopupPos(pos);
    }, [calcPosition, popupHeight]);

    // Re-calculate position on scroll/resize
    React.useEffect(() => {
        if (!isOpen || !target) return;

        const recalculate = () => {
            const pos = calcPosition(popupHeight);
            if (pos) setPopupPos(pos);
        };

        window.addEventListener('scroll', recalculate, true);
        window.addEventListener('resize', recalculate);

        return () => {
            window.removeEventListener('scroll', recalculate, true);
            window.removeEventListener('resize', recalculate);
        };
    }, [isOpen, target, popupHeight, calcPosition]);

    // Measure popup height after render for accurate "open above" positioning
    React.useEffect(() => {
        if (!isOpen || !dropdownRef.current) return;
        const height = dropdownRef.current.offsetHeight;
        if (height !== popupHeight) {
            setPopupHeight(height);
        }
    }, [isOpen, popupPos]);

    // Sync input text with value
    React.useEffect(() => {
        setInputText(getDisplayText(value, options));
    }, [value, options]);

    // Update parent cell value
    const updateCellValue = React.useCallback(
        (newValue: string) => {
            setValue(newValue);
            if (onChange) {
                onChange({
                    ...cell,
                    data: newValue,
                    displayData: getDisplayText(newValue, options),
                });
            }
        },
        [cell, onChange, options]
    );

    // Finish editing with current value
    const finishWithValue = React.useCallback(
        (newValue: string, movement?: readonly [-1 | 0 | 1, -1 | 0 | 1]) => {
            setIsOpen(false);
            onFinishedEditing(
                {
                    ...cell,
                    data: newValue,
                    displayData: getDisplayText(newValue, options),
                    copyData: newValue ?? "",
                },
                movement
            );
        },
        [cell, onFinishedEditing, options]
    );

    // Handle option click
    const handleOptionClick = React.useCallback(
        (opt: SelectOption, e?: React.MouseEvent) => {
            e?.stopPropagation();
            if (opt.disabled) return;

            if (isMultipleBool) {
                const newValue = toggleValue(opt.value, value, true);
                updateCellValue(newValue);
            } else {
                const newValue = opt.value;
                updateCellValue(newValue);
                // Single select: finish editing on selection
                setTimeout(() => finishWithValue(newValue, [0, 0]), 0);
            }
        },
        [isMultipleBool, value, updateCellValue, finishWithValue]
    );

    // Clear all selections
    const handleClear = React.useCallback(() => {
        updateCellValue("");
        inputRef.current?.focus();
    }, [updateCellValue]);

    // Keyboard navigation
    const handleKeyDown = React.useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                e.stopPropagation();
                if (isOpen) {
                    setActiveIndex(prev => {
                        const next = prev + 1;
                        const searchFrom = options.length === 0 ? 0 : next % options.length;
                        let finalIdx = searchFrom;
                        for (let i = 0; i < options.length; i++) {
                            const checkIdx = (searchFrom + i) % options.length;
                            if (!options[checkIdx]?.disabled) {
                                finalIdx = checkIdx;
                                break;
                            }
                        }
                        setTimeout(() => {
                            const el = optionsListRef.current?.querySelector(
                                `[data-idx="${finalIdx}"]`
                            ) as HTMLElement | null;
                            el?.scrollIntoView({ block: "nearest" });
                        }, 0);
                        return finalIdx;
                    });
                }
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                e.stopPropagation();
                if (isOpen && options.length > 0) {
                    setActiveIndex(prev => {
                        const prevIdx = (prev - 1 + options.length) % options.length;
                        let finalIdx = prevIdx;
                        for (let i = 0; i < options.length; i++) {
                            const checkIdx = (prevIdx - i + options.length) % options.length;
                            if (!options[checkIdx]?.disabled) {
                                finalIdx = checkIdx;
                                break;
                            }
                        }
                        setTimeout(() => {
                            const el = optionsListRef.current?.querySelector(
                                `[data-idx="${finalIdx}"]`
                            ) as HTMLElement | null;
                            el?.scrollIntoView({ block: "nearest" });
                        }, 0);
                        return finalIdx;
                    });
                }
            } else if (e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                if (isOpen && isMultipleBool) {
                    const opt = options[activeIndex];
                    if (opt && !opt.disabled) {
                        const newValue = toggleValue(opt.value, value, true);
                        updateCellValue(newValue);
                    }
                }
            } else if (e.key === "Enter") {
                if (!e.shiftKey && isOpen) {
                    const opt = options[activeIndex];
                    if (opt && !opt.disabled) {
                        if (isMultipleBool) {
                            e.preventDefault();
                            e.stopPropagation();
                            finishWithValue(value, [0, 1]);
                        } else {
                            e.preventDefault();
                            e.stopPropagation();
                            finishWithValue(opt.value, [0, 1]);
                        }
                    }
                }
            } else if (e.key === "Tab") {
                if (isOpen && !isMultipleBool) {
                    const opt = options[activeIndex];
                    if (opt && !opt.disabled) {
                        e.preventDefault();
                        e.stopPropagation();
                        finishWithValue(opt.value, [e.shiftKey ? -1 : 1, 0]);
                    }
                }
            } else if (e.key === "Escape") {
                e.stopPropagation();
                e.preventDefault();
                setIsOpen(false);
                onFinishedEditing(undefined, [0, 0]);
            }
        },
        [options, activeIndex, isOpen, isMultipleBool, value, updateCellValue, finishWithValue, onFinishedEditing]
    );

    // Handle input text change (when canEdit is true)
    const handleInputChange = React.useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const newText = e.target.value;
            setInputText(newText);
        },
        []
    );

    // Readonly cell rendering
    if (cell.readonly) {
        return (
            <div style={{ margin: "auto 8.5px", paddingBottom: "3px" }}>
                <GrowingEntry
                    highlight={true}
                    autoFocus={false}
                    disabled={true}
                    value={getDisplayText(cell.data, options)}
                    onChange={() => undefined}
                />
            </div>
        );
    }

    return (
        <EditorWrap>
            <GrowingEntry
                ref={el => {
                    if (el) {
                        const ta = (el as any)?.querySelector?.("textarea");
                        if (ta) inputRef.current = ta;
                    }
                }}
                highlight={p.isHighlighted}
                autoFocus={true}
                disabled={!canEditBool}
                value={inputText}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                altNewline={true}
            />
            {isOpen && popupPos && typeof document !== 'undefined' && ReactDOM.createPortal(
                <DropdownOverlay
                    ref={dropdownRef}
                    style={{
                        top: popupPos.top,
                        left: popupPos.left,
                        width: popupPos.width,
                        ...(popupPos.placement === "bottom" ? { borderTop: "none" } : { borderBottom: "none" }),
                    }}
                    className="click-outside-ignore"
                    onClick={e => e.stopPropagation()}
                >
                    <OptionsList ref={optionsListRef}>
                        {options.length === 0 && (
                            <OptionItem data-active="false" data-disabled="true">
                                <OptionLabel style={{ color: "var(--gdg-text-light)" }}>
                                    无选项
                                </OptionLabel>
                            </OptionItem>
                        )}
                        {options.map((opt, idx) => {
                            const selected = isValueSelected(opt.value, value, isMultipleBool);
                            const active = idx === activeIndex;
                            return (
                                <OptionItem
                                    key={opt.value + "_" + idx}
                                    data-idx={idx}
                                    data-active={active ? "true" : "false"}
                                    data-disabled={opt.disabled === true ? "true" : "false"}
                                    onMouseEnter={() => !opt.disabled && setActiveIndex(idx)}
                                    onClick={e => handleOptionClick(opt, e)}
                                >
                                    {isMultipleBool && (
                                        <CheckBox data-checked={selected ? "true" : "false"} />
                                    )}
                                    <OptionLabel>{opt.label}</OptionLabel>
                                </OptionItem>
                            );
                        })}
                    </OptionsList>
                    {canClearBool && (
                        <FooterBar>
                            <ClearButton onClick={handleClear} title="清空选择">
                                ✕
                            </ClearButton>
                        </FooterBar>
                    )}
                </DropdownOverlay>,
                document.body
            )}
        </EditorWrap>
    );
};

// ==================== Internal Cell Renderer ====================

export const selectCellRenderer: InternalCellRenderer<SelectCell> = {
    kind: GridCellKind.Select,
    needsHover: false,
    needsHoverPosition: false,
    useLabel: true,
    drawPrep: prepTextCell,
    draw: (args: DrawArgs<SelectCell>, cell: SelectCell) => {
        drawSelectCell(args, cell);
    },
    measure: (ctx: CanvasRenderingContext2D, cell: SelectCell, theme: FullTheme) => {
        const { displayData, data, selectConfig } = cell;
        const options = selectConfig?.options;
        const showIcon = selectConfig?.showIcon === true;

        let displayText: string;
        if (displayData !== undefined && displayData !== null && displayData !== "") {
            displayText = displayData;
        } else if (data !== undefined && data !== null && data !== "") {
            displayText = getDisplayText(data, options) || String(data);
        } else {
            displayText = "";
        }

        const iconWidth = showIcon ? 24 : 0;
        return (displayText ? ctx.measureText(displayText).width : 0) + theme.cellHorizontalPadding * 2 + iconWidth;
    },
    provideEditor: () => ({
        editor: Editor,
        styleOverride: { animation: "none" },
        deletedValue: (v: SelectCell): SelectCell => ({
            ...v,
            data: "",
            displayData: "",
            copyData: "",
        }),
    }),
    onPaste: (toPaste: string, cell: SelectCell) => {
        const { options, isMultiple } = cell.selectConfig;
        // No change
        if (toPaste === cell.data) return undefined;

        if (isMultiple) {
            const pasteValues = toPaste.split(",");
            const validValues = pasteValues.filter(pv =>
                options.some(opt => opt.value === pv && !opt.disabled)
            );
            return {
                ...cell,
                data: validValues.join(","),
                displayData: getDisplayText(validValues.join(","), options),
            };
        } else {
            const validOption = options.find(opt => opt.value === toPaste && !opt.disabled);
            if (!validOption) return undefined;
            return {
                ...cell,
                data: toPaste,
                displayData: getDisplayText(toPaste, options),
            };
        }
    },
    getAccessibilityString: (cell: SelectCell) => {
        return getDisplayText(cell.data, cell.selectConfig.options);
    },
    onDelete: (c: SelectCell) => ({
        ...c,
        data: "",
        displayData: "",
    }),
};

export default selectCellRenderer;
