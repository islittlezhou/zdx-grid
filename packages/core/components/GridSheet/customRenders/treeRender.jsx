import {
  GridCellKind,
  drawTextCell,
  TextCellEntry,
} from "zdx-grid";

const collapseIcon = './collapse.png';
const expandIcon = './expand.png';

const hLineWidth = 12;   // 水平线长度
const firstIndent = 8;
const offset = 14;     // 折叠图标 之间的 偏移距离
const iconSize = 14;    // 图标大小 
const halfIconSize = iconSize / 2;    // 图标一半大小

const checkboxSize = 14;   // checkbox 大小
const checkboxGap = 4;     // checkbox 与 线条/文字 的间距

// 折叠图标 偏移量(注意：偏移量是相对于当前单元格的)
const iconLineOffsetMap = {
  0: firstIndent,
  1: firstIndent + offset * 1,
  2: firstIndent + offset * 2,
  3: firstIndent + offset * 3,
  4: firstIndent + offset * 4,
  5: firstIndent + offset * 5,
  6: firstIndent + offset * 6,
  7: firstIndent + offset * 7,
  8: firstIndent + offset * 8,
  9: firstIndent + offset * 9,
  10: firstIndent + offset * 10,
  11: firstIndent + offset * 11,
  12: firstIndent + offset * 12,
  13: firstIndent + offset * 13,
  14: firstIndent + offset * 14,
}

// 垂直线 偏移量(注意：偏移量是相对于当前单元格的)
const vLineOffsetMap = {
  0: firstIndent + halfIconSize,
  1: firstIndent + halfIconSize + offset * 1,
  2: firstIndent + halfIconSize + offset * 2,
  3: firstIndent + halfIconSize + offset * 3,
  4: firstIndent + halfIconSize + offset * 4,
  5: firstIndent + halfIconSize + offset * 5,
  6: firstIndent + halfIconSize + offset * 6,
  7: firstIndent + halfIconSize + offset * 7,
  8: firstIndent + halfIconSize + offset * 8,
  9: firstIndent + halfIconSize + offset * 9,
  10: firstIndent + halfIconSize + offset * 10,
  11: firstIndent + halfIconSize + offset * 11,
  12: firstIndent + halfIconSize + offset * 12,
  13: firstIndent + halfIconSize + offset * 13,
  14: firstIndent + halfIconSize + offset * 14,
}

const hLineOffsetMap = {
  0: iconLineOffsetMap[0] + iconSize - 1,
  1: iconLineOffsetMap[1] + iconSize - 1,
  2: iconLineOffsetMap[2] + iconSize - 1,
  3: iconLineOffsetMap[3] + iconSize - 1,
  4: iconLineOffsetMap[4] + iconSize - 1,
  5: iconLineOffsetMap[5] + iconSize - 1,
  6: iconLineOffsetMap[6] + iconSize - 1,
  7: iconLineOffsetMap[7] + iconSize - 1,
  8: iconLineOffsetMap[8] + iconSize - 1,
  9: iconLineOffsetMap[9] + iconSize - 1,
  10: iconLineOffsetMap[10] + iconSize - 1,
  11: iconLineOffsetMap[11] + iconSize - 1,
  12: iconLineOffsetMap[12] + iconSize - 1,
  13: iconLineOffsetMap[13] + iconSize - 1,
  14: iconLineOffsetMap[14] + iconSize - 1,
}

// Canvas 绘制 checkbox（对齐官方 boolean-cell 样式）
function drawCheckbox(ctx, x, y, size, checked, theme, hoverAmount = 0, hoverX = -20, hoverY = -20, highlighted = false) {
  const centerY = Math.floor(y + size / 2);
  const radius = theme.roundingRadius ?? 4;
  const halfWidth = size / 2;

  // 计算hover状态
  const bb = {
    x1: x + size / 2 - size / 2,
    y1: centerY - size / 2,
    x2: x + size / 2 + size / 2,
    y2: centerY + size / 2,
  };
  const hovered = bb.x1 <= hoverX && hoverX <= bb.x2 && bb.y1 <= hoverY && hoverY <= bb.y2;

  if (checked === true) {
    // 选中状态：填充背景 + 白色勾
    ctx.beginPath();
    roundedRectPath(ctx, x, centerY - halfWidth, size, size, radius);
    ctx.fillStyle = highlighted ? theme.accentColor : theme.textMedium;
    ctx.fill();

    // 绘制勾（对齐官方 draw-checkbox.ts 实现）
    // posX - checkBoxHalfWidth = x（左边缘）
    // centerY - checkBoxHalfWidth = y（上边缘）
    ctx.beginPath();
    ctx.moveTo(
      x + size / 4.23,
      centerY - halfWidth + size / 1.97
    );
    ctx.lineTo(
      x + size / 2.42,
      centerY - halfWidth + size / 1.44
    );
    ctx.lineTo(
      x + size / 1.29,
      centerY - halfWidth + size / 3.25
    );
    ctx.strokeStyle = '#fff';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 1.9;
    ctx.stroke();
  } else if (checked === 'indeterminate') {
    // 半选状态：灰色填充 + 白色横线
    ctx.beginPath();
    roundedRectPath(ctx, x, centerY - halfWidth, size, size, radius);
    ctx.fillStyle = hovered ? theme.textMedium : theme.textLight;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x + size / 3, centerY);
    ctx.lineTo(x + size - size / 3, centerY);
    ctx.strokeStyle = '#fff';
    ctx.lineCap = 'round';
    ctx.lineWidth = 1.9;
    ctx.stroke();
  } else {
    // 未选中状态：边框（hover时颜色变深）
    ctx.beginPath();
    roundedRectPath(ctx, x + 0.5, centerY - halfWidth + 0.5, size - 1, size - 1, radius);
    ctx.lineWidth = 1;
    ctx.strokeStyle = hovered ? theme.textDark : theme.textMedium;
    ctx.stroke();
  }
}

