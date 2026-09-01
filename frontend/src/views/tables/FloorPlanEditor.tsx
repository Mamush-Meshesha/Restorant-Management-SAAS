import { useState, useEffect, useRef, useCallback, Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import {
  Box, Grid, Card, Typography, Stack, useTheme,
  Button, IconButton, TextField, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from "@mui/material";
import {
  IconPlus, IconTrash, IconSettings, IconCopy
} from "@tabler/icons-react";
import { Canvas } from "@react-three/fiber";
import { MapControls, DragControls, Cylinder, Box as Box3D, Plane, Text, Grid as Grid3D } from "@react-three/drei";
import PageContainer from "../../components/container/PageContainer";
import {
  getDiningAreas, createDiningArea, deleteDiningArea,
  getTables, createTable, deleteTable, batchUpdateTables
} from "@/api/_tables";
import type { DiningArea, Table } from "@/types/__restaurant";
import { useAppSelector } from "@/hooks/auth";
import { toast } from "react-toastify";

// ─── Local State Interface ──────────────────────────────────────────────
interface EditorTable extends Partial<Table> {
  id: string; // temp ID if new, real ID if from DB
  name: string;
  capacity: number;
  x_pos: number;
  y_pos: number;
  isNew?: boolean;
  isModified?: boolean;
}

// ─── WebGL Error Boundary ───────────────────────────────────────────────
class WebGLErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("WebGL crashed:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, textAlign: "center", color: "red", backgroundColor: "#fee2e2", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
          <h2>WebGL Context Error</h2>
          <p>Your browser or graphics driver does not support 3D hardware acceleration.</p>
          <p>Please enable hardware acceleration in your browser settings to view the Floor Plan Editor.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── 2D Fallback View ───────────────────────────────────────────────
const Fallback2DView = ({ tables, selectedTableId, onSelectTable, theme }: any) => {
  return (
    <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "auto", bgcolor: "#e2e8f0" }}>
      <Box sx={{ position: "relative", width: 1000, height: 1000, backgroundImage: 'linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)', backgroundSize: '100px 100px' }}>
        {tables.map((table: EditorTable) => (
          <Box
            key={table.id}
            onClick={() => onSelectTable(table.id)}
            sx={{
              position: "absolute",
              left: (table.x_pos / 50) * 100, // 50 units = 1 grid cell (100px)
              top: (table.y_pos / 50) * 100,
              width: 80 * (table.scale_x || 1),
              height: 80 * (table.scale_y || 1),
              bgcolor: selectedTableId === table.id ? theme.palette.primary.main : (table.status === 'OCCUPIED' ? '#ef4444' : '#5c4033'),
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              cursor: 'pointer',
              border: selectedTableId === table.id ? '4px solid white' : 'none',
              transform: 'translate(-50%, -50%)', // Center on intersection
              boxShadow: 3
            }}
          >
            {table.name}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

// ─── 3D Chair Component ───────────────────────────────────────────
const Chair3D = ({ position, rotation, isSelected, isTaken, theme }: any) => {
  const cushionColor = isSelected ? theme.palette.primary.main : (isTaken ? '#ff0000' : '#f1f5f9');
  const legColor = '#334155'; // Dark metal legs

  return (
    <group position={position} rotation={rotation}>
      {/* Seat */}
      <Box3D args={[0.7, 0.15, 0.7]} position={[0, 0.45, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={cushionColor} roughness={0.8} />
      </Box3D>
      {/* Backrest */}
      <Box3D args={[0.7, 0.6, 0.15]} position={[0, 0.8, 0.28]} castShadow receiveShadow>
        <meshStandardMaterial color={cushionColor} roughness={0.8} />
      </Box3D>
      {/* 4 Legs */}
      <Cylinder args={[0.04, 0.03, 0.4, 8]} position={[-0.28, 0.2, -0.28]} castShadow>
        <meshStandardMaterial color={legColor} />
      </Cylinder>
      <Cylinder args={[0.04, 0.03, 0.4, 8]} position={[0.28, 0.2, -0.28]} castShadow>
        <meshStandardMaterial color={legColor} />
      </Cylinder>
      <Cylinder args={[0.04, 0.03, 0.4, 8]} position={[-0.28, 0.2, 0.28]} castShadow>
        <meshStandardMaterial color={legColor} />
      </Cylinder>
      <Cylinder args={[0.04, 0.03, 0.4, 8]} position={[0.28, 0.2, 0.28]} castShadow>
        <meshStandardMaterial color={legColor} />
      </Cylinder>
    </group>
  );
};

// ─── 3D Table Component ───────────────────────────────────────────
const Table3D = ({
  table,
  isSelected,
  onClick,
  onDragEnd,
  theme
}: {
  table: EditorTable;
  isSelected: boolean;
  onClick: () => void;
  onDragEnd: (id: string, x: number, z: number) => void;
  theme: any;
}) => {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<any>(null);
  
  // Base table size grows with capacity (scaled back down slightly so it's not massive, but chairs are bigger)
  const radius = 1.2 + (table.capacity > 2 ? (table.capacity - 2) * 0.2 : 0);
  const chairDistance = radius + 0.55; // distance to chair center

  const isTaken = table.status === "OCCUPIED" || table.status === "RESERVED";

  const chairs = Array.from({ length: table.capacity }).map((_, i) => {
    const angle = (i * 2 * Math.PI) / table.capacity - (Math.PI / 2);
    const cx = chairDistance * Math.cos(angle);
    const cz = chairDistance * Math.sin(angle);
    const rotationY = -angle - Math.PI / 2;
    
    return (
      <Chair3D 
        key={`chair-${i}`} 
        position={[cx, 0, cz]} 
        rotation={[0, rotationY, 0]} 
        isSelected={isSelected}
        isTaken={isTaken}
        theme={theme}
      />
    );
  });

  const groupContent = (
    <group
      ref={groupRef}
      // Map x_pos/y_pos (0-500) to strict 10-unit grid cells. 
      // 50 units = 1 cell (10 meters). Offset by -45 to center in the 100x100 grid.
      position={[(Math.round(table.x_pos / 50) * 10) - 45, 0, (Math.round(table.y_pos / 50) * 10) - 45]}
      rotation={[0, table.rotation || 0, 0]}
      scale={[table.scale_x || 1.5, table.scale_x || 1.5, table.scale_y || 1.5]}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Table Top (Wood Finish) */}
      <Cylinder args={[radius, radius, 0.15, 48]} position={[0, 0.95, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color={isSelected ? theme.palette.primary.main : (isTaken ? '#ff0000' : (hovered ? '#735141' : '#5c4033'))} roughness={0.6} clearcoat={0.3} />
      </Cylinder>
      
      {/* Table Stem (Metal) */}
      <Cylinder args={[0.15, 0.15, 0.9, 16]} position={[0, 0.45, 0]} castShadow>
        <meshStandardMaterial color="#1f2937" metalness={0.6} roughness={0.4} />
      </Cylinder>

      {/* Table Base Plate (Metal) */}
      <Cylinder args={[radius * 0.5, radius * 0.5, 0.05, 32]} position={[0, 0.025, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#1f2937" metalness={0.6} roughness={0.4} />
      </Cylinder>
      
      {/* Chairs Layer */}
      {chairs}
      
      {/* Table Name Label */}
      <Text
        position={[0, 1.05, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.8}
        color={isSelected ? '#ffffff' : '#f8fafc'}
        anchorX="center"
        anchorY="middle"
        fontWeight={700}
      >
        {table.name}
      </Text>
    </group>
  );

  return (
    <DragControls
      axisLock="y"
      onDragStart={() => { onClick(); }}
      onDragEnd={() => {
        if (groupRef.current) {
          onDragEnd(
            table.id,
            groupRef.current.position.x,
            groupRef.current.position.z
          );
        }
      }}
    >
      {groupContent}
    </DragControls>
  );
};

export default function FloorPlanEditor() {
  const theme = useTheme();
  const branchId = useAppSelector((state) => state.auth.currentUser?.branch_id);

  // ─── State ─────────────────────────────────────────────────────────────
  const [areas, setAreas] = useState<DiningArea[]>([]);
  const [activeArea, setActiveArea] = useState<DiningArea | null>(null);
  const [tables, setTables] = useState<EditorTable[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [areaDialogOpen, setAreaDialogOpen] = useState(false);
  const [newAreaName, setNewAreaName] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'3D' | '2D'>('3D');

  // ─── Data Fetching ─────────────────────────────────────────────────────
  const fetchAreas = useCallback(async () => {
    if (!branchId) return;
    try {
      const res = await getDiningAreas(branchId);
      const fetchedAreas = res.data.data || [];
      setAreas(fetchedAreas);
      if (fetchedAreas.length > 0 && !activeArea) {
        setActiveArea(fetchedAreas[0]);
      }
    } catch (err) {
      toast.error("Failed to load dining areas");
    }
  }, [branchId, activeArea]);

  useEffect(() => {
    fetchAreas();
  }, [fetchAreas]);

  const fetchTables = useCallback(async (areaId: string) => {
    try {
      const res = await getTables({ areaId });
      const rawTables = res.data.data || [];
      const editorTables = rawTables.map(t => ({
        ...t,
        x_pos: t.x_pos ?? 0,
        y_pos: t.y_pos ?? 0,
        name: t.name || t.table_number || "T-?",
        capacity: t.capacity || 2,
        rotation: t.rotation || 0,
        scale_x: t.scale_x || 1.5,
        scale_y: t.scale_y || 1.5,
        isNew: false,
        isModified: false
      }));
      setTables(editorTables);
      setSelectedTableId(null);
    } catch (err) {
      toast.error("Failed to load tables");
    }
  }, []);

  useEffect(() => {
    if (activeArea) {
      fetchTables(activeArea.id);
    }
  }, [activeArea, fetchTables]);

  // Prevent accidental refresh if there are unsaved changes
  useEffect(() => {
    const hasUnsavedChanges = tables.some(t => t.isNew || t.isModified);

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [tables]);

  // ─── Handlers ─────────────────────────────────────────────────────────
  const handleCreateArea = async () => {
    if (!newAreaName.trim() || !branchId) return;
    try {
      const res = await createDiningArea({ name: newAreaName, branch_id: branchId });
      setAreaDialogOpen(false);
      setNewAreaName("");
      await fetchAreas();
      setActiveArea(res.data.data);
      toast.success("Dining area created");
    } catch (err) {
      toast.error("Failed to create area");
    }
  };

  const handleDeleteArea = async (areaId: string) => {
    if (!confirm("Delete this entire dining area and all its tables?")) return;
    try {
      await deleteDiningArea(areaId);
      if (activeArea?.id === areaId) setActiveArea(null);
      await fetchAreas();
      toast.success("Area deleted");
    } catch (err) {
      toast.error("Failed to delete area");
    }
  };

  const handleAddTable = () => {
    if (!activeArea) return;
    setTables(prev => {
      let nextCol = 0;
      let nextRow = 0;
      
      if (prev.length > 0) {
        // Find the position of the last created table in the list
        const lastTable = prev[prev.length - 1];
        const lastCol = Math.round(lastTable.x_pos / 50);
        const lastRow = Math.round(lastTable.y_pos / 50);
        
        // Place next to it
        nextCol = lastCol + 1;
        nextRow = lastRow;
        
        // If it goes past the 10th column (index 9), wrap to the next row
        if (nextCol > 9) {
          nextCol = 0;
          nextRow += 1;
        }
      }
      
      // Ensure we don't overlap with a table that might already be there (if they dragged one there)
      const occupied = new Set(prev.map(t => `${Math.round(t.x_pos / 50)},${Math.round(t.y_pos / 50)}`));
      while (occupied.has(`${nextCol},${nextRow}`) && nextRow < 20) {
        nextCol++;
        if (nextCol > 9) {
          nextCol = 0;
          nextRow++;
        }
      }

      const newId = `temp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const newTable: EditorTable = {
        id: newId,
        branch_id: branchId!,
        dining_area_id: activeArea.id,
        name: `T-${prev.length + 1}`,
        capacity: 4,
        x_pos: nextCol * 50,
        y_pos: nextRow * 50,
        scale_x: 1.5,
        scale_y: 1.5,
        status: "AVAILABLE",
        isNew: true,
        isModified: true
      };
      setSelectedTableId(newId);
      return [...prev, newTable];
    });
  };

  const handleDeleteTable = async (tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    // If it's saved in DB, delete it from DB
    if (!table.isNew) {
      try {
        await deleteTable(table.id);
      } catch (err) {
        toast.error("Failed to delete table from server");
        return;
      }
    }

    setTables(tables.filter(t => t.id !== tableId));
    if (selectedTableId === tableId) setSelectedTableId(null);
  };

  const handleDuplicateTable = (tableId: string) => {
    setTables(prev => {
      const tableToDuplicate = prev.find(t => t.id === tableId);
      if (!tableToDuplicate) return prev;

      const newId = `temp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const newTable: EditorTable = {
        ...tableToDuplicate,
        id: newId,
        name: `${tableToDuplicate.name} (Copy)`,
        x_pos: Math.min(500, tableToDuplicate.x_pos + 50), // Move 1 column right
        y_pos: tableToDuplicate.y_pos,
        isNew: true,
        isModified: true
      };

      setSelectedTableId(newId);
      return [...prev, newTable];
    });
  };

  const handleUpdateTableProp = (tableId: string, field: keyof EditorTable, value: any) => {
    setTables(prev => prev.map(t => {
      if (t.id === tableId) {
        return { ...t, [field]: value, isModified: true };
      }
      return t;
    }));
  };

  const handleUpdateTableProps = (tableId: string, updates: Partial<EditorTable>) => {
    setTables(prev => prev.map(t => {
      if (t.id === tableId) {
        return { ...t, ...updates, isModified: true };
      }
      return t;
    }));
  };

  const handleDragEnd = (tableId: string, x: number, z: number) => {
    setTables(prev => prev.map(t => {
      if (t.id !== tableId) return t;
      
      // Strict 10-unit grid cells.
      // x and z range from roughly -45 to +45.
      // Offset by +45 to map back to 0-450 scale where each 50 units = 1 cell.
      const newX = Math.round((x + 45) / 10) * 50;
      const newY = Math.round((z + 45) / 10) * 50;
      
      return { 
        ...t, 
        x_pos: Math.max(0, Math.min(500, newX)), 
        y_pos: Math.max(0, Math.min(500, newY)), 
        isModified: true 
      };
    }));
  };

  const handleSaveLayout = async () => {
    if (!activeArea || !branchId) return;
    setIsSaving(true);
    try {
      // 1. Create new tables first in parallel
      const newTables = tables.filter(t => t.isNew);
      if (newTables.length > 0) {
        await Promise.all(newTables.map(t => createTable({
          branch_id: branchId,
          dining_area_id: activeArea.id,
          name: t.name,
          capacity: t.capacity,
          x_pos: t.x_pos,
          y_pos: t.y_pos,
          rotation: t.rotation || 0,
          scale_x: t.scale_x || 1.5,
          scale_y: t.scale_y || 1.5
        })));
      }

      // 2. Batch update existing/modified tables
      const existingTables = tables.filter(t => !t.isNew && t.isModified).map(t => ({
        id: t.id,
        x_pos: t.x_pos,
        y_pos: t.y_pos,
        name: t.name,
        capacity: Number(t.capacity),
        rotation: t.rotation || 0,
        scale_x: t.scale_x || 1.5,
        scale_y: t.scale_y || 1.5
      }));

      if (existingTables.length > 0) {
        await batchUpdateTables(existingTables);
      }

      toast.success("Layout saved successfully!");
      await fetchTables(activeArea.id);
    } catch (err) {
      toast.error("Failed to save layout");
    } finally {
      setIsSaving(false);
    }
  };

  const selectedTable = tables.find(t => t.id === selectedTableId);

  return (
    <PageContainer title="Floor Plan Editor" description="Design your restaurant layout">
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Floor Plan Editor</Typography>
        <Button
          variant="contained"
          color="primary"
          disabled={isSaving || !activeArea || tables.filter(t => t.isModified || t.isNew).length === 0}
          onClick={handleSaveLayout}
        >
          {isSaving ? "Saving..." : "Save Layout"}
        </Button>
      </Stack>

      <Grid container spacing={3} sx={{ height: "calc(100vh - 200px)" }}>
        {/* Left Sidebar: Areas List */}
        <Grid size={{ xs: 12, md: 3, lg: 2.5 }} sx={{ height: "100%" }}>
          <Card sx={{ height: "100%", display: "flex", flexDirection: "column", p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={600}>Dining Areas</Typography>
              <IconButton size="small" onClick={() => setAreaDialogOpen(true)}>
                <IconPlus size={18} />
              </IconButton>
            </Stack>
            <Divider sx={{ mb: 2 }} />

            <Stack spacing={1} sx={{ overflowY: "auto", flexGrow: 1 }}>
              {areas.map(area => (
                <Box
                  key={area.id}
                  onClick={() => setActiveArea(area)}
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    cursor: "pointer",
                    bgcolor: activeArea?.id === area.id ? theme.palette.primary.light : "transparent",
                    color: activeArea?.id === area.id ? theme.palette.primary.main : theme.palette.text.primary,
                    "&:hover": { bgcolor: activeArea?.id === area.id ? theme.palette.primary.light : theme.palette.grey[100] },
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <Typography fontWeight={activeArea?.id === area.id ? 700 : 500}>
                    {area.name}
                  </Typography>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(e) => { e.stopPropagation(); handleDeleteArea(area.id); }}
                  >
                    <IconTrash size={16} />
                  </IconButton>
                </Box>
              ))}
              {areas.length === 0 && (
                <Typography variant="body2" color="text.secondary" textAlign="center" mt={4}>
                  No areas found. Create one!
                </Typography>
              )}
            </Stack>
          </Card>
        </Grid>

        {/* Right Canvas */}
        <Grid size={{ xs: 12, md: 9, lg: 9.5 }} sx={{ height: "100%" }}>
          <Card sx={{ height: "100%", display: "flex", flexDirection: "column", p: 0, position: "relative", overflow: "hidden" }}>

            {/* Canvas Toolbar */}
            <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}`, display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: "#fcfcfc" }}>
              <Typography variant="subtitle1" fontWeight={600}>
                {activeArea ? `Editing: ${activeArea.name}` : "Select an area"}
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button onClick={() => setViewMode(v => v === '3D' ? '2D' : '3D')} variant="outlined" size="small" color="secondary">
                  Switch to {viewMode === '3D' ? '2D' : '3D'}
                </Button>
                {activeArea && (
                  <Button startIcon={<IconPlus size={18} />} variant="outlined" size="small" onClick={handleAddTable}>
                    Add Table
                  </Button>
                )}
              </Stack>
            </Box>

            {/* Transform Controls Toolbar */}

            {/* The Canvas (3D or 2D) */}
            <Box sx={{ flexGrow: 1, position: "relative", bgcolor: "#f8fafc" }}>
              {viewMode === '3D' ? (
                <WebGLErrorBoundary>
                <Canvas 
                  shadows 
                  camera={{ position: [0, 60, 50], fov: 50 }}
                  gl={{ 
                    powerPreference: "default", 
                    antialias: false,
                    alpha: false 
                  }}
                >
                <ambientLight intensity={0.4} />
                <directionalLight
                  castShadow
                  position={[10, 25, 10]}
                  intensity={1.5}
                  shadow-mapSize={[2048, 2048]}
                  shadow-camera-left={-20}
                  shadow-camera-right={20}
                  shadow-camera-top={20}
                  shadow-camera-bottom={-20}
                  shadow-bias={-0.0001}
                />
                
                {/* Grid Floor */}
                <Grid3D 
                  args={[100, 100]} 
                  position={[0, 0, 0]} 
                  cellSize={10} 
                  sectionSize={10} 
                  cellColor="#94a3b8" 
                  sectionColor="#475569" 
                  fadeDistance={150} 
                  cellThickness={1.5}
                />
                <Plane
                  args={[100, 100]}
                  rotation={[-Math.PI / 2, 0, 0]}
                  position={[0, -0.01, 0]}
                  receiveShadow
                  onPointerDown={() => setSelectedTableId(null)}
                >
                  <meshStandardMaterial color="#e2e8f0" />
                </Plane>

                {/* 3D Tables */}
                {tables.map(table => (
                  <Table3D
                    key={table.id}
                    table={table}
                    isSelected={selectedTableId === table.id}
                    onClick={() => setSelectedTableId(table.id)}
                    onDragEnd={handleDragEnd}
                    theme={theme}
                  />
                ))}

                <MapControls 
                  makeDefault 
                  enableRotate={false} // Prevents the whole field from spinning
                  minZoom={0.5}
                  maxZoom={3}
                  minPolarAngle={Math.PI / 4} // Lock the camera angle to a nice isometric view
                  maxPolarAngle={Math.PI / 4}
                />
              </Canvas>
              </WebGLErrorBoundary>
              ) : (
                <Fallback2DView 
                  tables={tables} 
                  selectedTableId={selectedTableId} 
                  onSelectTable={setSelectedTableId} 
                  theme={theme} 
                />
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Table Property Inspector (Floating panel) */}
      {selectedTable && (
        <Card sx={{
          position: "absolute",
          right: 32,
          top: 150,
          width: 280,
          p: 2,
          boxShadow: theme.shadows[10],
          border: `1px solid ${theme.palette.divider}`,
          zIndex: 100
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="subtitle1" fontWeight={600}>Table Settings</Typography>
            <IconSettings size={20} color={theme.palette.text.secondary} />
          </Stack>

          <Stack spacing={2}>
            <TextField
              label="Table Name / Number"
              size="small"
              fullWidth
              value={selectedTable.name}
              onChange={(e) => handleUpdateTableProp(selectedTable.id, 'name', e.target.value)}
            />
            <TextField
              label="Capacity (Seats)"
              type="number"
              size="small"
              fullWidth
              value={selectedTable.capacity}
              onChange={(e) => handleUpdateTableProp(selectedTable.id, 'capacity', parseInt(e.target.value) || 2)}
            />
            <Divider />
            <Typography variant="subtitle2" color="text.secondary" mb={-1}>Grid Position</Typography>
            <Stack direction="row" spacing={1}>
              <TextField
                label="Row"
                type="number"
                size="small"
                fullWidth
                value={Math.round(selectedTable.y_pos / 50) + 1}
                onChange={(e) => {
                  const row = parseInt(e.target.value) || 1;
                  handleUpdateTableProp(selectedTable.id, 'y_pos', (row - 1) * 50);
                }}
              />
              <TextField
                label="Column"
                type="number"
                size="small"
                fullWidth
                value={Math.round(selectedTable.x_pos / 50) + 1}
                onChange={(e) => {
                  const col = parseInt(e.target.value) || 1;
                  handleUpdateTableProp(selectedTable.id, 'x_pos', (col - 1) * 50);
                }}
              />
            </Stack>
            <Divider />
            <Typography variant="subtitle2" color="text.secondary" mb={-1}>Rotation</Typography>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" size="small" onClick={() => handleUpdateTableProp(selectedTable.id, 'rotation', (selectedTable.rotation || 0) + Math.PI / 4)}>↻ +45°</Button>
              <Button variant="outlined" size="small" onClick={() => handleUpdateTableProp(selectedTable.id, 'rotation', (selectedTable.rotation || 0) - Math.PI / 4)}>↺ -45°</Button>
            </Stack>
            <Divider />
            <Typography variant="subtitle2" color="text.secondary" mb={-1}>Size</Typography>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" size="small" fullWidth onClick={() => {
                const current = selectedTable.scale_x || 1;
                const newScale = Math.max(0.5, current - 0.2);
                handleUpdateTableProps(selectedTable.id, { scale_x: newScale, scale_y: newScale });
              }}>Smaller</Button>
              <Button variant="outlined" size="small" fullWidth onClick={() => {
                const current = selectedTable.scale_x || 1;
                const newScale = Math.min(3, current + 0.2);
                handleUpdateTableProps(selectedTable.id, { scale_x: newScale, scale_y: newScale });
              }}>Larger</Button>
            </Stack>
            <Divider />
            <Button
              variant="outlined"
              color="primary"
              startIcon={<IconCopy size={18} />}
              onClick={() => handleDuplicateTable(selectedTable.id)}
            >
              Duplicate
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<IconTrash size={18} />}
              onClick={() => handleDeleteTable(selectedTable.id)}
            >
              Delete Table
            </Button>
          </Stack>
        </Card>
      )}

      {/* New Area Dialog */}
      <Dialog open={areaDialogOpen} onClose={() => setAreaDialogOpen(false)}>
        <DialogTitle>Create Dining Area</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Area Name (e.g. Main Floor, Patio)"
            fullWidth
            variant="outlined"
            value={newAreaName}
            onChange={(e) => setNewAreaName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAreaDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateArea} variant="contained" disabled={!newAreaName.trim()}>Create</Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
