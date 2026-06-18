import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Search, Filter, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

import { API } from '@/lib/api';

const statusLabels = {
  pending: "Pendiente",
  approved: "Aprobado",
  rejected: "Rechazado",
};

const BudgetsPage = () => {
  const navigate = useNavigate();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);

  const fetchBudgets = async () => {
    try {
      const params = statusFilter !== "all" ? { status: statusFilter } : {};
      const response = await axios.get(`${API}/budget-templates`, { params });
      setBudgets(response.data);
    } catch (error) {
      console.error("Error fetching budgets:", error);
      toast.error("Error al cargar los presupuestos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [statusFilter]);

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/budget-templates/${selectedBudget.id}`);
      toast.success("Presupuesto eliminado correctamente");
      setIsDeleteDialogOpen(false);
      setSelectedBudget(null);
      fetchBudgets();
    } catch (error) {
      console.error("Error deleting budget:", error);
      toast.error("Error al eliminar el presupuesto");
    }
  };

  const handleStatusChange = async (budgetId, newStatus) => {
    try {
      await axios.put(`${API}/budget-templates/${budgetId}`, { status: newStatus });
      toast.success("Estado actualizado correctamente");
      fetchBudgets();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Error al actualizar el estado");
    }
  };

  const filteredBudgets = budgets.filter(
    (budget) =>
      budget.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      budget.budget_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div data-testid="budgets-page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-['Manrope']">
            Presupuestos
          </h1>
          <p className="text-slate-500 mt-1">Gestiona todos tus presupuestos</p>
        </div>
        <Button
          onClick={() => navigate("/budgets/new")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
          data-testid="create-budget-btn"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Presupuesto
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar por número o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-slate-200"
            data-testid="search-input"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="border-slate-200" data-testid="filter-dropdown">
              <Filter className="w-4 h-4 mr-2" />
              {statusFilter === "all" ? "Todos" : statusLabels[statusFilter]}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setStatusFilter("all")} data-testid="filter-all">
              Todos
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("pending")} data-testid="filter-pending">
              Pendientes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("approved")} data-testid="filter-approved">
              Aprobados
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("rejected")} data-testid="filter-rejected">
              Rechazados
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Budgets Table */}
      <Card className="border-slate-100 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-slate-400" data-testid="loading">
              Cargando...
            </div>
          ) : filteredBudgets.length === 0 ? (
            <div className="p-8 text-center text-slate-400" data-testid="no-budgets">
              No hay presupuestos que mostrar
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Nº Presupuesto
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBudgets.map((budget) => (
                    <motion.tr
                      key={budget.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-50 transition-colors"
                      data-testid={`budget-row-${budget.id}`}
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono font-medium text-indigo-600">
                          {budget.budget_number}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-900">{budget.cliente}</p>
                          {budget.lugar_ejecucion && (
                            <p className="text-sm text-slate-500 truncate max-w-xs">
                              {budget.lugar_ejecucion}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono font-medium text-slate-900">
                        {formatCurrency(budget.total_con_iva)}
                      </td>
                      <td className="px-6 py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className={`status-badge status-${budget.status} cursor-pointer hover:opacity-80`}
                              data-testid={`status-badge-${budget.id}`}
                            >
                              {statusLabels[budget.status]}
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(budget.id, "pending")}
                            >
                              Pendiente
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(budget.id, "approved")}
                            >
                              Aprobado
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(budget.id, "rejected")}
                            >
                              Rechazado
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-sm">
                        {formatDate(budget.budget_date)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/budgets/${budget.id}`)}
                            className="text-slate-600 hover:text-slate-900"
                            data-testid={`view-budget-${budget.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/budgets/${budget.id}`)}
                            className="text-slate-600 hover:text-slate-900"
                            data-testid={`edit-budget-${budget.id}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedBudget(budget);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            data-testid={`delete-budget-${budget.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent data-testid="delete-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar presupuesto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el presupuesto
              "{selectedBudget?.budget_number}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="cancel-delete-btn">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              data-testid="confirm-delete-btn"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BudgetsPage;
