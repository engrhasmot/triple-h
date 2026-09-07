import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Expense from "@/models/expense.model";
import Payment from "@/models/payment.model";
import ActivityLog from "@/models/activity-log.model";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const month = searchParams.get("month"); // e.g. "2026-09"
    const search = searchParams.get("search");

    const filter: Record<string, any> = {};
    if (category && category !== "all") {
      filter.category = category;
    }
    if (month) {
      const [yearStr, monthStr] = month.split("-");
      const year = parseInt(yearStr, 10);
      const m = parseInt(monthStr, 10) - 1;
      const startDate = new Date(year, m, 1);
      const endDate = new Date(year, m + 1, 0, 23, 59, 59, 999);
      filter.date = { $gte: startDate, $lte: endDate };
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { paidTo: { $regex: search, $options: "i" } },
        { projectRef: { $regex: search, $options: "i" } },
      ];
    }

    const [expenses, allPayments, allExpenses] = await Promise.all([
      Expense.find(filter).sort({ date: -1 }).lean(),
      Payment.find({}).select("paidAmount totalAmount").lean(),
      Expense.find({}).select("amount category date").lean(),
    ]);

    // Financial Metrics
    const totalIncome = allPayments.reduce((acc, p) => acc + (p.paidAmount || 0), 0);
    const totalExpense = allExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);
    const netProfit = totalIncome - totalExpense;

    // This month metrics
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const thisMonthExpense = allExpenses
      .filter((e) => new Date(e.date) >= currentMonthStart && new Date(e.date) <= currentMonthEnd)
      .reduce((acc, e) => acc + (e.amount || 0), 0);

    // Category breakdown
    const categoryBreakdown: Record<string, number> = {};
    allExpenses.forEach((e) => {
      categoryBreakdown[e.category] = (categoryBreakdown[e.category] || 0) + (e.amount || 0);
    });

    return NextResponse.json({
      success: true,
      expenses,
      metrics: {
        totalIncome,
        totalExpense,
        netProfit,
        thisMonthExpense,
        categoryBreakdown,
      },
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
    const { title, category, amount, date, paidTo, paymentMethod, notes, projectRef } = body;

    if (!title || !amount || isNaN(Number(amount))) {
      return NextResponse.json({ error: "Title and a valid amount are required" }, { status: 400 });
    }

    const expense = await Expense.create({
      title,
      category: category || "other",
      amount: Number(amount),
      date: date ? new Date(date) : new Date(),
      paidTo: paidTo || undefined,
      paymentMethod: paymentMethod || "cash",
      notes: notes || undefined,
      projectRef: projectRef || undefined,
      createdBy: (payload as any).email || "admin",
    });

    try {
      await ActivityLog.create({
        action: "CREATE",
        resource: "Expense",
        resourceId: expense._id.toString(),
        performedBy: (payload as any).email || "admin",
        details: `Recorded expense of ৳${expense.amount} for "${expense.title}"`,
      });
    } catch {}

    return NextResponse.json({ success: true, expense }, { status: 201 });
  } catch (error: any) {
    console.error("Expenses POST Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create expense" }, { status: 500 });
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
