import React from "react";
import { DataEditorAll as DataEditor } from "../../data-editor-all.js";
import {
    BeautifulWrapper,
    Description,
    MoreInfo,
    defaultProps,
} from "../../data-editor/stories/utils.js";
import { SimpleThemeWrapper } from "../../stories/story-utils.js";

import {
    GridCellKind,
} from "../../internal/data-grid/data-grid-types.js";

export default {
    title: "Glide-Data-Grid/DataEditor Demos/Test Select Demos",

    decorators: [
        (Story: React.ComponentType) => (
            <SimpleThemeWrapper>
                <BeautifulWrapper
                    title="1111111111111"
                    description={
                        <>
                            <Description>You can add and remove columns at your disposal</Description>
                            <MoreInfo>Use the story&apos;s controls to change the number of columns</MoreInfo>
                        </>
                    }>
                    <Story />
                </BeautifulWrapper>
            </SimpleThemeWrapper>
        ),
    ],
};

interface AddColumnsProps {
    columnsCount: number;
}

const columns = [
  {
    title: "名称",
    id: "name",
    width: 200,
  },
  {
    title: "人工费",
    id: "rgf",
    width: 220,
  },
  {
    title: "编码",
    id: "code",
    width: 62,
  },
  {
    title: "单位",
    id: "unit",
    width: 62,
  },
  {
    title: "计算式",
    id: "formula",
    width: 124,
  }
];

const data = [
  {
    name: "张三",
    rgf: 100,
    code: "123",
    unit: "元",
    formula: "100",
  },
  {
    name: "李四",
    rgf: 200,
    code: "456",
    unit: "元",
    formula: "200",
  },
  {
    name: "王五",
    rgf: 300,
    code: "789",
    unit: "元",
    formula: "300",
  },
  {
    name: "赵六",
    rgf: 400,
    code: "012",
    unit: "元",
    formula: "400",
  },
]

function getCellContent(cell: any) {
    const [col, row] = cell;
    const dataRow = data[row] as any;

    const v = dataRow[columns[col].id];
    if(col === 0){
      return {
          kind: GridCellKind.Select,
          allowOverlay: true,
          readonly: false,
          displayData: v + '',
          data: v + '',
          copyData: v + '',
          selectConfig: {
            canClear: true,
            isMultiple: false,
            canEdit: true,
            showIcon: true,
            options: [
              {  value: '1', label: '1' },
              {  value: '2', label: '2' },
              {  value: '3', label: '3' },
            ]
          },
      }
    }else {
      return {
          kind: GridCellKind.Text,
          allowOverlay: true,
          readonly: false,
          displayData: v + '',
          data: v + '',
          copyData: v + '',
      }
    }
} 

export const AddColumns: React.FC<AddColumnsProps> = p => {
  
    return (
        <DataEditor
            {...defaultProps}
            rowMarkers="number"
            getCellContent={getCellContent as any}
            experimental={{ strict: true }}
            cellActivationBehavior="double-click" 
            columns={columns}
            rowHeight={24}
            rows={4}
        />
    );
};
(AddColumns as any).args = {
    columnsCount: 10,
};
(AddColumns as any).argTypes = {
    columnsCount: {
        control: {
            type: "range",
            min: 2,
            max: 200,
        },
    },
};
