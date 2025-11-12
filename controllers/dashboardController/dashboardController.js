import dashboardService from "../../services/dashboardService/dashboardService.js";

export default {
    getDashboard: async (req, res) => {
    try {
      const stats = await dashboardService.getDashboardStats();
      res.status(200).json({ success: true, message: "Dashboard stats fetched successfully", result: stats });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
}