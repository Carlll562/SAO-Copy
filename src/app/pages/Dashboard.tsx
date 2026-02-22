import { useState, useEffect } from "react";
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

const enrollmentData = [
  { month: "Jan", enrolled: 1450 },
  { month: "Feb", enrolled: 1480 },
  { month: "Mar", enrolled: 1520 },
  { month: "Apr", enrolled: 1500 },
  { month: "May", enrolled: 1560 },
  { month: "Jun", enrolled: 1590 },
];

const gradeSubmissionData = [
  { department: "CS", submitted: 95 },
  { department: "Math", submitted: 88 },
  { department: "Physics", submitted: 92 },
  { department: "English", submitted: 85 },
  { department: "History", submitted: 90 },
];

export function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeEnrollments: 0,
    gradesSubmitted: 0,
    completionRate: 0,
  });

  useEffect(() => {
    // Load stats from localStorage
    const students = JSON.parse(localStorage.getItem("students") || "[]");
    const grades = JSON.parse(localStorage.getItem("grades") || "[]");
    
    const totalEnrollments = students.reduce((acc: number, s: any) => acc + (s.courses?.length || 0), 0);
    const submittedGrades = grades.length;
    
    setStats({
      totalStudents: students.length,
      activeEnrollments: totalEnrollments,
      gradesSubmitted: submittedGrades,
      completionRate: 92,
    });
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
          trend="up"
        />
        <StatCard
          title="Active Enrollments"
          value={stats.activeEnrollments}
          change="Course enrollments"
          icon={BookOpen}
          trend="up"
        />
        <StatCard
          title="Grades Submitted"
          value={stats.gradesSubmitted}
          change="This semester"
          icon={CheckCircle}
          trend="up"
        />
        <StatCard
          title="Completion Rate"
          value={`${stats.completionRate}%`}
          change="Grade submissions"
          icon={TrendingUp}
          trend="up"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment Trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Enrollment Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={enrollmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="enrolled" stroke="#6366f1" strokeWidth={2} name="Students Enrolled" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Grade Submission by Department */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Grade Submission Rate by Department</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={gradeSubmissionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="department" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Bar dataKey="submitted" fill="#6366f1" name="Submission %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[
            { user: "Prof. John Smith", action: "submitted grades for CS-101", time: "5 minutes ago" },
            { user: "Prof. Sarah Davis", action: "updated student records", time: "25 minutes ago" },
            { user: "Registrar Office", action: "enrolled 3 new students", time: "1 hour ago" },
            { user: "Prof. Mike Johnson", action: "submitted grades for MATH-201", time: "2 hours ago" },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-indigo-600 text-sm font-medium">
                    {activity.user
                      .split(" ")
                      .slice(-2)
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.user}</span> {activity.action}
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
