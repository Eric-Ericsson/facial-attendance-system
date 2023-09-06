import { addCourse } from "@components/atom/modalAtom";
import { useRecoilState } from "recoil";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "react-modal";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@components/firebase";

function AddCourse() {
  const { data: session } = useSession();
  const [openModal, setOpenModal] = useRecoilState(addCourse);
  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");

  const pattern = /^[A-Z]{3}\s\d{3}$/;
  // Function to validate the input
  const validateCourseCode = () => {
    return pattern.test(courseCode);
  };

  const handleAddNewCourse = async (e) => {
    e.preventDefault();
    const isValid = validateCourseCode();
    if (isValid) {
      const docRef = await addDoc(collection(db, "courses"), {
        course_code: courseCode,
        course_name: courseName,
        lecturer_id: session?.user?.uid,
      });
      toast.success("Course added successfully");
      setCourseCode("");
      setCourseName("");
      setOpenModal(false);
    } else {
      toast.error(error);
    }
  };

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
            setCourseCode("");
            setCourseName("");
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
                onSubmit={handleAddNewCourse}
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
                  <label className="pl-[10%] text-sm">Enter Course Code</label>
                  <div className="w-full flex flex-col items-center">
                    <input
                      type="text"
                      value={courseCode}
                      onChange={(e) => setCourseCode(e.target.value)}
                      required
                      placeholder="eg. CSM 345"
                      className="placeholder:text-sm w-[80%] ring-1 ring-blue-400 rounded-sm p-1 focus:outline-none focus:ring-2 focus:ring-blue-600 px-1"
                    />
                  </div>
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="pl-[10%] text-sm">Enter Course Nane</label>
                  <div className="w-full flex flex-col items-center">
                    <input
                      type="text"
                      value={courseName}
                      required
                      onChange={(e) => setCourseName(e.target.value)}
                      placeholder="eg. Operating Systems"
                      className="placeholder:text-sm w-[80%] ring-1 ring-blue-400 rounded-sm p-1 focus:outline-none focus:ring-2 focus:ring-blue-600 px-1"
                    />
                  </div>
                </div>

                <div className="pt-5 flex items-center justify-center space-x-4">
                  <input
                    type="submit"
                    value={"Add Course"}
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

export default AddCourse;
