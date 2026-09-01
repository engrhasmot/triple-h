import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PageView from '@/models/pageview.model';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

export async function GET(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const session = await verifyToken(token);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!hasPermission((session as any).role, "canViewAnalytics")) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }

  try {
    await dbConnect();

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thirtyDaysAgo = new Date(todayStart.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [totalPageViews, uniqueVisitors, pageViewsByPath, pageViewsByDate, todayViews] =
      await Promise.all([
        PageView.countDocuments(),
        PageView.distinct('ip').then((ips) => ips.length),
        PageView.aggregate([
          { $group: { _id: '$path', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
          { $project: { path: '$_id', count: 1, _id: 0 } },
        ]),
        PageView.aggregate([
          { $match: { timestamp: { $gte: thirtyDaysAgo } } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
          { $project: { date: '$_id', count: 1, _id: 0 } },
        ]),
        PageView.countDocuments({ timestamp: { $gte: todayStart } }),
      ]);

    return NextResponse.json({
      totalPageViews,
      uniqueVisitors,
      pageViewsByPath,
      pageViewsByDate,
      todayViews,
    });
  } catch (error) {
    console.error('Admin Analytics Error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
