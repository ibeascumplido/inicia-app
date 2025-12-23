import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Settings,
  X,
  Trash2,
  Edit2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

// Colores predefinidos para elegir
const PRESET_COLORS = [
  "#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899",
  "#06B6D4", "#84CC16", "#F97316", "#6366F1", "#14B8A6", "#A855F7",
];

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [operarios, setOperarios] = useState([]);
  const [vacaciones, setVacaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showOperariosModal, setShowOperariosModal] = useState(false);
  const [showAddOperarioModal, setShowAddOperarioModal] = useState(false);
  const [editingOperario, setEditingOperario] = useState(null);
  const [deleteOperarioConfirm, setDeleteOperarioConfirm] = useState(null);
  
  // Selected operario for marking vacations
  const [selectedOperario, setSelectedOperario] = useState(null);
  
  // New operario form
  const [newOperario, setNewOperario] = useState({
    nombre: "",
    abreviatura: "",
    color: "#3B82F6",
  });

  const fetchOperarios = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/operarios`);
      setOperarios(response.data);
      if (response.data.length > 0 && !selectedOperario) {
        setSelectedOperario(response.data[0]);
      }
    } catch (error) {
      console.error("Error fetching operarios:", error);
    }
  }, [selectedOperario]);

  const fetchVacaciones = useCallback(async () => {
    try {
      const month = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
      const response = await axios.get(`${API}/vacaciones`, { params: { month } });
      setVacaciones(response.data);
    } catch (error) {
      console.error("Error fetching vacaciones:", error);
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  useEffect(() => {
    fetchOperarios();
  }, []);

  useEffect(() => {
    fetchVacaciones();
  }, [currentDate, fetchVacaciones]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;

    const days = [];

    // Previous month days
    const prevMonth = new Date(year, month, 0);
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        date: prevMonth.getDate() - i,
        isCurrentMonth: false,
        fullDate: new Date(year, month - 1, prevMonth.getDate() - i),
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: i,
        isCurrentMonth: true,
        fullDate: new Date(year, month, i),
      });
    }

    // Next month days
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: i,
        isCurrentMonth: false,
        fullDate: new Date(year, month + 1, i),
      });
    }

    return days;
  };

  const formatDateString = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Check if operario has vacation on date
  const hasVacation = (operarioId, dateStr) => {
    return vacaciones.some(v => v.operario_id === operarioId && v.fecha === dateStr);
  };

  // Toggle vacation for operario on date
  const toggleVacation = async (operario, dateStr) => {
    if (!operario) return;
    
    try {
      if (hasVacation(operario.id, dateStr)) {
        // Remove vacation
        await axios.delete(`${API}/vacaciones/${operario.id}/${dateStr}`);
        setVacaciones(prev => prev.filter(v => !(v.operario_id === operario.id && v.fecha === dateStr)));
      } else {
        // Add vacation
        await axios.post(`${API}/vacaciones`, {
          operario_id: operario.id,
          fecha: dateStr,
        });
        setVacaciones(prev => [...prev, { operario_id: operario.id, fecha: dateStr }]);
      }
    } catch (error) {
      console.error("Error toggling vacation:", error);
      toast.error("Error al actualizar vacaciones");
    }
  };

  // Add/Edit operario
  const handleSaveOperario = async () => {
    if (!newOperario.nombre.trim() || !newOperario.abreviatura.trim()) {
      toast.error("Nombre y abreviatura son obligatorios");
      return;
    }

    try {
      if (editingOperario) {
        await axios.put(`${API}/operarios/${editingOperario.id}`, newOperario);
        toast.success("Operario actualizado");
      } else {
        await axios.post(`${API}/operarios`, newOperario);
        toast.success("Operario creado");
      }
      setShowAddOperarioModal(false);
      setEditingOperario(null);
      setNewOperario({ nombre: "", abreviatura: "", color: "#3B82F6" });
      fetchOperarios();
    } catch (error) {
      console.error("Error saving operario:", error);
      toast.error("Error al guardar operario");
    }
  };

  // Delete operario
  const handleDeleteOperario = async () => {
    if (!deleteOperarioConfirm) return;
    
    try {
      await axios.delete(`${API}/operarios/${deleteOperarioConfirm.id}`);
      toast.success("Operario eliminado");
      setDeleteOperarioConfirm(null);
      if (selectedOperario?.id === deleteOperarioConfirm.id) {
        setSelectedOperario(null);
      }
      fetchOperarios();
      fetchVacaciones();
    } catch (error) {
      console.error("Error deleting operario:", error);
      toast.error("Error al eliminar operario");
    }
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div data-testid="calendar-page">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-['Manrope']">
            Calendario de Vacaciones
          </h1>
          <p className="text-slate-500 mt-1">Gestiona las vacaciones de los operarios</p>
        </div>
        <Button
          onClick={() => setShowOperariosModal(true)}
          variant="outline"
          data-testid="manage-operarios-btn"
        >
          <Settings className="w-4 h-4 mr-2" />
          Gestionar Operarios
        </Button>
      </div>

      {/* Selector de operario activo */}
      {operarios.length > 0 && (
        <Card className="border-slate-100 shadow-sm mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-slate-600 mr-2">Selecciona operario para marcar vacaciones:</span>
              {operarios.map((op) => (
                <button
                  key={op.id}
                  onClick={() => setSelectedOperario(op)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 transition-all ${
                    selectedOperario?.id === op.id
                      ? "border-slate-900 shadow-md"
                      : "border-transparent hover:border-slate-300"
                  }`}
                  style={{ backgroundColor: op.color + "20" }}
                  data-testid={`select-operario-${op.id}`}
                >
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: op.color }}
                  />
                  <span className="text-sm font-medium">{op.nombre}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar Header */}
      <Card className="border-slate-100 shadow-sm mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={handlePrevMonth} data-testid="prev-month-btn">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-xl font-semibold text-slate-900 font-['Manrope']" data-testid="current-month">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <Button variant="ghost" size="sm" onClick={handleNextMonth} data-testid="next-month-btn">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Leyenda de operarios */}
      {operarios.length > 0 && (
        <div className="flex items-center gap-4 mb-4 flex-wrap">
          {operarios.map((op) => (
            <div key={op.id} className="flex items-center gap-1.5">
              <div
                className="w-4 h-4 rounded text-[10px] font-bold flex items-center justify-center text-white"
                style={{ backgroundColor: op.color }}
              >
                {op.abreviatura}
              </div>
              <span className="text-xs text-slate-600">{op.nombre}</span>
            </div>
          ))}
        </div>
      )}

      {/* Calendar Grid */}
      <Card className="border-slate-100 shadow-sm">
        <CardContent className="p-0">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b border-slate-100">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="px-2 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider bg-slate-50"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7">
            {days.map((day, index) => {
              const dateStr = formatDateString(day.fullDate);
              const isTodayDate = isToday(day.fullDate);
              const isWeekend = day.fullDate.getDay() === 0 || day.fullDate.getDay() === 6;

              return (
                <div
                  key={index}
                  className={`relative min-h-[100px] p-1 border border-slate-100 ${
                    !day.isCurrentMonth ? "bg-slate-50" : isWeekend ? "bg-slate-50/50" : "bg-white"
                  } ${isTodayDate ? "ring-2 ring-indigo-400 ring-inset" : ""}`}
                  data-testid={`calendar-day-${dateStr}`}
                >
                  {/* Day number */}
                  <div
                    className={`text-sm font-medium mb-1 ${
                      isTodayDate
                        ? "w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs"
                        : day.isCurrentMonth
                        ? "text-slate-900"
                        : "text-slate-400"
                    }`}
                  >
                    {day.date}
                  </div>

                  {/* Grid of 12 slots (4x3) */}
                  <div className="grid grid-cols-4 gap-0.5">
                    {operarios.slice(0, 12).map((op, slotIndex) => {
                      const hasVac = hasVacation(op.id, dateStr);
                      return (
                        <button
                          key={op.id}
                          onClick={() => toggleVacation(op, dateStr)}
                          className={`aspect-square rounded-sm transition-all hover:scale-110 hover:z-10 relative group ${
                            hasVac ? "" : "bg-slate-200 hover:bg-slate-300"
                          }`}
                          style={hasVac ? { backgroundColor: op.color } : {}}
                          title={`${op.nombre} - ${hasVac ? "Vacaciones" : "Click para marcar"}`}
                          data-testid={`slot-${dateStr}-${op.id}`}
                        >
                          {hasVac && (
                            <span className="absolute inset-0 flex items-center justify-center text-white text-[8px] font-bold">
                              {op.abreviatura}
                            </span>
                          )}
                        </button>
                      );
                    })}
                    {/* Fill empty slots if less than 12 operarios */}
                    {Array.from({ length: Math.max(0, 12 - operarios.length) }).map((_, i) => (
                      <div
                        key={`empty-${i}`}
                        className="aspect-square rounded-sm bg-slate-100"
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Modal: Gestionar Operarios */}
      <Dialog open={showOperariosModal} onOpenChange={setShowOperariosModal}>
        <DialogContent className="sm:max-w-lg" data-testid="operarios-modal">
          <DialogHeader>
            <DialogTitle className="font-['Manrope']">Gestionar Operarios</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {operarios.length === 0 ? (
              <p className="text-center text-slate-500 py-4">No hay operarios. Añade el primero.</p>
            ) : (
              operarios.map((op) => (
                <div
                  key={op.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded flex items-center justify-center text-white text-sm font-bold"
                      style={{ backgroundColor: op.color }}
                    >
                      {op.abreviatura}
                    </div>
                    <span className="font-medium">{op.nombre}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingOperario(op);
                        setNewOperario({
                          nombre: op.nombre,
                          abreviatura: op.abreviatura,
                          color: op.color,
                        });
                        setShowAddOperarioModal(true);
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => setDeleteOperarioConfirm(op)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={() => {
                setEditingOperario(null);
                setNewOperario({ nombre: "", abreviatura: "", color: "#3B82F6" });
                setShowAddOperarioModal(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700"
              data-testid="add-operario-btn"
            >
              <Plus className="w-4 h-4 mr-2" />
              Añadir Operario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Añadir/Editar Operario */}
      <Dialog open={showAddOperarioModal} onOpenChange={setShowAddOperarioModal}>
        <DialogContent className="sm:max-w-md" data-testid="add-operario-modal">
          <DialogHeader>
            <DialogTitle className="font-['Manrope']">
              {editingOperario ? "Editar Operario" : "Nuevo Operario"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={newOperario.nombre}
                onChange={(e) => setNewOperario({ ...newOperario, nombre: e.target.value })}
                placeholder="Nombre del operario"
                data-testid="operario-nombre-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="abreviatura">Abreviatura (máx. 3 caracteres)</Label>
              <Input
                id="abreviatura"
                value={newOperario.abreviatura}
                onChange={(e) => setNewOperario({ ...newOperario, abreviatura: e.target.value.slice(0, 3).toUpperCase() })}
                placeholder="Ej: JUA"
                maxLength={3}
                data-testid="operario-abreviatura-input"
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex items-center gap-2 flex-wrap">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewOperario({ ...newOperario, color })}
                    className={`w-8 h-8 rounded-lg border-2 transition-all ${
                      newOperario.color === color ? "border-slate-900 scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Label htmlFor="customColor" className="text-xs text-slate-500">Color personalizado:</Label>
                <Input
                  id="customColor"
                  type="color"
                  value={newOperario.color}
                  onChange={(e) => setNewOperario({ ...newOperario, color: e.target.value })}
                  className="w-12 h-8 p-0 border-0"
                />
              </div>
            </div>
            
            {/* Preview */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div
                className="w-10 h-10 rounded flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: newOperario.color }}
              >
                {newOperario.abreviatura || "?"}
              </div>
              <span className="font-medium">{newOperario.nombre || "Nombre"}</span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddOperarioModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveOperario}
              className="bg-indigo-600 hover:bg-indigo-700"
              data-testid="save-operario-btn"
            >
              {editingOperario ? "Guardar Cambios" : "Crear Operario"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Operario */}
      <AlertDialog open={!!deleteOperarioConfirm} onOpenChange={() => setDeleteOperarioConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar operario?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará "{deleteOperarioConfirm?.nombre}" y todas sus vacaciones registradas.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOperario}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CalendarPage;
