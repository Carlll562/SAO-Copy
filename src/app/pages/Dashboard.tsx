import React, { useState, useEffect } from "react";
import { StatCard } from "../components/StatCard";
import { Users, BookOpen, CheckCircle, TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getAuditLogs, AuditLog } from "../context/AuthContext";

export function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeEnrollments: 0,
    gradesSubmitted: 0,
    completionRate: 0,
  });
  
  const [enrollmentData, setEnrollmentData] = useState<any[]>([]);
  const [gradeSubmissionData, setGradeSubmissionData] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<AuditLog[]>([]);

  useEffect(() => {
    // Load data from localStorage
    const students = JSON.parse(localStorage.getItem("students") || "[]");
    const grades = JSON.parse(localStorage.getItem("grades") || "[]");
    const logs = getAuditLogs();
    
    // Calculate stats
    const totalEnrollments = students.reduce((acc: number, s: any) => acc + (s.courses?.length || 0), 0);
    const submittedGrades = grades.length;
    
    setStats({
      totalStudents: students.length,
      activeEnrollments: totalEnrollments,
      gradesSubmitted: submittedGrades,
      completionRate: students.length > 0 ? Math.round((submittedGrades / (students.length * 5)) * 100) : 0, // Assuming 5 courses per student
    });

    // Calculate Enrollment Trend (Last 6 months)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonth = new Date().getMonth();
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(currentMonth - 5 + i);
      return { month: months[d.getMonth()], year: d.getFullYear(), index: d.getMonth() };
    });

    const enrollmentsByMonth = last6Months.map(m => {
      const count = students.filter((s: any) => {
        const date = new Date(s.enrolledDate);
        return date.getMonth() === m.index && date.getFullYear() === m.year;
      }).length;
      return { month: m.month, enrolled: count };
    });
    setEnrollmentData(enrollmentsByMonth);

    // Calculate Grade Submission by Department
    const departmentCounts: Record<string, number> = {};
    const totalByDept: Record<string, number> = {};
    
    grades.forEach((g: any) => {
      const dept = g.courseCode.split("-")[0];
      departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
      // Heuristic: assuming some total expected per department based on grades present, 
      // or just showing raw counts. Let's show raw counts for now or percentage of total grades.
    });

    const deptData = Object.keys(departmentCounts).map(dept => ({
      department: dept,
      submitted: departmentCounts[dept]
    }));
    
    // If no data, show empty placeholders or just empty
    if (deptData.length === 0) {
      setGradeSubmissionData([
        { department: "No Data", submitted: 0 }
      ]);
    } else {
      setGradeSubmissionData(deptData);
    }

    // Recent Activity (Top 5 logs)
    setRecentActivity(logs.slice(0, 5));
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Registrar Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's an overview of the academic system.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          change="Registered students"
          icon={Users}
          trend={stats.totalStudents > 0 ? "up" : "neutral"}
        />
        <StatCard
          title="Active Enrollments"
          value={stats.activeEnrollments}
          change="Course enrollments"
          icon={BookOpen}
          trend={stats.activeEnrollments > 0 ? "up" : "neutral"}
        />
        <StatCard
          title="Grades Submitted"
          value={stats.gradesSubmitted}
          change="This semester"
          icon={CheckCircle}
          trend={stats.gradesSubmitted > 0 ? "up" : "neutral"}
        />
        <StatCard
          title="Completion Rate"
          value={`${stats.completionRate}%`}
          change="Grade submissions"
          icon={TrendingUp}
          trend={stats.completionRate > 0 ? "up" : "neutral"}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment Trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Enrollment Trend (Last 6 Months)</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="enrolled" stroke="#6366f1" strokeWidth={2} name="Students Enrolled" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grade Submission by Department */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Grade Submissions by Department</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeSubmissionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="department" stroke="#6b7280" />
                <YAxis stroke="#6b7280" allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="submitted" fill="#6366f1" name="Submissions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivity.length === 0 ? (
             <p className="text-gray-500 text-sm py-4">No recent activity found.</p>
          ) : (
            recentActivity.map((activity, index) => (
              <div
                key={activity.id || index}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-indigo-600 text-sm font-medium">
                      {activity.user
                        .split(" ")
                        .slice(0, 2)
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}