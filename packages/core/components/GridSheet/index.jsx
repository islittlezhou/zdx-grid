import { useRef, useState, useMemo, useEffect, useImperativeHandle } from 'react';
import TreeRender from './customRenders/treeRender';

import {
  DataEditor,
  GridCellKind,
  CompactSelection,
  // GridSelection,
  // Item
  // Theme
  // GridCell
  // GetRowThemeCallback
} from "zdx-grid";

function GridSheet ({ ref = useRef(), ...props }){

  const refEditor = useRef(null);
  const isCtrlPressed = useRef(false);

  // 是否显示树形单元格的勾选框，默认 false 不开启
  const showTreeCheckbox = props.showTreeCheckbox ?? false;

  // 默认选中的 行 索引
  const [initSelectRowIndex] = useState(() => props.initSelectRowIndex || 0);

  const setRowExtraData = (rowDatas = [], columns = []) => {

    const getRowBgColor = props.getRowBgColor || (() => null);

    for(let i = 0; i < rowDatas.length; i++){
      const rowData = rowDatas[i];

        // rowData._rowBgColor = getRowBgColor(rowData),     // 行背景色
        // rowData._cellBgColor = '';        // 单元格背景色
        // rowData._editMap = {}        // 单元格 是否可 编辑 映射

      const proto = {
        _rowBgColor: getRowBgColor(rowData),     // 行背景色
        _cellBgColor: '',        // 单元格背景色
        _editMap: {}        // 单元格 是否可 编辑 映射
      }

      Object.setPrototypeOf(rowData, proto);    // 设置这个对象独一无二的原型
    }
  }

  const [columns, setColumns] = useState(props.columns || []); // 表格列数据
  // ✅ 只在第一次 render 前执行一次：初始化 data
  const [data, setData] = useState(() => {
    console.log("组件初始化 —— 只执行一次");
    console.time('a1')

    setRowExtraData(props.data || [], columns);

    // 处理数据，不污染父组件
    // const arr =  (props.data || []).map(item => ({
    //   ...item,
    //   // getCtx: () => ref, // 绑定组件 ref，这个很重要，用于建立数据和组件实例之间的应用关系
    // }));
    console.timeEnd('a1')
    return props.data;
  });

  window.setData = setData;

  const prevSelectioNRef = useRef(null);

  const [selection, setSelection] = useState({
    current: {
      cell: [0, 0],
      range: {
        x: 1,
        y: 0,
        width: 1,
        height: 1,
      },
      rangeStack: []
    },
    columns: CompactSelection.empty(),
    rows: CompactSelection.empty().add(initSelectRowIndex)
  });

  useEffect(() => {

    const prevRowIndex = prevSelectioNRef.current?.current?.cell?.[1];
    const currentRowIndex = selection.current?.cell?.[1] || 0;

    prevSelectioNRef.current = selection;
    
    if(prevRowIndex !== currentRowIndex) {
      props?.currentRowChange(viewData[currentRowIndex], currentRowIndex);
    }
  }, [selection]);



  // ✅ 使用 useEffect 确保只在组件挂载时执行一次
  // useEffect(() => {
  //   // 如果已经绑定过，直接返回
  //   if (isKeyHandlerBound) {
  //     console.log('键盘事件已绑定，跳过');
  //     return;
  //   }

  //   // 绑定键盘事件
  //   window.addEventListener('keydown', onKeyDown);
  //   window.addEventListener('keyup', onKeyUp);
  //   isKeyHandlerBound = true;  // 标记为已绑定

  //   console.log('键盘事件绑定成功');

  //   // 组件卸载时解绑（可选）
  //   return () => {
  //     // 如果需要解绑，可以在这里解绑
  //     // window.removeEventListener('keydown', onKeyDown);
  //     // window.removeEventListener('keyup', onKeyUp);
  //     // isKeyHandlerBound = false;
  //   };
  // }, []);  // 空依赖数组，确保只执行一次

  // filterIdMap 里面的 ID 数据都会被隐藏(被过滤掉)
  const [filterIdMap, setFilterIdMap] = useState({}); // 过滤的行数据映射，key 是 数据行的 ID
  const [foldIdMap, setFoldIdMap] = useState({});   // 折叠 行 ID 映射对象，例如 {1: true} ID 为 1 的如果为 true，标识为折叠行，否则是展开行(默认空对象全部展开)
  const [checkedMap, setCheckedMap] = useState({});  // 勾选 行 ID 映射对象，例如 {1: true/false/undefined} ID 为 key，value 为勾选状态

  // ID 对 实际数据的映射(所有数据，包括被filter过滤的数据 也有这个 ID 的映射关系)
  const idDataMap = useMemo(() => {
    return data.reduce((map, item) => {
        map[item.ID] = item;
        return map;
    }, {});
  }, [data]);

  const filterData = useMemo(() => {
    return data.filter(item => !filterIdMap[item.ID]);
  }, [data, filterIdMap]);

  // (注意！仅针对视图数据的父子关系，就是 filterData 数据)，被 filter 过滤的数据不在这个关系里面
  // 当前视图数据中 父节 的 儿子 节点数据
  const parentViewMap = useMemo(() => {
    return filterData.reduce((map, item) => {
      const PID = item.PID || '-1';
      (map[PID] || (map[PID] = [])).push(item);
      return map;
    }, {});
  }, [filterData]);

  // 获取当前节点所有子孙后代(如果只是找儿子，用 parentViewMap 即可 ), flag 是否 将自身包含在内
  const getAllChild = (ID, flag = false) => {
    const e = [];

    const fn = (arr) => {
      for(let i = 0;i < arr.length;i ++){
        e.push(arr[i]);
        fn(parentViewMap[arr[i].ID] || []);
      }
    }

    fn(parentViewMap[ID] || []);

    flag && (e.unshift(idDataMap[ID]));     // flag 是否将自身数据返回

    return e
  }

  const hideIdMap = useMemo(() => {
    const keys = Object.keys(foldIdMap);
    const cMap = {}
    for(let i = 0; i < keys.length; i ++){
      if(!foldIdMap[keys[i]]) continue;
      const allChilds = getAllChild(keys[i], false);
      for(let c = 0; c < allChilds.length; c ++){
        cMap[allChilds[c].ID] = true;
      }
    }
    return cMap;
  }, [parentViewMap, foldIdMap]);

  // 每次渲染重新计算（Compiler 自动缓存）
  // (重要!)viewData 始终只表示表格中展示的数据(ViewData 就是视图数据 始终和表格数据保持一致！)
  const viewData = useMemo(() => {
    return filterData.filter(item => !hideIdMap[item.ID]);
  }, [filterData, hideIdMap]);

  const rows = useMemo(() => viewData.length, [viewData]);


  const getSelectRowDatas = window.getSelectRowDatas = () => {
    const arr = selection.rows?.toArray() || [];
    return arr.reduce((prev, rowIndex) => {
        prev.push(viewData[rowIndex]);
        return prev;
    }, []);
  }

  const getCurrentRowData = window.getCurrentRowData = () => {
    return viewData[selection.current?.cell?.[1]] || null;
  }

  const foldRowById = (ID) => {
    const rowData = idDataMap[ID];
  }

  // 通过行 ID 找到 父级
  const getParentById = (ID) => {
    try {
      return idDataMap[idDataMap[ID].PID] || null
    } catch (error) {
      console.log('getParentById --> ', error, ID, idDataMap)
    }
  }

  //找到同层级的节点 的下一个节点(排序靠后面那一个)【注意，仅针对视图数据，不管原始数据】
  const findNextSameLevelNode = (ID) => {
    const t = idDataMap[ID];

    if (!t) return null;
    
    // console.log('parentViewMap --->  ', parentViewMap)

    const childs = parentViewMap[t.PID] || []; 

    if(childs.length == 0) return null;

    const idx = childs.findIndex(item => item.ID === t.ID);

    if(idx == -1 || idx == childs.length - 1) return null;

    return childs[idx + 1]; 
  }

  // 找到同层级的节点 的上一个节点(排序靠前面那一个)【注意，仅针对视图数据，不管原始数据】
  const findPrevSameLevelNode = (ID) => {
    const t = idDataMap[ID];
    
    if (!t) return null;
        
    const childs = parentViewMap[t.PID] || []; 

    if(childs.length == 0) return null;

    const idx = childs.findIndex(item => item.ID === t.ID);

    if(idx == -1 || idx == 0) return null;

    return childs[idx - 1]; 
  }

  // 找到当前节点的祖先--所有祖先【例如：爸爸、爷爷、太公。。。。 直到你的祖宗十八代】  flag --- 是否将自身包含在内
  const getAncestorsById = (ID, flag = false) => {      
    const e = [];         //  ['祖宗', '.....', '爷爷', '爸爸', '我']
    let t = getParentById(ID);

    for (; t; ) {
      e.unshift(t),
      t = getParentById(t.ID);
    }

    flag && (e.push(idDataMap[ID]));     // flag 是否将自身数据返回

    return e
  }

  const getRowDataIndent = (ID) => {

    let indent = 0;
    let rowData = idDataMap[ID];

    while(rowData){
      indent ++

      rowData = idDataMap(node.PID);
    }
    
    return indent;
  }

  const test = () => {
    console.log('我是子组件的 test 函数，被父组件调用了！');
  };

  const [flag, setFlag] = useState(false);

  // const idMap = {
  //   '8':null,
  //   '9':null,
  //   '10':null
  // }

  const handleIconClick = (item) => {
    console.log('item ---> ', item)
    console.log('---->  ', getAllChild(viewData[item.cell.row].ID, true));

    const rowData = viewData[item.cell.row]

    const nodeFoldStatus = Boolean(foldIdMap[rowData.ID]);

    const newNodeFoldStatus = !nodeFoldStatus;

    const newFoldIdMap = {
      ...foldIdMap,
      [rowData.ID]: newNodeFoldStatus
    }
    setFoldIdMap(newFoldIdMap);
  }

  // checkbox 点击处理
  const handleCheckboxClick = (item) => {
    console.log('checkbox item ---> ', item);

    const rowData = viewData[item.cell.row];
    const ID = rowData.ID;

    // checkStrictly: true=父子联动(默认), false=独立勾选互不影响
    const checkStrictly = props.checkStrictly ?? true;

    const newCheckedMap = { ...checkedMap };

    if (checkStrictly) {
      // 联动模式：获取当前节点的所有子孙节点（包含自身）
      const allNodes = getAllChild(ID, true);

      // 计算新的勾选状态：如果当前节点的所有子节点都被勾选，则取消勾选；否则全部勾选
      const allChecked = allNodes.every(node => checkedMap[node.ID] === true);
      const newStatus = !allChecked;

      for (const node of allNodes) {
        newCheckedMap[node.ID] = newStatus;
      }

      // 向上更新所有祖先节点的状态（逐级向上传播）
      let parent = getParentById(ID);
      while (parent) {
        const siblingChilds = parentViewMap[parent.ID] || [];
        const visibleChilds = siblingChilds.filter(c => !hideIdMap[c.ID]);
        if (visibleChilds.length === 0) break;

        // 统计子节点的勾选状态
        const total = visibleChilds.length;
        const checkedCount = visibleChilds.filter(c => newCheckedMap[c.ID] === true).length;
        const indeterminateCount = visibleChilds.filter(c => newCheckedMap[c.ID] === 'indeterminate').length;
        const uncheckedCount = total - checkedCount - indeterminateCount;

        // 根据子节点状态计算父节点状态：
        // 1. 所有子节点都勾选 → 父节点勾选
        // 2. 所有子节点都未勾选（无indeterminate） → 父节点未勾选
        // 3. 其他情况（部分勾选、部分未勾选、有indeterminate） → 父节点半选
        if (checkedCount === total) {
          newCheckedMap[parent.ID] = true;
        } else if (indeterminateCount === 0 && uncheckedCount === total) {
          newCheckedMap[parent.ID] = false;
        } else {
          newCheckedMap[parent.ID] = 'indeterminate';
        }

        parent = getParentById(parent.ID);
      }
    } else {
      // 独立模式：只切换当前节点的状态，不影响父子节点
      const currentStatus = checkedMap[ID];
      newCheckedMap[ID] = currentStatus === true ? false : true;
    }

    setCheckedMap(newCheckedMap);
  }

  const getData1 = (cell) => {
    const [col, row] = cell;
    const dataRow = viewData[row];
    const v = dataRow[columns[col].id];

    return {
          kind: GridCellKind.Text,
          allowOverlay: true,
          readonly: false,
          // displayData,
          displayData: v + '',
          data: v + '',
    }
  }

  const getData = (cell) => {
    // console.log('getData cell ---> ', cell);
    const [col, row] = cell;
    const dataRow = viewData[row];

    const v = dataRow[columns[col].id];

    // console.log('v --> ', v)

    // let displayData = v + '';


    // if(col === 0 && row < 10){
    //   displayData = displayData + '\n C1111111111111111111'
    // }

    if(col === 1){
      return createCell({
          kind: GridCellKind.Custom,
          // kind: GridCellKind.Text,
          allowOverlay: true,  // true 可触发弹框编辑组件(可编辑),  false 不可触发弹出编辑弹框组件(不可编辑)
          readonly: false,
          // displayData,
          displayData: v + '',
          // displayData: v + '\n发生的发顺丰所发生的',
          data: v + '',
          cellType: 'my-custom-cell',
          row,
          col,
          checked: checkedMap[dataRow.ID] ?? false,
          // style: 'faded',  //  "normal" | "faded";
          activationBehaviorOverride: 'double-click', // "double-click" | "single-click" | "second-click";
          // lastUpdated: dataRow.lastUpdated,
          // lastUpdated: performance.now(),// 修改时 单元格闪烁？
          themeOverride: {
            // bgCell: '#ffffd0'
          },
          // allowWrapping: true
      });
    }else if(col === 2){
      return createCell({
          kind: GridCellKind.Custom,
          // kind: GridCellKind.Text,
          allowOverlay: true,  // true 可触发弹框编辑组件(可编辑),  false 不可触发弹出编辑弹框组件(不可编辑)
          readonly: false,
          // displayData,
          displayData: v + '',
          // displayData: v + '\n发生的发顺丰所发生的',
          // data: v + '',
          data: {
              kind: "dropdown-cell",
              allowedValues: [null, "Good", "Better", { value: "best", label: "Best" }],
              value: v + '',
          },
          cellType: 'dropdown-cell',
          row,
          col,
          // style: 'faded',  //  "normal" | "faded";
          activationBehaviorOverride: 'double-click', // "double-click" | "single-click" | "second-click";
          // lastUpdated: dataRow.lastUpdated,
          // lastUpdated: performance.now(),// 修改时 单元格闪烁？
          themeOverride: {
            // bgCell: '#ffffd0'
          }
          // allowWrapping: true
      });
    }
    // else if(col === 3){
    //   return createCell({
    //       kind: GridCellKind.Custom,
    //       // kind: GridCellKind.Text,
    //       allowOverlay: true,  // true 可触发弹框编辑组件(可编辑),  false 不可触发弹出编辑弹框组件(不可编辑)
    //       readonly: false,
    //       // displayData,
    //       displayData: v + '',
    //       // displayData: v + '\n发生的发顺丰所发生的',
    //       // data: v + '',
    //       data: {
    //         kind:'tree-view-cell',
    //         text: v + '',
    //         canOpen: true,
    //         depth: 1
    //       },
    //       cellType: 'tree-view-cell',
    //       row,
    //       col,
    //       // style: 'faded',  //  "normal" | "faded";
    //       activationBehaviorOverride: 'double-click', // "double-click" | "single-click" | "second-click";
    //       // lastUpdated: dataRow.lastUpdated,
    //       // lastUpdated: performance.now(),// 修改时 单元格闪烁？
    //       themeOverride: {
    //         // bgCell: '#ffffd0'
    //       }
    //       // allowWrapping: true
    //   });
    // }
    else if(col === 4){
      return createCell({
          kind: GridCellKind.Boolean,
          allowOverlay: true,
          readonly: false,
          // displayData,
          displayData: v + '',
          row,
          col,
          maxSize: 14,
          // displayData: v + '\n发生的发顺丰所发生的',
          data: Boolean(v),
          // style: 'faded',  //  "normal" | "faded";
          // activationBehaviorOverride: 'double-click', // "double-click" | "single-click" | "second-click";
          // lastUpdated: dataRow.lastUpdated,
          // lastUpdated: performance.now(),// 修改时 单元格闪烁？
          // allowWrapping: true
      });
    }
    else if(col === 5){
      return createCell({
          kind: GridCellKind.Number,
          // kind: GridCellKind.Text,
          allowOverlay: true,  // true 可触发弹框编辑组件(可编辑),  false 不可触发弹出编辑弹框组件(不可编辑)
          readonly: false,
          // displayData,
          displayData: v + '',
          // displayData: v + '\n发生的发顺丰所发生的',
          data: v,
          row,
          col,
          // style: 'faded',  //  "normal" | "faded";
          activationBehaviorOverride: 'double-click', // "double-click" | "single-click" | "second-click";
          // lastUpdated: dataRow.lastUpdated,
          // lastUpdated: performance.now(),// 修改时 单元格闪烁？
          themeOverride: {
            // bgCell: '#ffffd0'
          }
          // allowWrapping: true
      });
    }
    else{
      return createCell({
          kind: GridCellKind.Text,
          allowOverlay: true,
          readonly: false,
          // displayData,
          displayData: v + '',
          row,
          col,
          // displayData: v + '\n发生的发顺丰所发生的',
          data: v + '',
          // style: 'faded',  //  "normal" | "faded";
          // activationBehaviorOverride: 'double-click', // "double-click" | "single-click" | "second-click";
          // lastUpdated: dataRow.lastUpdated,
          // lastUpdated: performance.now(),// 修改时 单元格闪烁？
          // allowWrapping: true,
          // disablePadding: true
      });
    }
  }

    // 单元格内容发生变更？
  const onCellEdited = (cell, newValue) => {
    console.log('onCellEdited  cell ---> ', cell);
    console.log(' onCellEdited  newValue ---> ', newValue);

    const [col, row] = cell;
    const dataRow = viewData[row];
    if(newValue.cellType === 'dropdown-cell'){
      dataRow[columns[col].id] = newValue.data.value
    }else{
      dataRow[columns[col].id] = newValue.data
    }
    // dataRow.lastUpdated = performance.now();
  }

  const onCellActivated = (...rest) => {
    // console.log('单元格进入编辑状态：', rest)
    return false
  }

  const onCellContextMenu = (...rest)  => {
    console.log('单元格鼠标右键菜单事件：', rest)
  }

  const onCellClicked = ([col, row], cell) => {
    // console.log(' onCellClicked ---> ', col, row, cell)
    // console.log('selection ---> ', structuredClone(selection))

    // setTimeout(() => {

    //   const newSelection = { ...selection };
      
    //   // ✅ Ctrl+点击：切换行选中状态
    //   if (cell.ctrlKey || cell.metaKey) {

    //     // 更新当前单元格位置
    //     // newSelection.current.cell = [col, row];
    //     // newSelection.current.range = {
    //     //   x: col,
    //     //   y: row,
    //     //   width: 1,
    //     //   height: 1,
    //     // };

    //     const newRangeStack = []
    //     const rangeStack = [...newSelection.current.rangeStack];

    //     for(let i = 0; i < rangeStack.length; i ++){
    //       const item = rangeStack[i];
    //       const min = item.y
    //       const max = item.y + item.height - 1
    //       if(row >= min && row <= max){   // 如果 当前点击 行在这个区间之内， 那就可能要分区了
    //         const rangeTop = { x: item.x, y: item.y, width: item.width, height: 0 }
    //         const rangeBottom = { x: item.x, y: row + 1, width: item.width, height: 0 }
    //         for(let c = min; c <= max; c ++){
    //           if(c === row) continue;
    //           if(c < row){
    //             rangeTop.height ++
    //           }else if(c > row){
    //             rangeBottom.height ++
    //           }
    //         }

    //         if(rangeTop.height){
    //           const flag = newRangeStack.find(t => t.x === rangeTop.x && t.y === rangeTop.y && t.width === rangeTop.width && t.height === rangeTop.height);
    //           !flag && newRangeStack.push(rangeTop)
    //         }

    //         if(rangeBottom.height){
    //           const flag = newRangeStack.find(t => t.x === rangeBottom.x && t.y === rangeBottom.y && t.width === rangeBottom.width && t.height === rangeBottom.height);
    //           !flag && newRangeStack.push(rangeBottom)
    //         }

    //       }else{
    //         const flag = newRangeStack.find(t => t.x === item.x && t.y === item.y && t.width === item.width && t.height === item.height);
    //         !flag && newRangeStack.push(item);
    //       }
    //     }
        
    //     const crange = newSelection.current.range
    //     const flag = newRangeStack.find(t => t.x === crange.x && t.y === crange.y && t.width === crange.width && t.height === crange.height);
    //     !flag && (rangeStack.push(crange));

    //     // newSelection.current.rangeStack = newRangeStack
    //     // newSelection.current.cell = [newRangeStack[0].x, newRangeStack[0].y]
    //     // newSelection.current.range = {
    //     //   x: newRangeStack[0].x,
    //     //   y: newRangeStack[0].y,
    //     //   width: 1,
    //     //   height: 1
    //     // }

    //     if (selection.rows.hasIndex(row)) {
    //       // 已选中 → 取消选中
    //       newSelection.rows = selection.rows.remove(row);
    //     } else {
    //       // 未选中 → 添加选中
    //       // newSelection.rows = selection.rows.add(row);
    //     }
    //   } else {
    //     // ✅ 普通点击：选中当前行
    //     newSelection.rows = CompactSelection.empty().add(row);
    //   }

    //   setSelection(newSelection);
    // }, 0);

    // setTimeout(() => {
    //   setSelection(prev => {
    //     // const newSelection = { ...prev };
        
    //     // // 更新当前单元格位置
    //     // newSelection.current.cell = [col, row];
    //     // newSelection.current.range = {
    //     //   x: col,
    //     //   y: row,
    //     //   width: 1,
    //     //   height: 1,
    //     // };
        
    //     // // ✅ Ctrl+点击：切换行选中状态
    //     // if (cell.ctrlKey || cell.metaKey) {
    //     //   if (prev.rows.hasIndex(row)) {
    //     //     // 已选中 → 取消选中
    //     //     newSelection.rows = prev.rows.remove(row);
    //     //   } else {
    //     //     // 未选中 → 添加选中
    //     //     newSelection.rows = prev.rows.add(row);
    //     //   }
    //     // } else {
    //     //   // ✅ 普通点击：选中当前行
    //     //   newSelection.rows = CompactSelection.empty().add(row);
    //     // }
    //     return newSelection;
    //   });
    // }, 0)
  }

  const onHeaderClicked = (...rest) => {
    console.log('表头鼠标左键点击：', rest)
  }

  const onHeaderContextMenu = (...rest) => {
    console.log('表头鼠标右键菜单：', rest)
  }

  const onKeyDown = (ev) => {
    
    if (ev.ctrlKey || ev.metaKey) {
      // console.log('onKeyDown ===> ', ev)
      isCtrlPressed.current = true;
      // console.log('Ctrl/Meta 按下');
    }
  }

  const onKeyUp = (ev) => {
    // console.log('onKeyUp ===? ', rest)
    if (!ev.ctrlKey || !ev.metaKey) {
      isCtrlPressed.current = false;
      // console.log('Ctrl/Meta 松开');
    }
  }

  const onDelete = (...rest) => {
    console.log('onDelete ---> ', rest)
  }

  // 无论 单元格内容 是否发生变更，都触发
  const onFinishedEditing = (...rest) => {
    // console.log("onFinishedEditing(无论单元格内容是否发生变更都触发) ===> ", rest)
  }

  const rowHeight = (index) => {

    if(index === 2 || index === 3){
      return 0
    }

    if(index%2 === 0){
      return 24
    }else if(index%2 === 1){
      return 48
    }
    // else if(index%3 === 2){
    //   return 0
    // }
    // return 0
  }

  const handleGridSelectionChange = (newSel) => {
    console.log('handleGridSelectionChange   ', newSel)
    let newRows = CompactSelection.empty();
    if (newSel.current !== undefined) {
      newRows = newRows.add([newSel.current.range.y, newSel.current.range.y + newSel.current.range.height]);
    }
    for (const b of newSel.current?.rangeStack ?? []) {
      newRows = newRows.add([b.y, b.y + b.height]);
    }
    setSelection({
      ...newSel,
      rows: newRows
    });


    // console.log('handleGridSelectionChange   ---> ', newSel,  new Date().getTime())
    // // console.log('args --> 选中的回调结果' + new Date().getTime(), JSON.parse(JSON.stringify(newSel)))
    // const cell = newSel.current?.cell;
    // // console.log('选中的 cell ', cell)
    // const rangeStack = newSel.current?.rangeStack;
    // const range = newSel.current?.range;
    // if (!cell) {
    //   setSelection(newSel);
    //   return
    // };

    // const [_, row] = cell;

    // const begin = Math.min(range.y, row)
    // for(let i = begin; i < begin + range.height; i++){
    //   if(!newSel.rows.hasIndex(i)){
    //     newSel.rows = newSel.rows.add(i);
    //   }
    // }

    // for(let i = 0; i < rangeStack.length; i ++){
    //   const item = rangeStack[i];
    //   for(let c = item.y; c < item.y + item.height; c ++){
    //     if(!newSel.rows.hasIndex(c)){
    //       newSel.rows = newSel.rows.add(c);
    //     }
    //   }
    // }

    // setSelection(newSel);
  };

  // 行背景色（选中行变色）
  const getRowThemeOverride = (row) => {
    const rowData = viewData[row];
    if (!rowData) return null;
    return{
      bgCell: rowData._rowBgColor || null,
      // bgCell: 'red'
    };

    // console.log('item, row', item, rowData, row);
  }

  // const getRowThemeOverride = (row, rowData, viewData) => {
  //   // console.log(' getRowThemeOverride   rowData.NODETYPE  ',row, rowData, viewData)
  //   return {
  //     bgCell: bgColorMap[rowData.NODETYPE]
  //     // bgCell: 'red'
  //   };
  // }

  const onColumnResize = (column, newSize, colIndex, newSizeWithGrow) => {
    setColumns(prev => {
      const next = [...prev];
      next[colIndex] = { ...next[colIndex], width: newSize };
      return next;
    });
  }

  const onColumnResizeEnd = (column, newSize, colIndex, newSizeWithGrow) => {
    console.log('onColumnResizeEnd ===> ', column, newSize, colIndex, newSizeWithGrow)
  }

  const onColumnMoved = (startIndex, endIndex) => {
    console.log('onColumnMoved ===> ', startIndex, endIndex)
    setColumns(prev => {
      const newCols = [...prev];
      const dragCol = newCols.splice(startIndex, 1)[0];
      newCols.splice(endIndex, 0, dragCol);
      return newCols;
    });
  }

  // useEffect(() => {
    
  //   setTimeout(() => {
  //     // console.log('表格执行了聚焦')
  //     refEditor.current.focus();
  //   }, 0)
  // }, []);

  const createCell = (obj) => {
    // 将 obj 的原型设置为共享原型
    Object.setPrototypeOf(obj, cellProto);
    return obj;
  };

  const cellProto = { 
    ref: {
      columns,
      viewData,
      foldIdMap,
      checkedMap,
      createCell,
      parentViewMap,
      handleIconClick,
      handleCheckboxClick,
      getAncestorsById,
      findPrevSameLevelNode,
      findNextSameLevelNode,
      showTreeCheckbox
    },
    onIconClick: handleIconClick, // 外部点击回调 
    onCheckboxClick: handleCheckboxClick, // checkbox 点击回调
  };

  // 表格执行 增删改 动作
  // arr 为一个 对象数组结构，有以下内容
  // 备注：多个动作按顺序连续执行，请自行保证前后数据依赖的连续性
  // [
  //   {
  //     type: 'insert',
  //     rowIndex: 0,
  //     items: []    // 被插入的数据， 对象数组结构，内部必须有 ID 字段
  //   },
  //   {
  //     type: 'update',
  //     items: [],   // 需要被更新的数据，和 insert 一样的 对象数组结构，内部必须有 ID 字段
  //   },
  //   {
  //     type: 'delete',
  //     items: []    // 字符串数组结构， 内部存放需要被删除的数组的 ID 
  //   }
  // ]
  const doTransaction = (arr = []) => {
    if(arr.length === 0) return;
    setData(prev => {
      console.time('c1')
      let newData = [...prev];
      for(let i = 0; i < arr.length; i ++){
        const item = arr[i];
        if(item.type === 'insert'){
          newData.splice(item.rowIndex, 0, ...item.items);
        }else if(item.type === 'update'){
          const updateMap = item.items.reduce((prev, cur) => {
            prev[cur.ID] = cur;
            return prev;
          }, {});
          const len = newData.length;
          for(let n = 0; n < len; n ++){
            if(updateMap[newData[n].ID]){
              Object.assign(newData[n], updateMap[newData[n].ID]);
            }
          }
        }else if(item.type === 'delete'){
          const deleteIdMap = item.items.reduce((prev, cur) => {
            prev[cur] = null;
            return prev;
          }, {});
          newData = newData.filter(t => !(t.ID in deleteIdMap));
        }
      }
      console.timeEnd('c1')
      return newData;
    });
  }

  window.doTransaction = doTransaction;
  window.getData = () => { return data };

  // 将子组件内部的 test 方法暴露给父组件
  useImperativeHandle(ref, () => ({
    test,
    viewData,
    columns,
    createCell,
    doTransaction,
    handleIconClick,
    handleCheckboxClick,
    getCheckedMap: () => checkedMap,
    getAncestorsById,
    findPrevSameLevelNode,
    findNextSameLevelNode
  }));

// 自定义主题：选中区域背景设为透明
const customTheme = {
  // 单个激活单元格背景（点击后的单元格底色）
  // cellSelectedBg: "transparent",
  // 框选/范围选区背景（批量选中区域底色）
  // bgBubbleSelected: "red",
  // 行选中背景（rowMarkers 行标记选中整行时的背景）
  // rowSelectedBg: "transparent",
  // 列选中背景（列头选中整列时的背景）
  // columnSelectedBg: "transparent",
  roundingRadius: 0
};

return (
    <>
    {/* <button onClick={test}>fsfdsf</button> */}
      <DataEditor 
        ref={refEditor}
        // showSearch // 显示搜索框(这个牛B)
        theme={customTheme}
        gridSelection={selection}
        // isDraggable="header"  // ✅ 必须设置这个属性
        // drawFocusRing={false}     //  是否绘制焦点环？
        customRenderers={[TreeRender]}
        onHeaderContextMenu={onHeaderContextMenu}
        onHeaderClicked={onHeaderClicked}
        columnSelect= "none"
        onFinishedEditing={onFinishedEditing}
        onCellClicked={onCellClicked}
        getCellsForSelection
        onCellActivated={onCellActivated}
        getRowThemeOverride={getRowThemeOverride}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        keybindings={{
          downFill: true,
          rightFill: true
        }}
        fillHandle={{
          offsetX: -2,
          offsetY: -2,
          outline: 0,
          shape: 'square',
          size: 4
        }}
        // highlightRegions={[]}
        // onDelete={onDelete}
        // experimental= {{
        //   // strict: false,
        //   // enableFirefoxRescaling: true,
        //   hyperWrapping: true
        // }}
        onGridSelectionChange={handleGridSelectionChange}
        // onGridSelectionChange={setSelection}
        onCellEdited={onCellEdited} 
        getCellContent={getData} 
        onColumnResize={onColumnResize}
        onColumnMoved={onColumnMoved}
        onColumnResizeEnd={onColumnResizeEnd}
        columns={columns} 
        // spanRangeBehavior="default"
        // rowSelectionMode="auto"
        rowMarkers="none"
        onCellContextMenu={onCellContextMenu}
        cellActivationBehavior="double-click"     // "double-click" | "single-click" | "second-click";
        // rowMarkerWidth={0}
        rowSelect="multi"
        rangeSelect={"multi-rect"}
        freezeColumns={4}
        rowHeight={24}
        rowSelectionBlending="mixed"
        columnSelectionBlending="mixed"
        rangeSelectionBlending="mixed"
        headerHeight={28}
        // smoothScrollX
        // smoothScrollY
        width="100%"
        rows={rows} />
    </>
  )
}

export default GridSheet