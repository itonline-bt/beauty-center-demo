"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, useDataStore } from "@/lib/store";
import { useI18n } from "@/contexts/I18nContext";
import SidebarLayout from "@/components/SidebarLayout";
import {
  Card,
  Button,
  Modal,
  Badge,
  Input,
  PageHeader,
  SearchInput,
  StatCard,
  EmptyState,
} from "@/components/ui";
import PrintableBill, { printBill } from "@/components/PrintableBill";
import {
  Receipt,
  Plus,
  Printer,
  Eye,
  DollarSign,
  Clock,
  CheckCircle,
  CreditCard,
  Banknote,
  Building,
  FileText,
  X,
  User,
  Scissors,
  Percent,
  Calculator,
  ShoppingBag,
  Building2,
} from "lucide-react";

export default function BillingPage() {
  const router = useRouter();
  const { user, isAuthenticated, currentBranch } = useAuthStore();
  const {
    bills,
    appointments,
    customers,
    services,
    settings,
    addBill,
    addTransaction,
  } = useDataStore();
  const {
    locale,
    formatCurrency,
    currency,
    setCurrency,
    availableCurrencies,
    getCurrencyConfig,
  } = useI18n();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [printingBill, setPrintingBill] = useState<any>(null);
  const [newBillPreview, setNewBillPreview] = useState<any>(null);
  const [createStep, setCreateStep] = useState<"form" | "preview">("form");
  const [createMode, setCreateMode] = useState<"appointment" | "manual">(
    "appointment",
  );

  // Form state
  const [form, setForm] = useState({
    appointment_id: "",
    customer_id: "",
    payment_method: "cash",
    selectedServices: [] as number[],
    discount: 0,
    discountType: "amount" as "amount" | "percent",
    note: "",
  });

  // Filter by branch
  const branchBills = useMemo(() => {
    if (!currentBranch || !bills) return [];
    return bills.filter((b: any) => b.branch_id === currentBranch.id || !b.branch_id);
  }, [bills, currentBranch]);

  const branchAppointments = useMemo(() => {
    if (!currentBranch || !appointments) return [];
    return appointments.filter((a: any) => a.branch_id === currentBranch.id || !a.branch_id);
  }, [appointments, currentBranch]);

  const branchCustomers = useMemo(() => {
    if (!currentBranch || !customers) return [];
    return customers.filter((c: any) => c.branch_id === currentBranch.id || !c.branch_id);
  }, [customers, currentBranch]);

  // Filtered bills
  const filtered = useMemo(() => {
    return branchBills.filter((b: any) => {
      const matchSearch =
        b.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
        b.bill_number?.includes(search);
      const matchStatus = !statusFilter || b.payment_status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [branchBills, search, statusFilter]);

  // Stats
  const stats = useMemo(
    () => ({
      total: branchBills.length,
      paid: branchBills.filter((b: any) => b.payment_status === "paid").length,
      pending: branchBills.filter((b: any) => b.payment_status === "pending").length,
      revenue: branchBills
        .filter((b: any) => b.payment_status === "paid")
        .reduce((s: number, b: any) => s + (b.grand_total || b.total_amount || 0), 0),
    }),
    [branchBills],
  );

  // Completed appointments not yet billed (status can be 'done' or 'completed')
  const completedAppointments = useMemo(() => {
    const billedAppointmentIds = branchBills
      .map((b: any) => b.appointment_id)
      .filter(Boolean);
    return branchAppointments.filter(
      (a: any) => (a.status === "completed" || a.status === "done") && !billedAppointmentIds.includes(a.id),
    );
  }, [branchAppointments, branchBills]);

  // Auth redirect
  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
    else if (!currentBranch) router.push("/select-branch");
  }, [isAuthenticated, currentBranch, router]);

  // Early return AFTER all hooks
  if (!isAuthenticated || !currentBranch) return null;

  // Calculate totals for manual mode
  const calculateTotals = () => {
    const selectedServicesList = services.filter((s) =>
      form.selectedServices.includes(s.id),
    );
    const subtotal = selectedServicesList.reduce(
      (sum, s) => sum + (s.price || 0),
      0,
    );

    let discountAmount = 0;
    if (form.discountType === "percent") {
      discountAmount = Math.round((subtotal * form.discount) / 100);
    } else {
      discountAmount = form.discount;
    }

    const taxRate = settings.tax_rate || 0;
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = Math.round((afterDiscount * taxRate) / 100);
    const grandTotal = afterDiscount + taxAmount;

    return {
      subtotal,
      discountAmount,
      taxRate,
      taxAmount,
      grandTotal,
      selectedServicesList,
    };
  };

  const viewBill = (bill: any) => {
    setSelectedBill(bill);
    setShowModal(true);
  };

  const handlePrint = (bill: any) => {
    setPrintingBill(bill);
    setTimeout(() => {
      printBill("printable-bill-hidden");
    }, 100);
  };

  const handlePrintFromModal = () => {
    printBill("printable-bill-modal");
  };

  const handlePrintNewBill = () => {
    printBill("printable-new-bill");
  };

  const resetForm = () => {
    setForm({
      appointment_id: "",
      customer_id: "",
      payment_method: "cash",
      selectedServices: [],
      discount: 0,
      discountType: "amount",
      note: "",
    });
    setCreateStep("form");
    setCreateMode("appointment");
    setNewBillPreview(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  // Generate bill preview
  const generateBillPreview = () => {
    const today = new Date();
    const billCount =
      bills.filter((b) =>
        b.created_at?.startsWith(today.getFullYear().toString()),
      ).length + 1;
    const billNumber = `RCP-${today.getFullYear()}-${String(billCount).padStart(5, "0")}`;

    let billData: any = {
      id: Date.now(),
      bill_number: billNumber,
      payment_method: form.payment_method,
      payment_status: "paid",
      created_at: today.toISOString().split("T")[0],
      created_by: user?.name || "Admin",
    };

    if (createMode === "appointment" && form.appointment_id) {
      const appointment = appointments.find(
        (a) => a.id === Number(form.appointment_id),
      );
      if (!appointment) return;

      const customer = customers.find((c) => c.id === appointment.customer_id);
      const service = services.find((s) => s.id === appointment.service_id);

      const subtotal =
        appointment.final_price || appointment.price || service?.price || 0;
      const discount = appointment.discount || 0;
      const taxRate = settings.tax_rate || 0;
      const taxAmount = Math.round(((subtotal - discount) * taxRate) / 100);
      const grandTotal = subtotal - discount + taxAmount;

      billData = {
        ...billData,
        appointment_id: appointment.id,
        customer_id: customer?.id,
        customer_name: customer?.name || appointment.customer_name || "Walk-in",
        service_name: service?.name || appointment.service_name,
        items: [
          {
            name: service?.name || appointment.service_name,
            price: subtotal,
            qty: 1,
          },
        ],
        subtotal,
        discount_amount: discount,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        grand_total: grandTotal,
      };
    } else if (
      createMode === "manual" &&
      form.customer_id &&
      form.selectedServices.length > 0
    ) {
      const customer = customers.find((c) => c.id === Number(form.customer_id));
      const {
        subtotal,
        discountAmount,
        taxRate,
        taxAmount,
        grandTotal,
        selectedServicesList,
      } = calculateTotals();

      billData = {
        ...billData,
        customer_id: customer?.id,
        customer_name: customer?.name || "Walk-in",
        service_name: selectedServicesList.map((s) => s.name).join(", "),
        items: selectedServicesList.map((s) => ({
          name: s.name,
          price: s.price,
          qty: 1,
        })),
        subtotal,
        discount_amount: discountAmount,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        grand_total: grandTotal,
        note: form.note,
      };
    } else {
      return;
    }

    setNewBillPreview(billData);
    setCreateStep("preview");
  };

  // Confirm and save bill
  const confirmCreateBill = () => {
    if (!newBillPreview) return;

    addBill(newBillPreview);

    // Add transaction
    addTransaction({
      id: Date.now() + 1,
      type: "income",
      category: "service",
      category_name: locale === "lo" ? "ລາຍຮັບບໍລິການ" : "Service Income",
      description: `${newBillPreview.bill_number} - ${newBillPreview.customer_name}`,
      amount: newBillPreview.grand_total,
      payment_method: form.payment_method,
      date: newBillPreview.created_at,
      created_by: user?.name || "Admin",
    });

    // Print immediately
    setTimeout(() => {
      printBill("printable-new-bill");
    }, 100);

    setShowCreateModal(false);
    resetForm();
  };

  const toggleService = (serviceId: number) => {
    setForm((prev) => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(serviceId)
        ? prev.selectedServices.filter((id) => id !== serviceId)
        : [...prev.selectedServices, serviceId],
    }));
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case "cash":
        return <Banknote className="w-4 h-4" />;
      case "card":
        return <CreditCard className="w-4 h-4" />;
      case "transfer":
        return <Building className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const getPaymentLabel = (method: string) => {
    const labels: Record<string, { en: string; lo: string }> = {
      cash: { en: "Cash", lo: "ເງິນສົດ" },
      card: { en: "Card", lo: "ບັດ" },
      transfer: { en: "Transfer", lo: "ໂອນ" },
    };
    return labels[method]?.[locale === "lo" ? "lo" : "en"] || method;
  };

  const canProceed =
    createMode === "appointment"
      ? !!form.appointment_id
      : !!form.customer_id && form.selectedServices.length > 0;

  return (
    <SidebarLayout>
      <div className="space-y-6 animate-fadeIn">
        {/* Branch indicator */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Building2 className="w-4 h-4" />
          <span>{locale === "lo" ? "ສາຂາ:" : "Branch:"}</span>
          <span className="font-medium text-rose-600">{locale === "lo" ? currentBranch.name : currentBranch.name_en}</span>
        </div>

        <PageHeader
          title={locale === "lo" ? "ໃບບິນ" : "Billing"}
          subtitle={
            locale === "lo"
              ? "ຈັດການໃບບິນ ແລະ ການຊຳລະເງິນ"
              : "Manage invoices and payments"
          }
          action={
            <div className="flex items-center gap-2">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="px-3 py-2 border rounded-lg bg-white text-sm"
              >
                {availableCurrencies.map((curr) => {
                  const config = getCurrencyConfig(curr);
                  return (
                    <option key={curr} value={curr}>
                      {config.symbol} {curr}
                    </option>
                  );
                })}
              </select>
              <Button
                icon={<Plus className="w-5 h-5" />}
                onClick={openCreateModal}
              >
                {locale === "lo" ? "ສ້າງໃບບິນໃໝ່" : "Create Invoice"}
              </Button>
            </div>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title={locale === "lo" ? "ໃບບິນທັງໝົດ" : "Total Invoices"}
            value={stats.total}
            icon={<Receipt className="w-6 h-6" />}
            color="blue"
          />
          <StatCard
            title={locale === "lo" ? "ຊຳລະແລ້ວ" : "Paid"}
            value={stats.paid}
            icon={<CheckCircle className="w-6 h-6" />}
            color="emerald"
          />
          <StatCard
            title={locale === "lo" ? "ລໍຖ້າຊຳລະ" : "Pending"}
            value={stats.pending}
            icon={<Clock className="w-6 h-6" />}
            color="amber"
          />
          <StatCard
            title={locale === "lo" ? "ລາຍຮັບທັງໝົດ" : "Total Revenue"}
            value={formatCurrency(stats.revenue)}
            icon={<DollarSign className="w-6 h-6" />}
            color="rose"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder={
                locale === "lo" ? "ຄົ້ນຫາໃບບິນ..." : "Search invoices..."
              }
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border rounded-lg bg-white"
          >
            <option value="">
              {locale === "lo" ? "ທຸກສະຖານະ" : "All Status"}
            </option>
            <option value="paid">
              {locale === "lo" ? "ຊຳລະແລ້ວ" : "Paid"}
            </option>
            <option value="pending">
              {locale === "lo" ? "ລໍຖ້າຊຳລະ" : "Pending"}
            </option>
          </select>
        </div>

        {/* Bills List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <Card>
              <EmptyState
                icon={<Receipt className="w-8 h-8" />}
                title={locale === "lo" ? "ບໍ່ພົບໃບບິນ" : "No invoices found"}
              />
            </Card>
          ) : (
            filtered.map((bill) => (
              <Card key={bill.id} hover className="p-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm text-rose-600 font-semibold">
                        {bill.bill_number}
                      </span>
                      <Badge
                        variant={
                          bill.payment_status === "paid" ? "success" : "warning"
                        }
                      >
                        {bill.payment_status === "paid"
                          ? locale === "lo"
                            ? "ຊຳລະແລ້ວ"
                            : "Paid"
                          : locale === "lo"
                            ? "ລໍຖ້າ"
                            : "Pending"}
                      </Badge>
                    </div>
                    <p className="font-medium text-gray-900">
                      {bill.customer_name}
                    </p>
                    <p className="text-sm text-gray-500">{bill.created_at}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {locale === "lo" ? "ຍອດລວມ" : "Total"}
                      </p>
                      <p className="text-xl font-bold text-gray-900">
                        {formatCurrency(
                          bill.grand_total || bill.total_amount || 0,
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      {getPaymentIcon(bill.payment_method)}
                      <span className="text-sm">
                        {getPaymentLabel(bill.payment_method)}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => viewBill(bill)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        title={locale === "lo" ? "ເບິ່ງ" : "View"}
                      >
                        <Eye className="w-5 h-5 text-gray-500 hover:text-blue-600" />
                      </button>
                      <button
                        onClick={() => handlePrint(bill)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        title={locale === "lo" ? "ພິມ" : "Print"}
                      >
                        <Printer className="w-5 h-5 text-gray-500 hover:text-rose-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* View Bill Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={selectedBill?.bill_number || ""}
          size="lg"
        >
          {selectedBill && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button
                  icon={<Printer className="w-5 h-5" />}
                  onClick={handlePrintFromModal}
                >
                  {locale === "lo" ? "ພິມໃບບິນ" : "Print Invoice"}
                </Button>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl overflow-auto max-h-[60vh]">
                <div
                  id="printable-bill-modal"
                  className="bg-white p-4 rounded-xl shadow-inner mx-auto"
                  style={{ maxWidth: "320px" }}
                >
                  <PrintableBill
                    bill={selectedBill}
                    settings={settings}
                    locale={locale}
                    formatCurrency={formatCurrency}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowModal(false)}
                >
                  {locale === "lo" ? "ປິດ" : "Close"}
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Create Bill Modal - Enhanced */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            resetForm();
          }}
          title={locale === "lo" ? "ສ້າງໃບບິນໃໝ່" : "Create New Invoice"}
          size="lg"
        >
          {createStep === "form" ? (
            <div className="space-y-5">
              {/* Mode Selector */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setCreateMode("appointment")}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${createMode === "appointment" ? "border-rose-500 bg-rose-50" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${createMode === "appointment" ? "bg-rose-100" : "bg-gray-100"}`}
                    >
                      <FileText
                        className={`w-5 h-5 ${createMode === "appointment" ? "text-rose-600" : "text-gray-400"}`}
                      />
                    </div>
                    <div>
                      <p
                        className={`font-medium ${createMode === "appointment" ? "text-rose-700" : "text-gray-700"}`}
                      >
                        {locale === "lo" ? "ຈາກນັດໝາຍ" : "From Appointment"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {completedAppointments.length}{" "}
                        {locale === "lo" ? "ລາຍການລໍຖ້າ" : "pending"}
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setCreateMode("manual")}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${createMode === "manual" ? "border-rose-500 bg-rose-50" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${createMode === "manual" ? "bg-rose-100" : "bg-gray-100"}`}
                    >
                      <ShoppingBag
                        className={`w-5 h-5 ${createMode === "manual" ? "text-rose-600" : "text-gray-400"}`}
                      />
                    </div>
                    <div>
                      <p
                        className={`font-medium ${createMode === "manual" ? "text-rose-700" : "text-gray-700"}`}
                      >
                        {locale === "lo" ? "ສ້າງເອງ" : "Manual Entry"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {locale === "lo"
                          ? "ເລືອກບໍລິການເອງ"
                          : "Select services"}
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Appointment Mode */}
              {createMode === "appointment" && (
                <>
                  {completedAppointments.length > 0 ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FileText className="w-4 h-4 inline mr-1" />
                        {locale === "lo"
                          ? "ນັດໝາຍທີ່ສຳເລັດ"
                          : "Completed Appointment"}
                      </label>
                      <select
                        value={form.appointment_id}
                        onChange={(e) =>
                          setForm({ ...form, appointment_id: e.target.value })
                        }
                        className="w-full px-4 py-3 border rounded-xl bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                      >
                        <option value="">
                          --{" "}
                          {locale === "lo"
                            ? "ເລືອກນັດໝາຍ"
                            : "Select Appointment"}{" "}
                          --
                        </option>
                        {completedAppointments.map((a) => {
                          const customer = customers.find(
                            (c) => c.id === a.customer_id,
                          );
                          const service = services.find(
                            (s) => s.id === a.service_id,
                          );
                          return (
                            <option key={a.id} value={a.id}>
                              {customer?.name || a.customer_name} -{" "}
                              {service?.name || a.service_name} (
                              {formatCurrency(
                                a.final_price || a.price || service?.price || 0,
                              )}
                              )
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-gray-50 rounded-xl">
                      <FileText className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                      <p className="text-gray-500">
                        {locale === "lo"
                          ? "ບໍ່ມີນັດໝາຍທີ່ສຳເລັດ"
                          : "No completed appointments"}
                      </p>
                      <p className="text-sm text-gray-400">
                        {locale === "lo"
                          ? "ກະລຸນາເລືອກສ້າງເອງ"
                          : "Please use manual entry"}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Manual Mode */}
              {createMode === "manual" && (
                <>
                  {/* Customer Select */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-1" />
                      {locale === "lo" ? "ລູກຄ້າ" : "Customer"}
                    </label>
                    <select
                      value={form.customer_id}
                      onChange={(e) =>
                        setForm({ ...form, customer_id: e.target.value })
                      }
                      className="w-full px-4 py-3 border rounded-xl bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    >
                      <option value="">
                        -- {locale === "lo" ? "ເລືອກລູກຄ້າ" : "Select Customer"}{" "}
                        --
                      </option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} - {c.phone}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Services Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Scissors className="w-4 h-4 inline mr-1" />
                      {locale === "lo" ? "ເລືອກບໍລິການ" : "Select Services"} (
                      {form.selectedServices.length})
                    </label>
                    <div className="max-h-56 overflow-y-auto border rounded-xl p-2 space-y-2 scrollbar-thin">
                      {services.map((s) => (
                        <label
                          key={s.id}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${form.selectedServices.includes(s.id) ? "bg-rose-50 border border-rose-200" : "hover:bg-gray-50 border border-transparent"}`}
                        >
                          <input
                            type="checkbox"
                            checked={form.selectedServices.includes(s.id)}
                            onChange={() => toggleService(s.id)}
                            className="w-5 h-5 text-rose-600 rounded focus:ring-rose-500"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 truncate">
                              {s.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {s.duration} {locale === "lo" ? "ນາທີ" : "min"}
                            </p>
                          </div>
                          <span className="font-semibold text-rose-600 whitespace-nowrap">
                            {formatCurrency(s.price)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Discount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Percent className="w-4 h-4 inline mr-1" />
                      {locale === "lo" ? "ສ່ວນຫຼຸດ" : "Discount"}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="0"
                        value={form.discount}
                        onChange={(e) =>
                          setForm({ ...form, discount: Number(e.target.value) })
                        }
                        className="flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                        placeholder="0"
                      />
                      <select
                        value={form.discountType}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            discountType: e.target.value as
                              | "amount"
                              | "percent",
                          })
                        }
                        className="px-4 py-3 border rounded-xl bg-white focus:ring-2 focus:ring-rose-500"
                      >
                        <option value="amount">{currency}</option>
                        <option value="percent">%</option>
                      </select>
                    </div>
                  </div>

                  {/* Summary */}
                  {form.selectedServices.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                          {locale === "lo" ? "ຍອດລວມ" : "Subtotal"}
                        </span>
                        <span>
                          {formatCurrency(calculateTotals().subtotal)}
                        </span>
                      </div>
                      {form.discount > 0 && (
                        <div className="flex justify-between text-sm text-red-600">
                          <span>
                            {locale === "lo" ? "ສ່ວນຫຼຸດ" : "Discount"}
                          </span>
                          <span>
                            -{formatCurrency(calculateTotals().discountAmount)}
                          </span>
                        </div>
                      )}
                      {calculateTotals().taxRate > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">
                            {locale === "lo" ? "ອາກອນ" : "Tax"} (
                            {calculateTotals().taxRate}%)
                          </span>
                          <span>
                            {formatCurrency(calculateTotals().taxAmount)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-lg pt-2 border-t">
                        <span>{locale === "lo" ? "ຍອດສຸດທິ" : "Total"}</span>
                        <span className="text-rose-600">
                          {formatCurrency(calculateTotals().grandTotal)}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calculator className="w-4 h-4 inline mr-1" />
                  {locale === "lo" ? "ວິທີຊຳລະ" : "Payment Method"}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      value: "cash",
                      label: locale === "lo" ? "ເງິນສົດ" : "Cash",
                      icon: Banknote,
                    },
                    {
                      value: "transfer",
                      label: locale === "lo" ? "ໂອນ" : "Transfer",
                      icon: Building,
                    },
                    {
                      value: "card",
                      label: locale === "lo" ? "ບັດ" : "Card",
                      icon: CreditCard,
                    },
                  ].map((method) => (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() =>
                        setForm({ ...form, payment_method: method.value })
                      }
                      className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${form.payment_method === method.value ? "border-rose-500 bg-rose-50" : "border-gray-200 hover:border-gray-300"}`}
                    >
                      <method.icon
                        className={`w-5 h-5 ${form.payment_method === method.value ? "text-rose-600" : "text-gray-400"}`}
                      />
                      <span
                        className={`text-xs font-medium ${form.payment_method === method.value ? "text-rose-700" : "text-gray-600"}`}
                      >
                        {method.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                >
                  {locale === "lo" ? "ຍົກເລີກ" : "Cancel"}
                </Button>
                <Button
                  className="flex-1"
                  onClick={generateBillPreview}
                  disabled={!canProceed}
                >
                  {locale === "lo" ? "ດຳເນີນການ" : "Continue"}
                </Button>
              </div>
            </div>
          ) : (
            /* Preview Step */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCreateStep("form")}
                  className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
                >
                  <X className="w-4 h-4" />
                  {locale === "lo" ? "ກັບຄືນ" : "Back"}
                </button>
                <Badge variant="warning">
                  {locale === "lo"
                    ? "ກວດສອບກ່ອນບັນທຶກ"
                    : "Review before saving"}
                </Badge>
              </div>

              {/* Bill Preview */}
              <div className="bg-gray-50 p-4 rounded-xl overflow-auto max-h-[50vh]">
                <div
                  id="printable-new-bill"
                  className="bg-white p-4 rounded-xl shadow-inner mx-auto"
                  style={{ maxWidth: "320px" }}
                >
                  <PrintableBill
                    bill={newBillPreview}
                    settings={settings}
                    locale={locale}
                    formatCurrency={formatCurrency}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setCreateStep("form")}
                >
                  {locale === "lo" ? "ແກ້ໄຂ" : "Edit"}
                </Button>
                <Button
                  className="flex-1"
                  icon={<Printer className="w-5 h-5" />}
                  onClick={confirmCreateBill}
                >
                  {locale === "lo" ? "ບັນທຶກ & ພິມ" : "Save & Print"}
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Hidden Printable Areas */}
        {printingBill && (
          <div className="hidden">
            <div id="printable-bill-hidden">
              <PrintableBill
                bill={printingBill}
                settings={settings}
                locale={locale}
                formatCurrency={formatCurrency}
              />
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
