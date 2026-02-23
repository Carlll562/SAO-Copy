import React, { useState, useEffect } from "react";
import { StatCard } from "../components/StatCard";
import { Users, BookOpen, CheckCircle, TrendingUp, History, FileText } from "lucide-react";
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
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

// Sample data mirrored from AuditLogs for the Recent Activities section
const recentActivities = [
  {
    id: "1",
    action: "Grade Updated",
    user: "John Smith",
    target: "CS101 - Final Exam",
    timestamp: "2024-03-20 14:30:22",
    status: "success",
  },
  {
    id: "2",
    action: "New Student Added",
    user: "Sarah Johnson",
    target: "Emily Davis (ID: 2024-001)",
    timestamp: "2024-03-20 13:15:10",
    status: "success",
  },
  {
    id: "3",
    action: "System Login",
    user: "Admin User",
    target: "Dashboard Access",
    timestamp: "2024-03-20 09:00:05",
    status: "success",
  },
  {
    id: "4",
    action: "Failed Login Attempt",
    user: "Unknown",
    target: "Login Page",
    timestamp: "2024-03-19 23:45:12",
    status: "failed",
  }
];

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

      {/* New Recent Activities Section */}
      <div className="grid gap-4 grid-cols-1">
        <Card className="col-span-1 border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl flex items-center gap-2">
                <History className="h-5 w-5" />
                Recent Activities
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-gray-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentActivities.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {log.action}
                        </div>
                      </TableCell>
                      <TableCell>{log.user}</TableCell>
                      <TableCell>{log.target}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {log.timestamp}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={log.status === "success" ? "default" : "destructive"}
                          className="capitalize"
                        >
                          {log.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}