// Analytics and Reporting Utilities
import { getPriceByName, getAllMenuItems } from '../data/beerMenu';

export const calculateAnalytics = (tables, orderHistory = []) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());

  // Filter orders for today and this week
  const todayOrders = orderHistory.filter(order => {
    const orderDate = new Date(order.timestamp);
    return orderDate >= today;
  });

  const weekOrders = orderHistory.filter(order => {
    const orderDate = new Date(order.timestamp);
    return orderDate >= weekStart;
  });

  // Current table analytics
  const occupiedTables = tables.filter(table => table.isOccupied);
  const paidTables = occupiedTables.filter(table => table.paymentStatus === 'paid');
  const unpaidTables = occupiedTables.filter(table => table.paymentStatus === 'unpaid');

  // Sales calculations
  const todaySales = todayOrders.reduce((total, order) => total + (order.totalCost || 0), 0);
  const weekSales = weekOrders.reduce((total, order) => total + (order.totalCost || 0), 0);
  const currentSales = occupiedTables.reduce((total, table) => total + (table.totalCost || 0), 0);

  // Beer popularity
  const beerCounts = {};
  [...todayOrders, ...occupiedTables].forEach(order => {
    if (order.beerOrdered) {
      beerCounts[order.beerOrdered] = (beerCounts[order.beerOrdered] || 0) + (order.quantity || 1);
    }
  });

  const topSellingBeer = Object.entries(beerCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  // Average stay time
  const completedOrders = orderHistory.filter(order => order.timeOut);
  const totalStayTime = completedOrders.reduce((total, order) => {
    if (order.timeIn && order.timeOut) {
      const duration = new Date(order.timeOut) - new Date(order.timeIn);
      return total + duration;
    }
    return total;
  }, 0);

  const averageStayTime = completedOrders.length > 0 
    ? totalStayTime / completedOrders.length 
    : 0;

  return {
    // Current status
    totalTables: 15,
    occupiedTables: occupiedTables.length,
    availableTables: 15 - occupiedTables.length,
    paidCustomers: paidTables.length,
    unpaidCustomers: unpaidTables.length,
    
    // Sales data
    todaySales,
    weekSales,
    currentSales,
    totalSales: todaySales + currentSales,
    
    // Analytics
    topSellingBeer,
    averageStayTime: Math.round(averageStayTime / (1000 * 60)), // in minutes
    totalOrdersToday: todayOrders.length,
    totalOrdersThisWeek: weekOrders.length,
    
    // Performance metrics
    occupancyRate: (occupiedTables.length / 15) * 100,
    paymentCompletionRate: occupiedTables.length > 0 
      ? (paidTables.length / occupiedTables.length) * 100 
      : 0
  };
};

export const generateSalesReport = (tables, orderHistory, period = 'today') => {
  const now = new Date();
  let startDate, endDate;

  switch (period) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
      break;
    case 'week':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      break;
    default:
      startDate = new Date(0);
      endDate = new Date();
  }

  const filteredOrders = orderHistory.filter(order => {
    const orderDate = new Date(order.timestamp);
    return orderDate >= startDate && orderDate < endDate;
  });

  const currentOrders = tables.filter(table => table.isOccupied);
  const allOrders = [...filteredOrders, ...currentOrders];

  return {
    period,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    totalOrders: allOrders.length,
    totalRevenue: allOrders.reduce((total, order) => total + (order.totalCost || 0), 0),
    averageOrderValue: allOrders.length > 0 
      ? allOrders.reduce((total, order) => total + (order.totalCost || 0), 0) / allOrders.length 
      : 0,
    orders: allOrders
  };
};
