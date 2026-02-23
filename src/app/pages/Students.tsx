import { useState, useEffect } from "react";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { addAuditLog, useAuth } from "../context/AuthContext";

interface Student {
  id: number;
  studentId: string;
  name: string;
  section: string;
  major: string;
  year: string;
  semester: string;
  gpa: number;
  enrolledDate: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

const initialStudents: Student[] = [];

export function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    studentId: "",
    name: "",
    section: "",
    major: "Computer Science",
    year: "1",
    semester: "1",
  });
  const { user } = useAuth();

  // READ: Load students from local storage
  useEffect(() => {
    const stored = localStorage.getItem("students");
    if (stored) {
      setStudents(JSON.parse(stored));
    } else {
      setStudents(initialStudents);
      localStorage.setItem("students", JSON.stringify(initialStudents));
    }
  }, []);

  const saveStudents = (updatedStudents: Student[]) => {
    setStudents(updatedStudents);
    localStorage.setItem("students", JSON.stringify(updatedStudents));
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // CREATE: Open dialog for new student
  const handleAddStudent = () => {
    setEditingStudent(null);
    setFormData({
      studentId: "",
      name: "",
      section: "",
      major: "Computer Science",
      year: "1",
      semester: "1",
    });
    setDialogOpen(true);
  };

  // UPDATE: Open dialog with existing student data
  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      studentId: student.studentId,
      name: student.name,
      section: student.section || "",
      major: student.major,
      year: student.year,
      semester: student.semester || "1",
    });
    setDialogOpen(true);
  };

  // DELETE: Remove student from state and storage
  const handleDeleteStudent = (student: Student) => {
    if (window.confirm(`Are you sure you want to delete the record for ${student.name}?`)) {
      const updatedStudents = students.filter((s) => s.id !== student.id);
      saveStudents(updatedStudents);
      toast.success("Student deleted successfully");

      const currentUser = user?.email || "Unknown";
      addAuditLog({
        action: "Delete Student",
        user: currentUser,
        status: "Success",
        details: `Deleted student: ${student.name} (${student.studentId})`,
      });
    }
  };

  // SUBMIT: Handle both Create and Update saving logic
  const handleSubmit = () => {
    const timestamp = new Date().toISOString();
    const currentUser = user?.email || "Unknown";

    if (editingStudent) {
      // Update existing
      const updatedStudents = students.map((s) =>
        s.id === editingStudent.id
          ? { 
              ...s, 
              ...formData,
              updatedAt: timestamp,
              updatedBy: currentUser
            }
          : s
      );
      saveStudents(updatedStudents);
      toast.success("Student updated successfully");

      addAuditLog({
        action: "Update Student",
        user: currentUser,
        status: "Success",
        details: `Updated student: ${formData.name} (${formData.studentId})`,
      });
    } else {
      // Create new
      const newStudent: Student = {
        id: Date.now(),
        ...formData,
        gpa: 0.0,
        enrolledDate: timestamp.split("T")[0],
        createdAt: timestamp,
        updatedAt: timestamp,
        createdBy: currentUser,
        updatedBy: currentUser,
      };
      saveStudents([...students, newStudent]);
      toast.success("Student added successfully");

      addAuditLog({
        action: "Add Student",
        user: currentUser,
        status: "Success",
        details: `Added new student: ${formData.name} (${formData.studentId})`,
      });
    }
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Students</h1>
          <p className="text-gray-600 mt-1">Manage student records and information</p>
        </div>
        <Button onClick={handleAddStudent} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Student
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Search by name or student ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student ID</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Semester</TableHead>
              <TableHead>Date Enrolled</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Updated By</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-mono font-medium">{student.studentId}</TableCell>
                <TableCell className="font-medium">{student.name}</TableCell>
                <TableCell>{student.section}</TableCell>
                <TableCell>{student.year}</TableCell>
                <TableCell>{student.semester}</TableCell>
                <TableCell>{student.enrolledDate}</TableCell>
                <TableCell className="text-xs text-gray-500">{new Date(student.createdAt).toLocaleString()}</TableCell>
                <TableCell className="text-xs text-gray-500">{new Date(student.updatedAt).toLocaleString()}</TableCell>
                <TableCell className="text-sm">{student.createdBy}</TableCell>
                <TableCell className="text-sm">{student.updatedBy}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => handleEditStudent(student)}
                      title="Edit Student"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteStudent(student)}
                      title="Delete Student"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingStudent ? "Edit Student" : "Add New Student"}</DialogTitle>
            <DialogDescription>
              {editingStudent ? "Update student information" : "Add a new student to the system"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="studentId">Student ID</Label>
              <Input
                id="studentId"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                placeholder="STU2024001"
                disabled={!!editingStudent}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                disabled={!!editingStudent} /* <--- Added this line */
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="major">Major</Label>
              <select
                id="major"
                value={formData.major}
                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="English Literature">English Literature</option>
                <option value="History">History</option>
                <option value="Biology">Biology</option>
                <option value="Chemistry">Chemistry</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="section">Section</Label>
              <Input
                id="section"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                placeholder="A"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Current Year</Label>
              <select
                id="year"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="semester">Current Semester</Label>
              <select
                id="semester"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-indigo-600 hover:bg-indigo-700">
              {editingStudent ? "Update" : "Add"} Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}