import StatsCards from "@/components/studentDashboard/StatsCard";
import CoursePerformanceChart from "@/components/studentDashboard/PerformanceChart";
import PerformanceChart from "@/components/studentDashboard/PerformanceChart";
import AnalyticsChart from "@/components/studentDashboard/AnalyticsChart";

// export default function AnalyticsPage() {
//   return (
//     <div className="p-4">
//       <h1 className="text-2xl font-bold mb-4">Analytics</h1>
//       <StatsCards />
//       {/* More components will follow below */}
//     </div>
//   );
// }

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Section 1 – Stat Cards */}
      <StatsCards />

      {/* Section 2 – Course Performance Chart */}
      <AnalyticsChart />
    </div>
  );
}
