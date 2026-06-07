import * as React from 'react';
// import { useDemoData } from '@mui/x-data-grid-generator';
import {
//   DataGrid,
  useGridApiContext,
  gridFilteredSortedRowIdsSelector,
  gridVisibleColumnFieldsSelector,
  type GridApi,
  Toolbar,
  ExportCsv,
  ToolbarButton,
} from '@mui/x-data-grid';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
const getJson = (apiRef: React.RefObject<GridApi>) => {
  // Select rows and columns
  const filteredSortedRowIds = gridFilteredSortedRowIdsSelector(apiRef);
  // Exclude action-type columns (commonly used for row actions)
  const visibleColumnsField = gridVisibleColumnFieldsSelector(apiRef).filter(
    (field) => {
      const col = apiRef.current.getColumn(field);
      return col?.type !== 'actions' && field !== 'actions';
    },
  );

  // Format the data. Here we only keep the value
  const data = filteredSortedRowIds.map((id) => {
    const row: Record<string, unknown> = {};
    visibleColumnsField.forEach((field) => {
      row[field] = apiRef.current.getCellParams(id, field).value;
    });
    return row;
  });

  // Stringify with some indentation
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#parameters
  return JSON.stringify(data, null, 2);
};

const exportBlob = (blob: Blob, filename: string) => {
  // Save the blob in a json file
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  });
};

function ExportJson(props: { onMenuItemClick: () => void }) {
  const { onMenuItemClick } = props;
  const apiRef = useGridApiContext();

  return (
    <MenuItem
      onClick={() => {
        const jsonString = getJson(apiRef);
        const blob = new Blob([jsonString], {
          type: 'text/json',
        });
        exportBlob(blob, 'DataGrid_demo.json');

        // Hides the export menu after the export
        onMenuItemClick();
      }}
    >
      Download as JSON
    </MenuItem>
  );
}

function ExportMenu() {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  return (
    <React.Fragment>
      <Tooltip title="Export">
        <ToolbarButton
          ref={triggerRef}
          id="export-menu-trigger"
          aria-controls="export-menu"
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={() => setOpen(true)}
        >
           
          <FileDownloadIcon fontSize="inherit" />
        </ToolbarButton>
      </Tooltip>
      <Menu
        id="export-menu"
        anchorEl={triggerRef.current}
        open={open}
        onClose={() => setOpen(false)}
        MenuListProps={{
          'aria-labelledby': 'export-menu-trigger',
        }}
      >
        <ExportCsv render={<MenuItem />}>Download as CSV</ExportCsv>
        <ExportJson onMenuItemClick={() => setOpen(false)} />
      </Menu>
    </React.Fragment>
  );
}

function CustomToolbar() {
  return (
    <Toolbar className='mr-20'>
      <ExportMenu />
    </Toolbar>
  );
}

export default CustomToolbar