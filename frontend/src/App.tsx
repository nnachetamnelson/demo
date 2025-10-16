import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Classes from "./pages/Classes";
import ClassLevels from "./pages/ClassLevels";
import ClassAllocations from "./pages/ClassAllocations";
import EnterResults from "./pages/EnterResults";
import StudentList from "./pages/StudentList";
import ViewResults from "./pages/View-result";
import GraduatedStudent from "./pages/GraduatedStudent";
import SchoolProfile from "./pages/SchoolProfile";
import StaffList from "./pages/StaffList";
import Deactivatedstaff from "./pages/Deactivatedstaff";
import Deactivatedstudents from "./pages/Deactivated-students";
import Attendance from "./pages/Attendance";
import Exams from "./pages/Exams";
import Reports from "./pages/Reports";
import Notifications from "./pages/Notifications";
import Profiles from "./pages/Profiles";
import Portal from "./pages/Portal";
import Grades from "./pages/Grades";
import StudentProfile from "./pages/Student/StudentProfile";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/students"
          element={
            <ProtectedRoute>
              <Layout>
                <Students />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/classes"
          element={
            <ProtectedRoute>
              <Layout>
                <Classes />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/classlevel"
          element={
            <ProtectedRoute>
              <Layout>
                <ClassLevels />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/Classallocations"
          element={
            <ProtectedRoute>
              <Layout>
                <ClassAllocations />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/enterResults"
          element={
            <ProtectedRoute>
              <Layout>
                <EnterResults />
              </Layout>
            </ProtectedRoute>
          }
        />
         <Route
          path="/viewresults"
          element={
            <ProtectedRoute>
              <Layout>
                <ViewResults />
              </Layout>
            </ProtectedRoute>
          }
        />
          <Route
          path="/studentList"
          element={
            <ProtectedRoute>
              <Layout>
                <StudentList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <StudentProfile />
              </Layout>
            </ProtectedRoute>
          }
        />
       

          <Route
          path="/staffList"
          element={
            <ProtectedRoute>
              <Layout>
                <StaffList />
              </Layout>
            </ProtectedRoute>
          }
        />
         <Route
          path="/deactivatedstaff"
          element={
            <ProtectedRoute>
              <Layout>
                <Deactivatedstaff />
              </Layout>
            </ProtectedRoute>
          }
        />
        

         <Route
          path="/graduatedStudent"
          element={
            <ProtectedRoute>
              <Layout>
                <GraduatedStudent />
              </Layout>
            </ProtectedRoute>
          }
        />
         <Route
          path="/schoolProfile"
          element={
            <ProtectedRoute>
              <Layout>
                <SchoolProfile />
              </Layout>
            </ProtectedRoute>
          }
        />
        
         <Route
          path="/deactivated-students"
          element={
            <ProtectedRoute>
              <Layout>
                <Deactivatedstudents />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <Layout>
                <Attendance />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/exams"
          element={
            <ProtectedRoute>
              <Layout>
                <Exams />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/grades"
          element={
            <ProtectedRoute>
              <Layout>
                <Grades />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Layout>
                <Reports />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Layout>
                <Notifications />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profiles"
          element={
            <ProtectedRoute>
              <Layout>
                <Profiles />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/portal"
          element={
            <ProtectedRoute>
              <Layout>
                <Portal />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

