import { db } from "@components/firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  doc,
} from "firebase/firestore";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { utcToZonedTime } from "date-fns-tz";

const Reports = () => {
  const { data: session } = useSession({});
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [coursesRecords, setCoursesRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [user, setuser] = useState("");
  const [selectedDateFilter, setSelectedDateFilter] = useState("");
  const [selectedCourseCodeFilter, setSelectedCourseCodeFilter] = useState("");

  //retrieve current user
  useEffect(() => {
    if (session?.user?.uid) {
      const unsubscribe = onSnapshot(
        doc(db, "lecturers", session?.user?.uid),
        (snapshot) => {
          setuser(snapshot.data());
        }
      );
      return () => unsubscribe();
    }
  }, [db, session?.user?.uid]);

  async function getAttendanceForDate(lecturerId, selectedDate, courseCode) {
    const utcTimeZone = "Etc/UTC";
    const selectedDateStart = new Date(selectedDate);
    selectedDateStart.setHours(0, 0, 0, 0);

    const selectedDateEnd = new Date(selectedDate);
    selectedDateEnd.setHours(23, 59, 59, 999);

    const startOfDayUTC = utcToZonedTime(selectedDateStart, utcTimeZone);
    const endOfDayUTC = utcToZonedTime(selectedDateEnd, utcTimeZone);

    const attendanceCollection = collection(db, "attendance");
    let q = query(
      attendanceCollection,
      where("lecturer_id", "==", lecturerId),
      where("timestamp", ">=", startOfDayUTC),
      where("timestamp", "<=", endOfDayUTC)
    );

    if (courseCode) {
      q = query(
        attendanceCollection,
        where("lecturer_id", "==", lecturerId),
        where("timestamp", ">=", startOfDayUTC),
        where("timestamp", "<=", endOfDayUTC),
        where("courseCode", "==", courseCode)
      );
    }

    try {
      const querySnapshot = await getDocs(q);
      const attendanceData = [];

      querySnapshot.forEach((doc) => {
        attendanceData.push(doc.data());
      });

      setAttendanceRecords(attendanceData);
    } catch (error) {
      throw error;
    }
  }

  const pattern = /^[A-Z]{3}\s\d{3}$/;
  // Function to validate the input
  const validateCourseCode = () => {
    return pattern.test(selectedCourseCodeFilter);
  };

  const handleFilter = () => {
    const courseCodeIsValid = validateCourseCode();
    if (selectedDateFilter && courseCodeIsValid) {
      getAttendanceForDate(
        session?.user?.uid,
        selectedDateFilter,
        selectedCourseCodeFilter
      );
    } else {
      toast.error(
        "invalid course code format" ||
          "Filter with date, or date and course code"
      );
    }
  };

  //All courses registered by logged in user
  useEffect(() => {
    async function getCoursesForUser(userId) {
      const attendanceCollection = collection(db, "courses");
      const q = query(attendanceCollection, where("lecturer_id", "==", userId));

      try {
        const querySnapshot = await getDocs(q);
        const attendanceData = [];

        querySnapshot.forEach((doc) => {
          attendanceData.push(doc.data());
        });

        setCoursesRecords(attendanceData);
      } catch (error) {
        throw error;
      }
    }

    getCoursesForUser(session?.user?.uid);
  }, [session?.user?.uid]);

  //Retrieve all students
  useEffect(() => {
    async function fetchStudents() {
      const studentsCollection = collection(db, "students");

      try {
        const querySnapshot = await getDocs(studentsCollection);
        const studentData = [];

        querySnapshot.forEach((doc) => {
          studentData.push(doc.data());
        });

        setStudents(studentData);
      } catch (error) {
        throw error;
      }
    }

    fetchStudents();
  }, []);

  return (
    <div>
      <div className="m-10">
        <span className="text-3xl sm:text-5xl font-bold text-[#0B4C61]">
          Reports
        </span>
      </div>
      <ToastContainer
        position="bottom-left"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="flex flex-col items-center justify-center space-y-4 mb-10">
        <div>
          <span className="text-lg text-blue-600 font-semibold">
            All Attendance registered by {user?.name}
          </span>
        </div>
        <div className="flex items-center flex-wrap space-x-2 space-y-2 sm:sapce-y-0 sm:space-x-4 text-sm sm:text-base">
          <div className="ml-2 sm:ml-0">
            <label htmlFor="dateFilter">Date:</label>
            <input
              type="date"
              id="dateFilter"
              required
              onChange={(e) => setSelectedDateFilter(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="courseCodeFilter">Course Code:</label>
            <input
              type="text"
              id="courseCodeFilter"
              placeholder="Enter course code"
              className="ml-2 ring-1 ring-blue-400 rounded-sm p-1 focus:outline-none focus:ring-2 focus:ring-blue-600 px-1"
              onChange={(e) => setSelectedCourseCodeFilter(e.target.value)}
            />
          </div>
          <button
            onClick={handleFilter}
            className="bg-blue-500 text-white font-semibold px-8 py-1 rounded-xl drop-shadow-md cursor-pointer"
          >
            Filter
          </button>
        </div>
        <div className="overflow-scroll example pb-3">
          <table className="table-fixed border-spacing-2 border border-slate-400">
            {/* Table headers */}
            <thead>
              <tr className="text-sm sm:text-base">
                <th className="border border-black w-8">No.</th>
                <th className="border border-black w-36 sm:w-60">Name</th>
                <th className="border border-black w-28">Student ID</th>
                <th className="border border-black w-28">Course</th>
                <th className="border border-black w-36 sm:w-72">
                  Time registered
                </th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="text-sm text-center">
              {attendanceRecords.map((data, index) => (
                <tr key={index} className="odd:bg-gray-100">
                  <td className="border border-black">{index + 1}</td>
                  <td className="border border-black">{data.name}</td>
                  <td className="border border-black">{data.userId}</td>
                  <td className="border border-black">{data.courseCode}</td>
                  <td className="border border-black">
                    {data.timestamp.toDate().toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Courses Registered by Logged in User */}
      <div className="flex flex-col items-center justify-center space-y-4 mb-10">
        <div>
          <span className="text-lg text-blue-600 font-semibold">
            Courses Registered by {user?.name}
          </span>
        </div>
        <div className="overflow-scroll example pb-3">
          <table className="table-fixed border-spacing-2 border border-slate-400">
            <thead>
              <tr className="text-sm sm:text-base">
                <th className="border border-black w-8">No.</th>
                <th className="border border-black w-36 sm:w-60">
                  Course Code
                </th>
                <th className="border border-black w-36 sm:w-72">
                  Course Name
                </th>
              </tr>
            </thead>
            <tbody className="text-sm text-center">
              {coursesRecords.map((data, index) => (
                <tr key={index} className="odd:bg-gray-100">
                  <td className="border border-black">{index + 1}</td>
                  <td className="border border-black">{data.course_code}</td>
                  <td className="border border-black">{data.course_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Registered Students */}
      <div className="flex flex-col items-center justify-center space-y-4">
        <div>
          <span className="text-lg text-blue-600 font-semibold">
            Total Students
          </span>
        </div>
        <div className="overflow-scroll example pb-3">
          <table className="table-fixed border-spacing-2 border border-slate-400">
            <thead>
              <tr className="text-sm sm:text-base">
                <th className="border border-black w-8">No.</th>
                <th className="border border-black w-36 sm:w-72">Name</th>
                <th className="border border-black w-24">ID</th>
                <th className="border border-black w-16 sm:w-52">
                  Time registered
                </th>
              </tr>
            </thead>
            <tbody className="text-sm text-center">
              {students.map((data, index) => (
                <tr key={index} className="odd:bg-gray-100">
                  <td className="border border-black">{index + 1}</td>
                  <td className="border border-black">{data.name}</td>
                  <td className="border border-black">{data.userId}</td>
                  <td className="border border-black">
                    {data.timestamp.toDate().toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
