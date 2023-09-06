import AddCourse from "@components/components/modals/addCourse";
import AttendanceModal from "@components/components/modals/attendanceModal";
import CaptureImageModal from "@components/components/modals/captureImage";
import Head from "next/head";

const LayoutCover = ({ title, keyword, description, children }) => {

  return (
    <>
    <CaptureImageModal />
    <AttendanceModal />
    <AddCourse />
      <div>
        <Head>
          <title>{title}</title>
          <meta name="description" content={description} />
          <meta name="keywords" content={keyword} />
          <link rel="icon" href="" />
        </Head>
        {children}
      </div>
    </>
  );
};

export default LayoutCover;

LayoutCover.defaultProps = {
  title: "home | attendance system",
  description: "Easy and conveniet way to take attendance",
  keyword: "attendance taking, school, facial recognition",
  isScrolled: false,
};
