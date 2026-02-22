import { useState, useEffect } from "react";
import { Save, X, AlertCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { addAuditLog, useAuth } from "../context/AuthContext";

interface Student {
  id: number;
  studentId: string;
  name: string;
  major: string;
}

interface Grade {
  id: string;
  studentId: string;
  courseCode: string;
  courseName: string;
  grade: number;
  semester: string;
  submittedBy: string;
  submittedDate: string;
}

const validGrades = [4.0, 3.5, 3.0, 2.5, 2.0, 1.5, 1.0, 0.0];

const courses = [
  { code: "CS-101", name: "Introduction to Computer Science" },
  { code: "MATH-201", name: "Calculus II" },
  { code: "PHYS-101", name: "General Physics I" },
  { code: "ENG-201", name: "English Literature" },
  { code: "HIST-101", name: "World History" },
];

export function GradeEntry() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [gradeValue, setGradeValue] = useState("");
  const [semester, setSemester] = useState("Spring 2024");
  const [validationError, setValidationError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const stored = localStorage.getItem("students");
    if (stored) {
      setStudents(JSON.parse(stored));
    }
  }, []);

  const handleGradeChange = (value: string) => {
    setGradeValue(value);
    setValidationError("");

    if (value && !validGrades.includes(parseFloat(value))) {
      setValidationError("Invalid grade. Please enter a valid grade (4.0, 3.5, 3.0, 2.5, 2.0, 1.5, 1.0, 0.0)");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudent || !selectedCourse || !gradeValue) {
      toast.error("Please fill in all fields");
      return;
    }

    const grade = parseFloat(gradeValue);
    if (!validGrades.includes(grade)) {
      toast.error("Invalid grade value");
      return;
    }

    const student = students.find((s) => s.studentId === selectedStudent);
    const course = courses.find((c) => c.code === selectedCourse);

    if (!student || !course) {
      toast.error("Student or course not found");
      return;
    }

    // Save grade
    const newGrade: Grade = {
      id: Date.now().toString(),
      studentId: student.studentId,
      courseCode: course.code,
      courseName: course.name,
      grade,
      semester,
      submittedBy: user?.email || "Unknown",
      submittedDate: new Date().toISOString(),
    };

    const grades = JSON.parse(localStorage.getItem("grades") || "[]");
    grades.push(newGrade);
    localStorage.setItem("grades", JSON.stringify(grades));

    // Update student GPA
    const studentGrades = grades.filter((g: Grade) => g.studentId === student.studentId);
    const avgGpa = studentGrades.reduce((acc: number, g: Grade) => acc + g.grade, 0) / studentGrades.length;
    
    const updatedStudents = students.map((s) =>
      s.studentId === student.studentId ? { ...s, gpa: avgGpa } : s
    );
    localStorage.setItem("students", JSON.stringify(updatedStudents));

    toast.success("Grade submitted successfully");

    addAuditLog({
      action: "Submit Grade",
      user: user?.email || "Unknown",
      status: "Success",
      details: `Submitted grade ${grade} for ${student.name} in ${course.code}`,
    });

    // Reset form
    setSelectedStudent("");
    setSelectedCourse("");
    setGradeValue("");
    setValidationError("");
  };

  const handleCancel = () => {
    setSelectedStudent("");
    setSelectedCourse("");
    setGradeValue("");
    setValidationError("");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Grade Entry</h1>
        <p className="text-gray-600 mt-1">Submit grades for students</p>
      </div>

      {/* Info Banner */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-indigo-600 mt-0.5" />
          <div>
            <p className="text-sm text-indigo-900 font-medium">Grade Entry Guidelines</p>
            <p className="text-sm text-indigo-700 mt-1">
              Valid grades: 4.0, 3.5, 3.0, 2.5, 2.0, 1.5, 1.0, 0.0. All submissions are logged for audit purposes.
            </p>
          </div>
        </div>
      </div>

      {/* Grade Entry Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="student">Select Student</Label>
            <select
              id="student"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">-- Choose a student --</option>
              {students.map((student) => (
                <option key={student.id} value={student.studentId}>
                  {student.studentId} - {student.name} ({student.major})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="course">Select Course</Label>
            <select
              id="course"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">-- Choose a course --</option>
              {courses.map((course) => (
                <option key={course.code} value={course.code}>
                  {course.code} - {course.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade">Grade (GPA Scale)</Label>
            <select
              id="grade"
              value={gradeValue}
              onChange={(e) => handleGradeChange(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">-- Select grade --</option>
              <option value="4.0">4.0 (A)</option>
              <option value="3.5">3.5 (A-)</option>
              <option value="3.0">3.0 (B+)</option>
              <option value="2.5">2.5 (B)</option>
              <option value="2.0">2.0 (C+)</option>
              <option value="1.5">1.5 (C)</option>
              <option value="1.0">1.0 (D)</option>
              <option value="0.0">0.0 (F)</option>
            </select>
            {validationError && (
              <div className="flex items-start gap-2 text-red-600 text-sm mt-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{validationError}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="semester">Semester</Label>
            <select
              id="semester"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="Spring 2024">Spring 2024</option>
              <option value="Fall 2023">Fall 2023</option>
              <option value="Spring 2023">Spring 2023</option>
              <option value="Fall 2022">Fall 2022</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              Submit Grade
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </form>
      </div>

      {/* Valid Grades Reference */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Grade Scale Reference</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { grade: "4.0", letter: "A" },
            { grade: "3.5", letter: "A-" },
            { grade: "3.0", letter: "B+" },
            { grade: "2.5", letter: "B" },
            { grade: "2.0", letter: "C+" },
            { grade: "1.5", letter: "C" },
            { grade: "1.0", letter: "D" },
            { grade: "0.0", letter: "F" },
          ].map((item) => (
            <div key={item.grade} className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-lg font-semibold text-gray-900">{item.grade}</p>
              <p className="text-sm text-gray-600">{item.letter}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
