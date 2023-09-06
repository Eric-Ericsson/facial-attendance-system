import { captureImageModal, userImageUrl } from "@components/atom/modalAtom";
import { useRecoilState } from "recoil";
import Modal from "react-modal";
import Webcam from "react-webcam";
import React, { useState } from "react";
const WebcamComponent = () => <Webcam />;
const videoConstraints = {
  width: 400,
  height: 400,
  facingMode: "user",
};

function CaptureImageModal() {
  const [openModal, setOpenModal] = useRecoilState(captureImageModal);
  const [picture, setPicture] = useRecoilState(userImageUrl);
  const webcamRef = React.useRef(null);
  const capture = React.useCallback(() => {
    const pictureSrc = webcamRef.current.getScreenshot();
    setPicture(pictureSrc);
  });

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
            document.body.style.overflow = "visible";
            document.body.style.top = "";
            window.scrollTo(0, parseInt(scrollY || "0") * -1);
          }}
          onRequestClose={() => setOpenModal(false)}
          className={
            "max-w-lg w-[90%] overflow-scroll ease-in-out drop-shadow-2xl example delay-75 duration-300 max-h-[40rem] absolute top-16 left-[50%] translate-x-[-50%] bg-white rounded-xl"
          }
        >
          <div className="p-1 border-[1px] border-gray-300">
            <div className="flex flex-col gap-5 border-b-[1px] p-2 ">
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
<div className="flex flex-col items-center">
              <div>
                {picture == "" ? (
                  <Webcam
                    audio={false}
                    height={400}
                    ref={webcamRef}
                    width={400}
                    screenshotFormat="image/png"
                    videoConstraints={videoConstraints}
                  />
                ) : (
                  <img src={picture} />
                )}
              </div>
              <div>
                {picture != "" ? (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setPicture('');
                    }}
                    className="rounded-lg w-32 cursor-pointer bg-red-500 mt-2 px-8 py-2 text-white font-semibold"
                  >
                    Retake
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      capture();
                    }}
                    className="rounded-lg w-32 cursor-pointer bg-blue-500 mt-2 px-8 py-2 text-white font-semibold"
                  >
                    Capture
                  </button>
                )}
              </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

export default CaptureImageModal;
