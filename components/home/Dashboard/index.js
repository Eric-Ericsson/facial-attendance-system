import moment from "moment";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  addCourse,
  attendanceModal,
  captureImageModal,
  userImageUrl,
} from "@components/atom/modalAtom";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { utcToZonedTime } from "date-fns-tz";
import { startOfDay, endOfDay } from "date-fns";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db, storage } from "@components/firebase";
import { getDownloadURL, ref, uploadString } from "firebase/storage";

const Dashbaord = () => {
  const router = useRouter();
  const [openModal, setOpenModal] = useRecoilState(captureImageModal);
  const [openAttModal, setOpenAttModal] = useRecoilState(attendanceModal);
  const [openAddCourseModal, setOpenAddCourseModal] = useRecoilState(addCourse);
  const [studentsCount, setStudentsCount] = useState(0);
  const [pictureSrc, setPictureSrc] = useRecoilState(userImageUrl);
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [user, setuser] = useState("");
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.replace("/auth/login");
    },
  });

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

  //Validate the User Name field
  const validateName = () => {
    if (name.length < 3) {
      return (error = "Please the name entered is too short");
    } else if (name[0] >= "0" && name[0] <= "9") {
      return (error = "Please name cannot start with a number");
    }
  };

  const validateUserId = () => {
    if (userId.length != 8) {
      return (error = "Please user ID should be a 8 digit number");
    }
  };

  //checking total number of users registered
  useEffect(
    () =>
      onSnapshot(
        query(collection(db, "students"), orderBy("timestamp", "desc")),
        (snapshot) => {
          setStudentsCount(snapshot.docs.length);
        }
      ),
    []
  );

  //Adding New user to the system
  const addNewUser = async (e) => {
    e.preventDefault();
    const nameError = validateName();
    const userIdError = validateUserId();

    if (!nameError && !userIdError && pictureSrc) {
      if (loading) return;
      setLoading(true);

      const docRef = await addDoc(collection(db, "students"), {
        name: name,
        userId: userId,
        timestamp: serverTimestamp(),
      });

      const imageRef = ref(storage, `students/${docRef.id}/image`);

      if (pictureSrc) {
        await uploadString(imageRef, pictureSrc, "data_url").then(async () => {
          const downloadURL = await getDownloadURL(imageRef);
          await updateDoc(doc(db, "students", docRef.id), {
            image: downloadURL,
          });
        });
      }

      toast.success("New user added successfully");
      setName("");
      setUserId("");
      setPictureSrc("");
      setLoading(false);
    } else {
      toast.error(nameError || userIdError || "Please capture user");
    }
  };

  //retrieving all attendance taken today
  useEffect(() => {
    async function getAttendanceForToday(lecturerId) {
      const today = new Date();
      const utcTimeZone = "Etc/UTC";
      const startOfDayUTC = utcToZonedTime(startOfDay(today), utcTimeZone);
      const endOfDayUTC = utcToZonedTime(endOfDay(today), utcTimeZone);

      const attendanceCollection = collection(db, "attendance");
      const q = query(
        attendanceCollection,
        where("lecturer_id", "==", lecturerId),
        where("timestamp", ">=", startOfDayUTC),
        where("timestamp", "<=", endOfDayUTC)
      );

      try {
        const querySnapshot = await getDocs(q);
        const attendanceData = [];

        querySnapshot.forEach((doc) => {
          attendanceData.push(doc.data());
        });

        setAttendanceRecords(attendanceData);
      } catch (error) {
        console.error("Error getting attendance:", error);
        throw error;
      }
    }

    if (session?.user) {
      getAttendanceForToday(session?.user?.uid);
    }
  }, [openAttModal, session?.user, addNewUser]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  //Sign User Out
  const signOutUser = async () => {
    if (session) {
      if (window.confirm("You are about to sign out")) {
        await signOut();
      }
    } else {
      router.replace("/auth/login");
    }
  };

  return (
    <div className="bg-[url('https://i.pinimg.com/564x/d2/2a/eb/d22aebf28f7ef83ea64ed21713e6c181.jpg')] bg-no-repeat bg-cover bg-center">
      <div className="bg-[#243b76] bg-opacity-70 min-h-screen flex flex-col items-center justify-center">
        <div className="flex flex-col items-center m-5 text-center">
          <span className="text-xl sm:text-3xl font-semibold text-white">
            Face Recognition Based Attendance System
          </span>
          <span className="text-light text-sm sm:text-base">
            Last Sync:{"  "}
            <span>
              {isClient
                ? moment().format("Do MMMM YYYY, h:mm:ss a")
                : "Today is"}
            </span>
          </span>
          <span className="text-white">
            Logged in as:{" "}
            <span className="text-green-400 font-bold">{user?.name}</span>
          </span>
          <div className="pt-5 space-x-1 text-gray-200 font-semibold text-xs sm:text-sm">
            <span
              onClick={() => setOpenAttModal(!openAttModal)}
              className="bg-blue-500 p-2 rounded-2xl drop-shadow-md cursor-pointer"
            >
              Attendance
            </span>
            <span
              onClick={() => setOpenAddCourseModal(!openAddCourseModal)}
              className="bg-blue-500 p-2 rounded-2xl drop-shadow-md cursor-pointer"
            >
              Course
            </span>
            <span
              onClick={() => {
                router.push("/reports");
              }}
              className="bg-blue-500 p-2 rounded-2xl drop-shadow-md cursor-pointer"
            >
              Reports
            </span>
            <span
              onClick={signOutUser}
              className="bg-blue-500 p-2 rounded-2xl drop-shadow-md cursor-pointer"
            >
              SignOut
            </span>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-10 md:gap-5 lg:gap-10 w-[95%] sm:w-[80%] md:w-[95%]">
          <div className="flex flex-col items-center h-96 bg-gray-200 rounded-3xl">
            <div className="bg-[#0B4C61] w-full flex items-center space-x-2 justify-center p-2 rounded-tl-3xl rounded-tr-3xl">
              <span className="text-2xl text-white font-semibold">
                Today's Attendance
              </span>
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 2048 2048"
                >
                  <path
                    fill="white"
                    d="M1792 993q60 41 107 93t81 114t50 131t18 141q0 119-45 224t-124 183t-183 123t-224 46q-91 0-176-27t-156-78t-126-122t-85-157H128V128h256V0h128v128h896V0h128v128h256v865zM256 256v256h1408V256h-128v128h-128V256H512v128H384V256H256zm643 1280q-3-31-3-64q0-86 24-167t73-153h-97v-128h128v86q41-51 91-90t108-67t121-42t128-15q100 0 192 33V640H256v896h643zm573 384q93 0 174-35t142-96t96-142t36-175q0-93-35-174t-96-142t-142-96t-175-36q-93 0-174 35t-142 96t-96 142t-36 175q0 93 35 174t96 142t142 96t175 36zm64-512h192v128h-320v-384h128v256zM384 1024h128v128H384v-128zm256 0h128v128H640v-128zm0-256h128v128H640V768zm-256 512h128v128H384v-128zm256 0h128v128H640v-128zm384-384H896V768h128v128zm256 0h-128V768h128v128zm256 0h-128V768h128v128z"
                  />
                </svg>
              </span>
            </div>
            <div
              onClick={() => setOpenAttModal(!openAttModal)}
              className="flex items-center justify-center cursor-pointer bg-[#0D6EFD] rounded-xl h-12 w-[80%] my-8"
            >
              <span className="font-semibold text-white text-xl">
                Take Attendance
              </span>
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 48 48"
                >
                  <path
                    fill="white"
                    d="M38 7H10c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h28c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm0 12H10c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h28c1.1 0 2-.9 2-2v-6c0-1.1-.9-2-2-2zm0 12H10c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h28c1.1 0 2-.9 2-2v-6c0-1.1-.9-2-2-2z"
                  />
                  <circle cx="38" cy="38" r="10" fill="#43A047" />
                  <path
                    fill="#DCEDC8"
                    d="M42.5 33.3L36.8 39l-2.7-2.7l-2.1 2.2l4.8 4.8l7.8-7.8z"
                  />
                </svg>
              </span>
            </div>
            <div className="overflow-scroll example pb-3">
              <table className="table-fixed border-spacing-2 border border-slate-400">
                <thead>
                  <tr className="sticky top-0 bg-gray-200">
                    <th className="border border-black w-8">No.</th>
                    <th className="border border-black w-36 sm:w-54">Name</th>
                    <th className="border border-black w-16">ID</th>
                    <th className="border border-black w-16 sm:w-20">Course</th>
                    <th className="border border-black w-16 sm:w-20">Time</th>
                  </tr>
                </thead>
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

          {/* Add New User section */}
          <div className="bg-gray-200 flex flex-col items-center rounded-3xl">
            <div className="bg-[#0B4C61] w-full flex items-center justify-center space-x-2 p-2 rounded-tl-3xl rounded-tr-3xl">
              <span className="text-2xl text-white font-semibold">
                Add New User
              </span>
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 1024 1024"
                >
                  <path
                    fill="white"
                    d="M892 772h-80v-80c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v80h-80c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h80v80c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-80h80c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8zM373.5 498.4c-.9-8.7-1.4-17.5-1.4-26.4c0-15.9 1.5-31.4 4.3-46.5c.7-3.6-1.2-7.3-4.5-8.8c-13.6-6.1-26.1-14.5-36.9-25.1a127.54 127.54 0 0 1-38.7-95.4c.9-32.1 13.8-62.6 36.3-85.6c24.7-25.3 57.9-39.1 93.2-38.7c31.9.3 62.7 12.6 86 34.4c7.9 7.4 14.7 15.6 20.4 24.4c2 3.1 5.9 4.4 9.3 3.2c17.6-6.1 36.2-10.4 55.3-12.4c5.6-.6 8.8-6.6 6.3-11.6c-32.5-64.3-98.9-108.7-175.7-109.9c-110.8-1.7-203.2 89.2-203.2 200c0 62.8 28.9 118.8 74.2 155.5c-31.8 14.7-61.1 35-86.5 60.4c-54.8 54.7-85.8 126.9-87.8 204a8 8 0 0 0 8 8.2h56.1c4.3 0 7.9-3.4 8-7.7c1.9-58 25.4-112.3 66.7-153.5c29.4-29.4 65.4-49.8 104.7-59.7c3.8-1.1 6.4-4.8 5.9-8.8zM824 472c0-109.4-87.9-198.3-196.9-200C516.3 270.3 424 361.2 424 472c0 62.8 29 118.8 74.2 155.5a300.95 300.95 0 0 0-86.4 60.4C357 742.6 326 814.8 324 891.8a8 8 0 0 0 8 8.2h56c4.3 0 7.9-3.4 8-7.7c1.9-58 25.4-112.3 66.7-153.5C505.8 695.7 563 672 624 672c110.4 0 200-89.5 200-200zm-109.5 90.5C690.3 586.7 658.2 600 624 600s-66.3-13.3-90.5-37.5a127.26 127.26 0 0 1-37.5-91.8c.3-32.8 13.4-64.5 36.3-88c24-24.6 56.1-38.3 90.4-38.7c33.9-.3 66.8 12.9 91 36.6c24.8 24.3 38.4 56.8 38.4 91.4c-.1 34.2-13.4 66.3-37.6 90.5z"
                  />
                </svg>
              </span>
            </div>
            <form
              onSubmit={addNewUser}
              className="w-full flex flex-col space-y-3 my-3"
            >
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
              <div className="flex flex-col space-y-3">
                <label className="pl-[10%]">Enter User Name</label>
                <div className="w-full flex flex-col items-center">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-[80%] ring-1 ring-blue-400 rounded-sm p-1 focus:outline-none focus:ring-2 focus:ring-blue-600 px-1"
                  />
                </div>
              </div>
              <div className="flex flex-col space-y-3">
                <label className="pl-[10%]">Enter User ID</label>
                <div className="w-full flex flex-col items-center">
                  <input
                    type="number"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    required
                    className="w-[80%] ring-1 ring-blue-400 rounded-sm p-1 focus:outline-none focus:ring-2 focus:ring-blue-600 px-1"
                  />
                </div>
              </div>
              <div className="ml-[10%] flex items-center space-x-4">
                <div
                  onClick={() => setOpenModal(!openModal)}
                  className={`rounded-xl w-32 cursor-pointer ${
                    !pictureSrc ? "bg-red-300" : "bg-[#0B4C61]"
                  }  px-8 py-2 text-white font-semibold`}
                >
                  {!pictureSrc ? "capture" : "captured"}
                </div>
                <div
                  onClick={() => setPictureSrc("")}
                  className="cursor-pointer"
                >
                  <span>
                    <svg
                      className={`${loading && "animate-spin"} `}
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                    >
                      <path
                        fill="currentColor"
                        fillRule="evenodd"
                        d="M15.963 7.23A8 8 0 0 1 .044 8.841a.75.75 0 0 1 1.492-.158a6.5 6.5 0 1 0 9.964-6.16V4.25a.75.75 0 0 1-1.5 0V0h4.25a.75.75 0 0 1 0 1.5h-1.586a8.001 8.001 0 0 1 3.299 5.73ZM7 2a1 1 0 1 0 0-2a1 1 0 0 0 0 2Zm-2.25.25a1 1 0 1 1-2 0a1 1 0 0 1 2 0ZM1.5 6a1 1 0 1 0 0-2a1 1 0 0 0 0 2Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </div>
              </div>
              <div className="pt-5 flex items-center justify-center">
                <input
                  type="submit"
                  value={"Add New User"}
                  className="bg-gray-600 cursor-pointer px-8 py-2 text-white rounded-lg"
                />
              </div>
            </form>
            <div>
              <span>Total Users registered: </span>
              <span className="font-semibold">{studentsCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashbaord;
