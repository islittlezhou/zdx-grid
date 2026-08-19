import {
  GridCellKind,
  drawTextCell,
  // CustomRenderer
} from "zdx-grid";
import { prepTextCell } from "./u.js";



const ZdxTextCell = {
  // 必须是 Custom
  kind: GridCellKind.Custom,
  // 用来识别是不是你的 cell
  isMatch: (cell) => cell.cellType === "zdx-text-cell",
  // 绘制逻辑（Canvas 绘图）
  drawPrep: (args, lastPrep) => prepTextCell(args, lastPrep),
  draw: (args) => {
    // console.log('args ---> ', args)
    // console.log('cell ---> ', cell)
    // console.log('相同 ', args.cell === cell)
    // const { ctx, rect, theme, imageLoader } = args;
    // const {row, col} = cell
    // const value = cell.data; // 你的数据

    // const rowData = cell.ref.viewData[row];

    // // 画文字
    // ctx.fillStyle = theme.textDark;
    // ctx.font = `${theme.baseFontSize}px sans-serif`;
    // ctx.textAlign = "left";
    // ctx.textBaseline = "middle";
    // ctx.fillText(
    //   String(value) + 'g',
    //   // rect.x + rect.width / 2,
    //   rect.x + 8,
    //   2 + rect.y + rect.height / 2
    // );
    const { cell, hoverAmount, hyperWrapping, ctx, rect, theme, overrideCursor } = args;
    const { displayData, contentAlign, hoverEffect, allowWrapping, hoverEffectTheme } = cell;
    if (hoverEffect === true && hoverAmount > 0) {
        drawEditHoverIndicator(ctx, theme, hoverEffectTheme, displayData, rect, hoverAmount, overrideCursor);
    }
    drawTextCell(args, displayData, contentAlign, allowWrapping, hyperWrapping);
  },
  onClick: (args) => {
 

    // 上面 调整成 x 的点必须准确，但是 Y 轴区域都可以点击
    // const isIconClicked =

    // if (isIconClicked) {
    //   console.log("✅ 图标被点击！ 行：", row, " 列：", col);

    //   // // 阻止默认事件
    //   // preventDefault();

    //   // if (cell?.onIconClick) {
    //   //   cell.onIconClick({
    //   //     row,       // 行号
    //   //     col,       // 列号
    //   //     data: cell.data, // 单元格完整数据
    //   //     cell,    // 原始 cell 对象
    //   //     args
    //   //   });
    //   // }

    //   // 阻止继续触发选中/编辑
    //   return {
    //     ...args.cell,
    //     shouldContinue: false
    //   };
    // }

    return undefined;
  },
  // 编辑器
  provideEditor: () => (item) => {
    console.log('编辑器的 item ---> ', item)
    const { value, onChange, onFinishedEditing, target } = item;
    // console.log('传入的值：', value);
    return (
     <input
        style={{
          height: `${target.height - 4}px`,
          width: `${target.width - 6}px`,
          minHeight: `${target.height - 4}px`,
          outline: "none",
          border: "none",
          flex: 1,
          // resize: 'none',
          // overflow: 'hidden',
          // whiteSpace: 'pre-wrap',
          // minWidth:'100%'
          // background: 'red'
        }}
        value={value.data}
        onChange={e => {
          console.log('onChange ---> ', e.target.value)
          onChange({ ...value, data: e.target.value })
        }}
        // onBlur={onFinishedEditing}
        autoFocus
      />
      // <textarea
      //   style={{
      //     height: `auto`,
      //     width: "{rect.width}px",
      //     outline: "none",
      //     border: "none",
      //     flex: 1,
      //     // resize: 'none',
      //     // overflow: 'hidden',
      //     // whiteSpace: 'pre-wrap',
      //     // minWidth:'100%'
      //     // background: 'red'
      //   }}
      //   dir="auto"
      //   cols="42" 
      //   rows="5" 
      //   value={value.data}
      //   onChange={e => {
      //     console.log('onChange ---> ', e.target.value)
      //     onChange({ ...value, data: e.target.value })
      //   }}
      //   // onBlur={onFinishedEditing}
      //   autoFocus
      // />
    )
  }
}

export default ZdxTextCell
