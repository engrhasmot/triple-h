import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Expense from "@/models/expense.model";
import Payment from "@/models/payment.model";
import Project from "@/models/project.model";
import ActivityLog from "@/models/activity-log.model";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const subCategory = searchParams.get("subCategory");
    const projectId = searchParams.get("projectId");
    const month = searchParams.get("month"); // e.g. "2026-09"
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const search = searchParams.get("search");

    const filter: Record<string, any> = {};

    if (category && category !== "all") {
      filter.category = category;
    }

    if (subCategory && subCategory !== "all") {
      filter.subCategory = subCategory;
    }

    if (projectId && projectId !== "all") {
      if (projectId === "general-office") {
        filter.$or = [{ projectId: null }, { projectId: { $exists: false } }, { projectName: "General / Office Overhead" }];
      } else if (mongoose.Types.ObjectId.isValid(projectId)) {
        filter.projectId = new mongoose.Types.ObjectId(projectId);
      }
    }

    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) {
        const toD = new Date(dateTo);
        toD.setHours(23, 59, 59, 999);
        filter.date.$lte = toD;
      }
    } else if (month) {
      const [yearStr, monthStr] = month.split("-");
      const year = parseInt(yearStr, 10);
      const m = parseInt(monthStr, 10) - 1;
      const startDate = new Date(year, m, 1);
      const endDate = new Date(year, m + 1, 0, 23, 59, 59, 999);
      filter.date = { $gte: startDate, $lte: endDate };
    }

    if (search) {
      const regex = { $regex: search, $options: "i" };
      filter.$or = [
        { title: regex },
        { paidTo: regex },
        { voucherNo: regex },
        { projectName: regex },
        { projectRef: regex },
        { subCategory: regex },
        { notes: regex },
      ];
    }

    const [expenses, allPayments, allExpenses, projects] = await Promise.all([
      Expense.find(filter).sort({ date: -1 }).lean(),
      Payment.find({}).select("clientName projectTitle paidAmount totalAmount").lean(),
      Expense.find({}).select("amount category subCategory date projectId projectName").lean(),
      Project.find({}).select("_id title category location status").sort({ title: 1 }).lean(),
    ]);

    // Financial Metrics
    const totalIncome = allPayments.reduce((acc, p) => acc + (p.paidAmount || 0), 0);
    const totalExpense = allExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);
    const netProfit = totalIncome - totalExpense;

    // Filtered expenses total
    const filteredTotal = expenses.reduce((acc: number, e: any) => acc + (e.amount || 0), 0);

    // This month metrics
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const thisMonthExpense = allExpenses
      .filter((e) => new Date(e.date) >= currentMonthStart && new Date(e.date) <= currentMonthEnd)
      .reduce((acc, e) => acc + (e.amount || 0), 0);

    // Category breakdown across all expenses (or current filter)
    const categoryBreakdown: Record<string, { total: number; count: number }> = {};
    const subCategoryBreakdown: Record<string, { total: number; count: number }> = {};

    expenses.forEach((e: any) => {
      const cat = e.category || "other";
      if (!categoryBreakdown[cat]) {
        categoryBreakdown[cat] = { total: 0, count: 0 };
      }
      categoryBreakdown[cat].total += e.amount || 0;
      categoryBreakdown[cat].count += 1;

      if (e.subCategory) {
        if (!subCategoryBreakdown[e.subCategory]) {
          subCategoryBreakdown[e.subCategory] = { total: 0, count: 0 };
        }
        subCategoryBreakdown[e.subCategory].total += e.amount || 0;
        subCategoryBreakdown[e.subCategory].count += 1;
      }
    });

    // Project Summaries (Ledger)
    const projectCostMap: Record<string, { totalCost: number; count: number; name: string }> = {};
    allExpenses.forEach((e: any) => {
      const pid = e.projectId ? e.projectId.toString() : "general-office";
      const pName = e.projectName || (pid === "general-office" ? "General / Office Overhead" : "Unknown Project");
      if (!projectCostMap[pid]) {
        projectCostMap[pid] = { totalCost: 0, count: 0, name: pName };
      }
      projectCostMap[pid].totalCost += e.amount || 0;
      projectCostMap[pid].count += 1;
    });

    // Match payments with projects by title
    const projectPaymentMap: Record<string, number> = {};
    allPayments.forEach((p: any) => {
      const pTitle = (p.projectTitle || "").trim().toLowerCase();
      if (pTitle) {
        projectPaymentMap[pTitle] = (projectPaymentMap[pTitle] || 0) + (p.paidAmount || 0);
      }
    });

    const projectLedger = projects.map((proj: any) => {
      const pid = proj._id.toString();
      const pTitleNorm = (proj.title || "").trim().toLowerCase();
      const costInfo = projectCostMap[pid] || { totalCost: 0, count: 0, name: proj.title };
      const collectedRevenue = projectPaymentMap[pTitleNorm] || 0;
      const netMargin = collectedRevenue - costInfo.totalCost;
      const marginPercent = collectedRevenue > 0 ? Math.round((netMargin / collectedRevenue) * 100) : 0;

      return {
        projectId: pid,
        title: proj.title,
        category: proj.category,
        location: proj.location,
        totalCost: costInfo.totalCost,
        expenseCount: costInfo.count,
        collectedRevenue,
        netMargin,
        marginPercent,
      };
    });

    // General Office Ledger entry
    const officeCost = projectCostMap["general-office"] || { totalCost: 0, count: 0, name: "General / Office Overhead" };
    projectLedger.unshift({
      projectId: "general-office",
      title: "General / Office Overhead",
      category: "Office / Administration",
      location: "Head Office",
      totalCost: officeCost.totalCost,
      expenseCount: officeCost.count,
      collectedRevenue: 0,
      netMargin: -officeCost.totalCost,
      marginPercent: 0,
    });

    return NextResponse.json({
      success: true,
      expenses,
      projects,
      metrics: {
        totalIncome,
        totalExpense,
        netProfit,
        thisMonthExpense,
        filteredTotal,
        categoryBreakdown,
        subCategoryBreakdown,
      },
      projectLedger,
    });
  } catch (error: any) {
    console.error("Expenses GET Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch expenses" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await dbConnect();
    const body = await req.json();

    // Support Bulk Insert (e.g. from Excel Spreadsheet Grid or CSV Import)
    if (Array.isArray(body.items)) {
      if (body.items.length === 0) {
        return NextResponse.json({ error: "No expense items provided in batch" }, { status: 400 });
      }

      const preparedItems = [];
      for (const item of body.items) {
        if (!item.title || !item.amount || isNaN(Number(item.amount))) continue;

        let resolvedProjectId = null;
        let resolvedProjectName = item.projectName || "General / Office Overhead";

        if (item.projectId && item.projectId !== "general-office" && mongoose.Types.ObjectId.isValid(item.projectId)) {
          resolvedProjectId = new mongoose.Types.ObjectId(item.projectId);
        }

        preparedItems.push({
          title: String(item.title).trim(),
          category: item.category || "other",
          subCategory: item.subCategory ? String(item.subCategory).trim() : "",
          amount: Number(item.amount),
          date: item.date ? new Date(item.date) : new Date(),
          paidTo: item.paidTo ? String(item.paidTo).trim() : "",
          paymentMethod: item.paymentMethod || "cash",
          voucherNo: item.voucherNo ? String(item.voucherNo).trim() : "",
          attachmentUrl: item.attachmentUrl ? String(item.attachmentUrl).trim() : "",
          notes: item.notes ? String(item.notes).trim() : "",
          projectId: resolvedProjectId,
          projectName: resolvedProjectName,
          projectRef: item.projectRef ? String(item.projectRef).trim() : "",
          createdBy: (payload as any).email || "admin",
        });
      }

      if (preparedItems.length === 0) {
        return NextResponse.json({ error: "No valid rows to insert. Please check title and amount." }, { status: 400 });
      }

      const inserted = await Expense.insertMany(preparedItems);

      try {
        await ActivityLog.create({
          action: "CREATE",
          resource: "Expense",
          performedBy: (payload as any).email || "admin",
          details: `Bulk recorded ${inserted.length} expenses via Excel/Spreadsheet Entry`,
        });
      } catch {}

      return NextResponse.json({ success: true, count: inserted.length, inserted }, { status: 201 });
    }

    // Single item insertion
    const {
      title,
      category,
      subCategory,
      amount,
      date,
      paidTo,
      paymentMethod,
      voucherNo,
      attachmentUrl,
      notes,
      projectId,
      projectName,
      projectRef,
    } = body;

    if (!title || !amount || isNaN(Number(amount))) {
      return NextResponse.json({ error: "Title and a valid amount are required" }, { status: 400 });
    }

    let resolvedProjectId = null;
    let resolvedProjectName = projectName || "General / Office Overhead";

    if (projectId && projectId !== "general-office" && mongoose.Types.ObjectId.isValid(projectId)) {
      resolvedProjectId = new mongoose.Types.ObjectId(projectId);
      const proj = await Project.findById(resolvedProjectId).select("title").lean();
      if (proj) {
        resolvedProjectName = proj.title;
      }
    }

    const expense = await Expense.create({
      title: title.trim(),
      category: category || "other",
      subCategory: subCategory ? subCategory.trim() : "",
      amount: Number(amount),
      date: date ? new Date(date) : new Date(),
      paidTo: paidTo ? paidTo.trim() : "",
      paymentMethod: paymentMethod || "cash",
      voucherNo: voucherNo ? voucherNo.trim() : "",
      attachmentUrl: attachmentUrl ? attachmentUrl.trim() : "",
      notes: notes ? notes.trim() : "",
      projectId: resolvedProjectId,
      projectName: resolvedProjectName,
      projectRef: projectRef ? projectRef.trim() : "",
      createdBy: (payload as any).email || "admin",
    });

    try {
      await ActivityLog.create({
        action: "CREATE",
        resource: "Expense",
        resourceId: expense._id.toString(),
        performedBy: (payload as any).email || "admin",
        details: `Recorded expense of ৳${expense.amount} for "${expense.title}" [${expense.category}]`,
      });
    } catch {}

    return NextResponse.json({ success: true, expense }, { status: 201 });
  } catch (error: any) {
    console.error("Expenses POST Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create expense" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await dbConnect();
    const body = await req.json();
    const {
      id,
      title,
      category,
      subCategory,
      amount,
      date,
      paidTo,
      paymentMethod,
      voucherNo,
      attachmentUrl,
      notes,
      projectId,
      projectName,
      projectRef,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Expense ID is required for update" }, { status: 400 });
    }

    let resolvedProjectId = null;
    let resolvedProjectName = projectName || "General / Office Overhead";

    if (projectId && projectId !== "general-office" && mongoose.Types.ObjectId.isValid(projectId)) {
      resolvedProjectId = new mongoose.Types.ObjectId(projectId);
      const proj = await Project.findById(resolvedProjectId).select("title").lean();
      if (proj) {
        resolvedProjectName = proj.title;
      }
    }

    const updated = await Expense.findByIdAndUpdate(
      id,
      {
        ...(title && { title: title.trim() }),
        ...(category && { category }),
        ...(subCategory !== undefined && { subCategory: subCategory.trim() }),
        ...(amount !== undefined && { amount: Number(amount) }),
        ...(date && { date: new Date(date) }),
        ...(paidTo !== undefined && { paidTo: paidTo.trim() }),
        ...(paymentMethod && { paymentMethod }),
        ...(voucherNo !== undefined && { voucherNo: voucherNo.trim() }),
        ...(attachmentUrl !== undefined && { attachmentUrl: attachmentUrl.trim() }),
        ...(notes !== undefined && { notes: notes.trim() }),
        projectId: resolvedProjectId,
        projectName: resolvedProjectName,
        ...(projectRef !== undefined && { projectRef: projectRef.trim() }),
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    try {
      await ActivityLog.create({
        action: "UPDATE",
        resource: "Expense",
        resourceId: id,
        performedBy: (payload as any).email || "admin",
        details: `Updated expense "${updated.title}" (৳${updated.amount})`,
      });
    } catch {}

    return NextResponse.json({ success: true, expense: updated });
  } catch (error: any) {
    console.error("Expenses PUT Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update expense" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const deleteAll = searchParams.get("deleteAll") === "true";
    const projectId = searchParams.get("projectId");

    // Support Bulk Delete All Records (Requires project scope or all)
    if (deleteAll) {
      let query: Record<string, any> = {};
      let targetDesc = "All expenses (Global)";

      if (projectId && projectId !== "all") {
        if (projectId === "general-office") {
          query = {
            $or: [
              { projectId: null },
              { projectId: { $exists: false } },
              { projectName: "General / Office Overhead" },
            ],
          };
          targetDesc = "General / Office Overhead expenses";
        } else if (mongoose.Types.ObjectId.isValid(projectId)) {
          query = { projectId: new mongoose.Types.ObjectId(projectId) };
          targetDesc = `Expenses for Project ID: ${projectId}`;
        }
      }

      const result = await Expense.deleteMany(query);

      try {
        await ActivityLog.create({
          action: "DELETE",
          resource: "Expense",
          performedBy: (payload as any).email || "admin",
          details: `Bulk deleted ${result.deletedCount} records for ${targetDesc}`,
        });
      } catch {}

      return NextResponse.json({
        success: true,
        count: result.deletedCount,
        message: `Successfully deleted ${result.deletedCount} expense records`,
      });
    }

    if (!id) return NextResponse.json({ error: "Expense ID is required" }, { status: 400 });

    const deleted = await Expense.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: "Expense not found" }, { status: 404 });

    try {
      await ActivityLog.create({
        action: "DELETE",
        resource: "Expense",
        resourceId: id,
        performedBy: (payload as any).email || "admin",
        details: `Deleted expense "${deleted.title}" (৳${deleted.amount})`,
      });
    } catch {}

    return NextResponse.json({ success: true, message: "Expense deleted successfully" });
  } catch (error: any) {
    console.error("Expenses DELETE Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete expense" }, { status: 500 });
  }
}
