import { Box, Stack } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Download, Filter, Plus, RefreshCw, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import CustomToolbar from "./CustomExportToolbar";

export interface CustomTableProps<T = unknown> {
  columns: GridColDef[];
  rows?: T[];
  onAddNew?: () => void;
  loading?: boolean;
  getRowId?: (row: T) => string | number; // Optional function to get row ID
  rowCount?: number;
  page?: number;
  pageSize?: number;
  paginationMode?: "client" | "server";
  onPageChange?: (newPage: number) => void;
  onPageSizeChange?: (newPageSize: number) => void;
  isSearchable?: boolean; // Optional prop to control search functionality
  customSearchInput?: React.ReactNode;
  title?: string;
  subtitle?: string;
  showFilters?: boolean;
  showExport?: boolean;
  showRefresh?: boolean;
  totalCount?: number;
  filteredCount?: number;
  onRefresh?: () => void;
  isAdding?: boolean;
  searchValue?: string; // Current search value
  setSearchValue: (value: string) => void; // Optional function to set search value
}

function CustomTable<T = unknown>({
  columns,
  rows,
  loading,
  getRowId,
  rowCount,
  page,
  pageSize,
  paginationMode,
  onPageChange,
  onPageSizeChange,
  isSearchable,
  customSearchInput,
  onAddNew,
  title,
  subtitle,
  showFilters = false,
  showExport = false,
  showRefresh = false,
  onRefresh,
  isAdding = true,
  setSearchValue,
  searchValue,
}: CustomTableProps<T>) {
  // Track window width so DataGrid re-renders after minimize/maximize (ensures recalculation of column widths)
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  useEffect(() => {
    const handle = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        border: "none",
        pt: 0,
        m: 0,
        borderRadius: 2,
        minWidth: 0, // allow shrinking in flex parent
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        overflow: "hidden",
      }}
    >
      {/* Enhanced Header Section */}
      {(title ||
        isSearchable ||
        onAddNew ||
        showFilters ||
        showExport ||
        showRefresh) && (
        <Box
          sx={{
            background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
            borderBottom: "1px solid #e2e8f0",
            p: 3,
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "3px",
              background: "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)",
            },
          }}
        >
          {/* Title and Subtitle */}
          {(title || subtitle) && (
            <Box sx={{ mb: 3 }}>
              {title && (
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}
                >
                  {/* <Box
                    sx={{
                      width: 35,
                      height: 35,
                      background:
                        "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                    }}
                  >
                    <Eye style={{ width: 20, height: 20, color: "white" }} />
                  </Box> */}
                  <Box>
                    <Box
                      component="h2"
                      sx={{
                        fontSize: "1.5rem",
                        fontWeight: 700,
                        color: "#1e293b",
                        margin: 0,
                        lineHeight: 1.2,
                      }}
                    >
                      {title}
                    </Box>
                    {subtitle && (
                      <Box
                        component="p"
                        sx={{
                          fontSize: "0.875rem",
                          color: "#64748b",
                          margin: 0,
                          marginTop: 0.5,
                        }}
                      >
                        {subtitle}
                      </Box>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {/* Search and Actions Row */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "center" }}
            gap={3}
            sx={{ width: "100%" }}
          >
            {/* Enhanced Search Bar */}
            {isSearchable && (
              <Box
                sx={{ flex: { xs: 1, sm: "0 0 auto" }, minWidth: { sm: 320 } }}
              >
                {!customSearchInput ? (
                  <Box sx={{ position: "relative" }}>
                    <Search
                      style={{
                        position: "absolute",
                        left: 16,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 20,
                        height: 20,
                        color: "#94a3b8",
                        zIndex: 1,
                      }}
                    />
                    <Input
                      className="pl-12 pr-4 h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500 bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200"
                      placeholder="Search records..."
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      style={{
                        fontSize: "0.875rem",
                        borderRadius: "12px",
                        borderWidth: "1px",
                        paddingLeft: "48px",
                        paddingRight: "16px",
                        height: "48px",
                        width: "100%",
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        backdropFilter: "blur(8px)",
                        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                        transition: "all 0.2s ease-in-out",
                      }}
                    />
                  </Box>
                  
                ) : (
                  customSearchInput
                )}
              </Box>
            )}

            {/* Enhanced Action Buttons */}
            <Stack
              direction="row"
              spacing={2}
              sx={{
                flexShrink: 0,
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              {showFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-300 hover:bg-slate-50 text-slate-700 hover:border-slate-400 transition-all duration-200"
                  style={{
                    height: "40px",
                    paddingLeft: "16px",
                    paddingRight: "16px",
                    borderRadius: "8px",
                    borderWidth: "1px",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                >
                  <Filter
                    style={{ width: 16, height: 16, marginRight: "8px" }}
                  />
                  Filters
                </Button>
              )}

              {showExport && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-300 hover:bg-slate-50 text-slate-700 hover:border-slate-400 transition-all duration-200"
                  style={{
                    height: "40px",
                    paddingLeft: "16px",
                    paddingRight: "16px",
                    borderRadius: "8px",
                    borderWidth: "1px",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                >
                  <Download
                    style={{ width: 16, height: 16, marginRight: "8px" }}
                  />
                  Export
                </Button>
              )}

              {showRefresh && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-300 hover:bg-slate-50 text-slate-700 hover:border-slate-400 transition-all duration-200"
                  style={{
                    height: "40px",
                    paddingLeft: "16px",
                    paddingRight: "16px",
                    borderRadius: "8px",
                    borderWidth: "1px",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                  onClick={onRefresh}
                >
                  <RefreshCw
                    style={{ width: 16, height: 16, marginRight: "8px" }}
                  />
                  Refresh
                </Button>
              )}

              {onAddNew && isAdding && (
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  onClick={onAddNew}
                  style={{
                    height: "40px",
                    paddingLeft: "20px",
                    paddingRight: "20px",
                    borderRadius: "8px",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    background:
                      "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.3s ease-in-out",
                  }}
                >
                  <Plus style={{ width: 16, height: 16, marginRight: "8px" }} />
                  Add New
                </Button>
              )}
            </Stack>
          </Stack>
        </Box>
      )}

      {/* Table Content */}
      <Box
        sx={{
          flex: 1,
          width: "100%",
          mt: 0,
          border: 0,
          overflow: "hidden", // hide double scrollbars
          display: "flex",
          minWidth: 0,
        }}
      >
        <DataGrid
          key={windowWidth} // force re-layout on width change
          columns={columns?.map((col) => ({
            ...col,
            // flex:
            //   typeof col.flex === "number"
            //     ? col.flex
            //     : col.headerName !== "Actions"
            //     ? 1
            //     : undefined,
            // minWidth: col.minWidth || 120, // Ensure columns have a minWidth
          }))}
          rows={rows ?? []}
          loading={loading}
         
          disableRowSelectionOnClick
          getRowId={getRowId || ((row) => row.id as string | number)}
          density="compact"
          sx={{
            flex: 1,
            width: "100%",
            // Style for the header
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f8fafc!important", // Light grey background for headers
              color: "#1e293b", // Darker text for header labels
              fontWeight: "600",
              borderBottom: "2px solid #e2e8f0",
              minHeight: "56px !important",
            },
            // Stripe styling for rows
            "& .MuiDataGrid-row:nth-of-type(odd)": {
              backgroundColor: "#fafbfc", // Lighter shade for odd rows
            },
            "& .MuiDataGrid-row:nth-of-type(even)": {
              backgroundColor: "#ffffff", // White for even rows
            },
            // Hover effect on rows
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "#f1f5f9 !important", // Slightly darker on hover
              // transform: "translateY(-1px)",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
              transition: "all 0.2s ease-in-out",
            },
            // Optionally remove cell borders if they conflict with stripes
            "& .MuiDataGrid-cell": {
              borderBottom: "none",
              // padding: "12px 16px",
              fontSize: "0.875rem",
              color: "#475569",
            },
            // Remove default DataGrid border if you're managing it on the parent Box
            border: "none",
            // Enhanced scrollbar styling
            "& .MuiDataGrid-virtualScroller": {
              "&::-webkit-scrollbar": {
                width: "8px",
                height: "8px",
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: "#f1f5f9",
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#cbd5e1",
                borderRadius: "4px",
                "&:hover": {
                  backgroundColor: "#94a3b8",
                },
              },
            },
          }}
          // Custom toolbar slot for export and other actions
          slots={{ toolbar: CustomToolbar }}
          showToolbar

          rowCount={rowCount}
          paginationModel={{ page: page ?? 0, pageSize: pageSize ?? 10 }}
          paginationMode={paginationMode}
          onPaginationModelChange={(model) => {
            // Check if page changed
            if (model.page !== page) {
              onPageChange?.(model.page);
            }
            // Check if page size changed
            if (model.pageSize !== pageSize) {
              onPageSizeChange?.(model.pageSize);
            }
          }}
          // Removed autoHeight to allow responsive width recalculation inside flex layout
        />
      </Box>
    </Box>
  );
}

export default CustomTable;
