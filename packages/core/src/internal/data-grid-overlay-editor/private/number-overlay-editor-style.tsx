import { styled } from "@linaria/react";

export const NumberOverlayEditorStyle = styled.div`
    position: relative;
    margin-top: 3px;
    height: 100%;
    color: var(--gdg-text-dark);

    > .npc-shadow {
        visibility: hidden;
        white-space: pre;
        width: max-content;
        max-width: 100%;
        min-width: 100%;
        font-size: var(--gdg-editor-font-size);
        line-height: 16px;
        font-family: var(--gdg-font-family);
        padding: 0;
        margin: 0;
    }

    > .npc-input {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        min-width: 0;
        font-size: var(--gdg-editor-font-size);
        line-height: 16px;
        padding: 0;
        margin: 0;
        font-family: var(--gdg-font-family);
        color: var(--gdg-text-dark);
        background-color: var(--gdg-bg-cell);
        border: none;
        outline: none;
    }
`;
