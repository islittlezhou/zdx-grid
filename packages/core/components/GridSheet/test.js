
const len = 50;
const datas = getData();

// 更新
const updateItem = {
    type: 'update',
    items: []
};
datas.forEach((r, index) => {
    if(index > 50) return;
   const item = {
       ...r,
       code: r.code + index,
       unit: r.unit + index,
       formula: r.formula + index,
       gcl: r.gcl + index + 1,
       qf: r.qf + index,
       dj: r.dj + index,
       hj: r.hj + index,
       djpc: r.djpc + index,
       sxj: r.sxj + index,
       xxj: r.xxj + index,
       bhz: !r.bhz
   } 
    updateItem.items.push(item);
});
window.doTransaction([updateItem]);


// 删除
const deleteItem = {
    type: 'delete',
    items: [4,5,6,7]
};

window.doTransaction([deleteItem]);

// 插入数据
const maxId = 10000;
const addLen = 10

const tempData = {
  ID: "2",
  PID: "-1",
  bhz: false,
  bjczys: true,
  bjtdy: true,
  cg: "<100M",
  clf: 43,
  code: "A0745",
  czyszsl: 23.42,
  dj: 23.42,
  djpc: 5,
  formula: "250",
  gcl: 33.3,
  glf: 23.24,
  hj: 12.05,
  id: "2",
  jqrgf: 12.05,
  jqzjf: 12,
  jxf: 23.24,
  lr: 2.65,
  name: "人工凿一发生的焚烧发电般石方",
  parentId: "-1",
  pid: -1,
  ps: true,
  qf: "建筑",
  qtglf: 5.26,
  remark: "备注1",
  rgf: 600.66,
  seq: 1,
  sxj: 54.652,
  type: "分部",
  unit: "千克",
  xxj: 44.36,
  zjf: 254.36,
}

const insertItem = {
    type: 'insert',
    rowIndex: 0,
    items: []
};

for(let i = 0; i < addLen; i ++){
    const item = {
        ...tempData,
        rgf: tempData.rgf + i,
        ID: maxId + i,
        PID: maxId
    }
    if(i == 0){
      item.PID = -1
    }else{
      item.PID = insertItem.items[0].ID
    }
    insertItem.items.push(item);
}

window.doTransaction([insertItem]);
