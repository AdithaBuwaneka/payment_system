const Payment = require('../models/Payment');
const Order = require('../models/Order');

exports.getFinancialReport = async (req, res) => {
  try {
    const { timeRange = 'monthly', startDate, endDate } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Aggregate data based on time range
    let groupBy;
    switch (timeRange) {
      case 'daily':
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
        break;
      case 'weekly':
        groupBy = {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' }
        };
        break;
      case 'yearly':
        groupBy = {
          year: { $year: '$createdAt' }
        };
        break;
      default: // monthly
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
    }

    const aggregatedData = await Payment.aggregate([
      { $match: { status: 'completed', ...dateFilter } },
      {
        $group: {
          _id: groupBy,
          orders: { $sum: 1 },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } }
    ]);

    // Format the data for frontend
    const monthlyData = aggregatedData.map(item => {
      let period;
      if (timeRange === 'daily') {
        period = `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`;
      } else if (timeRange === 'weekly') {
        period = `W${item._id.week} ${item._id.year}`;
      } else if (timeRange === 'monthly') {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        period = monthNames[item._id.month - 1];
      } else {
        period = item._id.year.toString();
      }

      return {
        period,
        orders: item.orders,
        revenue: item.revenue
      };
    });

    // Calculate totals
    const [totalStats] = await Payment.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$amount' }
        }
      }
    ]);

    const totalOrders = totalStats?.totalOrders || 0;
    const totalRevenue = totalStats?.totalRevenue || 0;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    res.json({
      monthlyData,
      totalOrders,
      totalRevenue,
      averageOrderValue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};