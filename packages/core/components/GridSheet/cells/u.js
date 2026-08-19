export function prepTextCell(args, lastPrep, overrideColor) {
    const { ctx, theme } = args;
    const result = lastPrep ?? {};
    const newFill = overrideColor ?? theme.textDark;
    if (newFill !== result.fillStyle) {
        ctx.fillStyle = newFill;
        result.fillStyle = newFill;
    }
    return result;
}