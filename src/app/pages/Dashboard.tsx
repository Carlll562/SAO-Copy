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

export function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeEnrollments: 0,
    gradesSubmitted: 0,
    completionRate: 0,
  });
  
  const [enrollmentData, setEnrollmentData] = useState<any[]>([]);
  const [gradeSubmissionData, setGradeSubmissionData] = useState<any[]>([]);

  useEffect(() => {
    // Load data from localStorage
    const students = JSON.parse(localStorage.getItem("students") || "[]");
    const grades = JSON.parse(localStorage.getItem("grades") || "[]");
    
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
    
    grades.forEach((g: any) => {
      const dept = g.courseCode.split("-")[0];
      departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
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
        <div className="bg-white rounded-xl border border-gray-200 p-6 min-w-0">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Enrollment Trend (Last 6 Months)</h2>
          <div className="h-[300px] w-full min-w-0">
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
        <div className="bg-white rounded-xl border border-gray-200 p-6 min-w-0">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Grade Submissions by Department</h2>
          <div className="h-[300px] w-full min-w-0">
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
    </div>
  );
}