// 辅助：创建圆角矩形路径
function roundedRectPath(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

const TreeRender = {
  // 必须是 Custom
  kind: GridCellKind.Custom,
  // 用来识别是不是你的 cell
  isMatch: (cell) => cell.cellType === "my-custom-cell",
  // 绘制逻辑（Canvas 绘图）
  // draw: () => {},
  draw: (args, cell) => {
    // console.log('args ---> ', args)
    // console.log('cell ---> ', cell)
    const { ctx, rect, theme, imageLoader, hoverAmount, hoverX, hoverY, highlighted } = args;
    const {row, col} = cell
    const value = cell.data; // 你的数据

    const rowData = cell.ref.viewData[row];

    // 获取当前 行 所有的 祖先节点(包括自身) 
    const ancestors = cell.ref.getAncestorsById(rowData.ID, true);

    const len = ancestors.length;

    // 清一下区域
    // ctx.clearRect(rect.x, rect.y, rect.width, rect.height);

    // console.log('theme --> ', theme)

    // 画个背景色
    // ctx.fillStyle = value > 50 ? "#22c55e" : "#ef4444";
    // ctx.fillStyle = theme.bgCell;
    // ctx.fillRect(rect.x , rect.y , rect.width , rect.height );


    // 用 imageLoader 加载（自动缓存）
    // imageLoader.loadImage(iconSrc, args.col, args.row, 'rgf');


    // 跟高度相关的 偏移量 必须实时计算(因为高度 可能不定高)
    const blankHeight = (rect.height - 14) / 2;
    const halfHeight = rect.height / 2;

    // 线条宽度是 奇数 时，必须 +0.5，不然线条 会 模糊
    // 线条宽度是 偶数 时，不需要 +0.5，线条会正常在像素点上绘制
    const drawLine = (ctx, startX, startY, endX, endY) => {
      // ctx.moveTo(startX, startY);
      // ctx.lineTo(endX, endY);
      if (startX === endX) {
        ctx.moveTo(startX + 0.5, startY);
        ctx.lineTo(endX + 0.5, endY);
      } else if (startY === endY) {
        ctx.moveTo(startX, startY + 0.5);
        ctx.lineTo(endX, endY + 0.5);
      } else {
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
      }
    }
    
    // 绘制 树形 结构 连线
    ctx.strokeStyle = theme.borderColor;
    // ctx.strokeStyle = '#d0d1d3';
    // ctx.strokeStyle = '#e8e9eb';
    // ctx.strokeStyle = '#f7c129';

    ctx.lineWidth = 1;
    ctx.beginPath();

    for(let i = 0; i < len; i ++){
      // ancestors
      if(i == len - 1){   // 自身节点时  collapseIcon
        const hLineYTop = rect.x + vLineOffsetMap[i]
        const flag = cell.ref.findPrevSameLevelNode(rowData.ID);    // 是否有同层级 排序 靠前 的一个 节点
        // len === 1 && !flag  --->  表示 该节点 是 根节点 且 没有 有同层级 排序 靠前 的一个 节点
        if(!(len === 1 && !flag)){
          drawLine(ctx, hLineYTop, rect.y + 1, hLineYTop, rect.y + halfHeight + 1);
        }


        const vLineY =  rect.y + halfHeight + 1
        drawLine(ctx, hLineYTop, vLineY, hLineYTop + hLineWidth, vLineY);


        // const isx = cell.ref.findNextSameLevelNode(rowData.ID);
        // console.log('isx --> ', isx)
        if(cell.ref.findNextSameLevelNode(rowData.ID)){
          const hLineYBottom = rect.x + vLineOffsetMap[i]
          drawLine(ctx, hLineYBottom, rect.y + rect.height - halfHeight + 1, hLineYBottom, rect.y + rect.height);
        }

      }else{
        const flag = cell.ref.findNextSameLevelNode(ancestors[i].ID);
        // console.log('是否同层级 排序靠后 的兄弟接地那', flag, ancestors[i].ID);
        if(flag){
          drawLine(ctx, rect.x + vLineOffsetMap[i], rect.y + 1, rect.x + vLineOffsetMap[i], rect.y + rect.height);
        }
      }
    }

    // 先绘制所有线条
    ctx.stroke();

    // 如果有子级 才绘制 折叠图标
    const childs = cell.ref.parentViewMap[rowData.ID] || [];
    if(childs.length > 0){
      // 绘制 折叠图标，最后绘制图标（覆盖在线条上面）
      const iconSrc = cell.ref.foldIdMap[rowData.ID] ? collapseIcon : expandIcon;
      const img = imageLoader.loadOrGetImage(iconSrc, args.col, args.row);

      if(img){
        const i = len - 1;
        const x = rect.x + iconLineOffsetMap[i];
        const y = 1 + rect.y + (rect.height - iconSize) / 2;
        ctx.drawImage(img, x, y, iconSize, iconSize);
      }
    }

    // 绘制 checkbox（在水平线和文字之间）
    const i = len - 1;
    const checkboxX = rect.x + vLineOffsetMap[i] + hLineWidth + checkboxGap;
    const checkboxY = rect.y + (rect.height - checkboxSize) / 2 + 1;
    const showCheckboxFlag = cell.ref.showTreeCheckbox ?? false;

    if (showCheckboxFlag) {
      const checked = cell.checked === undefined ? false : cell.checked;
      drawCheckbox(
        ctx,
        checkboxX,
        checkboxY,
        checkboxSize,
        checked,
        theme,
        hoverAmount || 0,
        hoverX || -20,
        hoverY || -20,
        highlighted || false
      );
    }

    // 文字起始位置（根据是否显示 checkbox 调整位置）
    const textStartX = showCheckboxFlag ? checkboxX + checkboxSize + checkboxGap : checkboxX;
    const textRect = {
      x: textStartX - theme.cellHorizontalPadding,
      y: rect.y,
      width: rect.x + rect.width - textStartX + theme.cellHorizontalPadding,
      height: rect.height,
    };
    drawTextCell(
      // { ctx, rect: textRect, theme },
      // Object.assign({}, args, { rect: textRect }),
      {...args, rect: textRect},
      String(value),
      "left",
      cell.allowWrapping === true,
      false
    );
  },
  onClick: (args) => {
    // console.log('点击时候的 args ---> ', args)

    // posX 和 posY 是点击位置 相对于 当前单元格 左上角的 偏移量
    // bounds 是当前单元格 的 x y 左上角坐标，  width height 单元格宽高 
    const { bounds, posX, posY, location, preventDefault, cell } = args;

    
    // const [col, row] = location; // 👈 关键：从 location 解包
    const { row, col } = cell;

    const rowData = cell.ref.viewData[row];

    // 获取当前 行 所有的 祖先节点(包括自身) 
    const ancestors = cell.ref.getAncestorsById(rowData.ID, true);

    const len = ancestors.length;
    const i = len - 1;
    const showCheckboxFlag = cell.ref.showTreeCheckbox ?? false;

    // 1. 先检测 checkbox 点击（垂直方向扩展到整个单元格高度）
    if (showCheckboxFlag) {
      const checkboxX = vLineOffsetMap[i] + hLineWidth + checkboxGap;
      
      const isCheckboxClicked =
        posX >= checkboxX &&
        posX <= checkboxX + checkboxSize &&
        posY >= 0 &&
        posY <= bounds.height;

      if (isCheckboxClicked) {
        console.log("✅ Checkbox 被点击！ 行：", row, " 列：", col);

        preventDefault();

        if (cell?.onCheckboxClick) {
          cell.onCheckboxClick({
            row,
            col,
            data: cell.data,
            cell,
            args
          });
        }

        return {
          ...args.cell,
          shouldContinue: false
        };
      }
    }

    // 2. 检测图标点击
    // 图标在单元格内部的坐标 → 关键！用 local 位置判断！
    const iconX = iconLineOffsetMap[i];
    const iconY = (bounds.height - iconSize) / 2;

    const isIconClicked =
      posX >= iconX &&
      posX <= iconX + iconSize &&
      posY >= 0 &&
      posY <= bounds.height;

    if (isIconClicked) {
      console.log("✅ 图标被点击！ 行：", row, " 列：", col);

      // 阻止默认事件
      preventDefault();

      if (cell?.onIconClick) {
        cell.onIconClick({
          row,       // 行号
          col,       // 列号
          data: cell.data, // 单元格完整数据
          cell,    // 原始 cell 对象
          args
        });
      }

      // 阻止继续触发选中/编辑
      return {
        ...args.cell,
        shouldContinue: false
      };
    }

    return undefined;
  },
  provideEditor: (cell) => ({
    disablePadding: cell.allowWrapping === true,
    editor: (p) => {
      const { isHighlighted, onChange, value, validatedSelection } = p;
      return (
        <TextCellEntry
          style={cell.allowWrapping === true ? { padding: "3px 8.5px" } : undefined}
          highlight={isHighlighted}
          autoFocus={value.readonly !== true}
          disabled={value.readonly === true}
          altNewline={true}
          value={value.data}
          validatedSelection={validatedSelection}
          onChange={e =>
            onChange({
              ...value,
              data: e.target.value,
            })
          }
        />
      );
    },
  }),
}

export default TreeRender