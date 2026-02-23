import { useState, useEffect } from "react";
import { Search, FileText } from "lucide-react";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { getAuditLogs, AuditLog } from "../context/AuthContext";

export function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");

  useEffect(() => {
    setLogs(getAuditLogs());
    
    // Refresh logs every 5 seconds
    const interval = setInterval(() => {
      setLogs(getAuditLogs());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === "All" || log.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <FileText className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-semibold text-gray-900">Audit Logs</h1>
          </div>
          <p className="text-gray-600 mt-1">View all system activities and user actions</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <p className="text-sm text-indigo-900">
          <strong>System Audit Trail:</strong> All actions including logins, grade submissions, and student record changes are logged here for transparency and security.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="All">All Status</option>
          <option value="Success">Success</option>
          <option value="Failed">Failed</option>
          <option value="Error">Error</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Logs</p>
          <p className="text-2xl font-semibold text-gray-900">{logs.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Success</p>
          <p className="text-2xl font-semibold text-green-600">
            {logs.filter((l) => l.status === "Success").length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Failed/Error</p>
          <p className="text-2xl font-semibold text-red-600">
            {logs.filter((l) => l.status === "Failed" || l.status === "Error").length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Date & Time</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No logs found
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-sm">
                    {formatTimestamp(log.timestamp)}
                  </TableCell>
                  <TableCell className="font-medium">{log.user}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        log.status === "Success"
                          ? "bg-green-100 text-green-800"
                          : log.status === "Failed"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {log.status}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-md truncate text-sm text-gray-600">{log.details}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}