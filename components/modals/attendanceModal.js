import { attendanceModal } from "@components/atom/modalAtom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRecoilState } from "recoil";
import Modal from "react-modal";
import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "@components/firebase";
import Image from "next/image";
import { useSession } from "next-auth/react";

function AttendanceModal() {
  const { data: session } = useSession();
  const [openModal, setOpenModal] = useRecoilState(attendanceModal);
  const [userId, setUserId] = useState("");
  const [user, setUser] = useState("");
  const [courses, setCourses] = useState("");
  const [selectedValue, setSelectedValue] = useState("");

  // Function to find a student by userId
  async function findStudentByUserId(userId) {
    const studentsCollection = collection(db, "students");
    const q = query(studentsCollection, where("userId", "==", userId));

    try {
      const querySnapshot = await getDocs(q);
      if (querySnapshot.size === 0) {
        return null;
      }

      // Assuming you want to return the first matching document
      const studentDoc = querySnapshot.docs[0];
      return studentDoc.data();
    } catch (error) {
      throw error;
    }
  }

  const validateUserId = () => {
    let error;
    if (!userId) {
      return (error = "Please enter a userId");
    } else if (userId.length != 8) {
      return (error = "Please user ID should be a 8 digit number");
    }
  };

  const checkUser = (userIdToSearch) => {
    const error = validateUserId();
    if (!error) {
      findStudentByUserId(userIdToSearch)
        .then((student) => {
          if (student) {
            setUser(student);
            toast.success("found");
          } else {
            toast.error("Student not found.");
          }
        })
        .catch((error) => {
          toast.error("Error:", error);
        });
    } else {
      toast.error(error);
    }
  };

  //adding of attendance
  const takeAttendance = async (e) => {
    e.preventDefault();
    const error = validateUserId();

    if (!user)
      return toast.error("Please verify before attendance would be taken");
    if (!error && selectedValue) {
      const docRef = await addDoc(collection(db, "attendance"), {
        name: user?.name,
        userId: userId,
        courseCode: selectedValue,
        lecturer_id: session?.user?.uid,
        timestamp: serverTimestamp(),
      });

      toast.success("Attendance taken successfully");
      setUserId("");
      setUser("");
      setOpenModal(false);
    } else {
      toast.error(error);
    }
  };

  const handleSelectChange = (event) => {
    setSelectedValue(event.target.value);
  };

  //retrieving all course codes
  useEffect(
    () =>
      onSnapshot(query(collection(db, "courses")), (snapshot) => {
        setCourses(snapshot.docs);
      }),
    []
  );

  return (
    <>
      {openModal && (
        <Modal
          style={{
            overlay: {
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(50, 50, 50, 0.75)",
              backdropFilter: "blur(4px)",
            },
          }}
          shouldCloseOnEsc={true}
          isOpen={openModal}
          ariaHideApp={false}
          onAfterOpen={() => {
            document.body.style.top = `-${window.scrollY}px`;
            document.body.style.overflow = "hidden";
          }}
          onAfterClose={() => {
            const scrollY = document.body.style.top;
            document.body.style.overflow = "";
            document.body.style.top = "";
            window.scrollTo(0, parseInt(scrollY || "0") * -1);
            setUser("");
            setUserId("");
          }}
          onRequestClose={() => setOpenModal(false)}
          className={
            "max-w-lg w-[90%] overflow-scroll ease-in-out drop-shadow-2xl example delay-75 duration-300 max-h-[32rem] absolute top-14 left-[50%] translate-x-[-50%] bg-white rounded-xl"
          }
        >
          <div className="p-1 border-[1px] border-gray-300">
            <div className="flex flex-col border-b-[1px] p-2 ">
              <svg
                onClick={() => {
                  setOpenModal(false);
                }}
                className="cursor-pointer hover:bg-gray-200 rounded-full p-2 opacity-75"
                xmlns="http://www.w3.org/2000/svg"
                width="38"
                height="38"
                viewBox="0 0 32 32"
              >
                <path
                  fill="currentColor"
                  d="M16 2C8.2 2 2 8.2 2 16s6.2 14 14 14s14-6.2 14-14S23.8 2 16 2zm0 26C9.4 28 4 22.6 4 16S9.4 4 16 4s12 5.4 12 12s-5.4 12-12 12z"
                />
                <path
                  fill="currentColor"
                  d="M21.4 23L16 17.6L10.6 23L9 21.4l5.4-5.4L9 10.6L10.6 9l5.4 5.4L21.4 9l1.6 1.6l-5.4 5.4l5.4 5.4z"
                />
              </svg>
              <form
                onSubmit={takeAttendance}
                className="w-full flex flex-col space-y-3"
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
                <div className="flex flex-col space-y-1">
                  <label className="pl-[10%] text-sm">Enter User ID</label>
                  <div className="w-full flex flex-col items-center">
                    <input
                      type="number"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      required
                      placeholder="eg. 20692700"
                      className="placeholder:text-sm w-[80%] ring-1 ring-blue-400 rounded-sm p-1 focus:outline-none focus:ring-2 focus:ring-blue-600 px-1"
                    />
                  </div>
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="pl-[10%] text-sm">Name</label>
                  <div className="w-full flex flex-col items-center">
                    <input
                      type="text"
                      disabled
                      value={user?.name}
                      placeholder="read only"
                      className="placeholder:text-sm w-[80%] ring-1 ring-blue-400 rounded-sm p-1 focus:outline-none focus:ring-2 focus:ring-blue-600 px-1"
                    />
                  </div>
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="pl-[10%] text-sm">Select Course Code</label>
                  <div className="w-full flex flex-col items-center">
                    <select
                      name="course code"
                      required
                      onChange={handleSelectChange}
                      value={selectedValue}
                      className="w-[80%] ring-1 ring-blue-400 rounded-sm p-1 focus:outline-none focus:ring-2 focus:ring-blue-600 px-1"
                    >
                      <option value="">Select a course</option>
                      {courses?.map((data, index) => (
                        <option key={index} value={data.data().course_code}>
                          {data.data().course_code}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="relative flex items-center justify-center h-44 bg-green-00 w-[80%] mx-auto">
                  {user?.image ? (
                    <Image
                      className="rounded-lg"
                      src={user?.image}
                      fill="true"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 50vw, 33vw"
                      alt="profile image"
                    />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="200"
                      height="200"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="gray"
                        d="M5 3h13a3 3 0 0 1 3 3v13a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3m0 1a2 2 0 0 0-2 2v11.59l4.29-4.3l2.5 2.5l5-5L20 16V6a2 2 0 0 0-2-2H5m4.79 13.21l-2.5-2.5L3 19a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-1.59l-5.21-5.2l-5 5M7.5 6A2.5 2.5 0 0 1 10 8.5A2.5 2.5 0 0 1 7.5 11A2.5 2.5 0 0 1 5 8.5A2.5 2.5 0 0 1 7.5 6m0 1A1.5 1.5 0 0 0 6 8.5A1.5 1.5 0 0 0 7.5 10A1.5 1.5 0 0 0 9 8.5A1.5 1.5 0 0 0 7.5 7Z"
                      />
                    </svg>
                  )}
                </div>
                <div className="pt-5 flex items-center justify-center space-x-4">
                  <div
                    onClick={() => checkUser(userId)}
                    className="w-24 px-8 py-2 text-white flex items-center justify-center cursor-pointer rounded-md space-x-4 bg-blue-500"
                  >
                    verify
                  </div>
                  <input
                    type="submit"
                    value={"Take Attendance"}
                    className="bg-gray-600 cursor-pointer px-8 py-2 text-white rounded-lg"
                  />
                </div>
              </form>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

export default AttendanceModal;
