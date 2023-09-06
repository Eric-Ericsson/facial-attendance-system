import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateEmail = () => {
    let error = "";
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email) {
      error = "Email is required";
    } else if (!emailPattern.test(email)) {
      return "Invalid email address";
    }
    return error;
  };

  const validatePassword = () => {
    let error = "";
    if (!password) {
      error = "Password is required";
    }
    return error;
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const emailError = validateEmail();
    const passwordError = validatePassword();

    setErrors({
      email: emailError,
      password: passwordError,
    });
    if (!emailError && !passwordError) {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result.error) {
        setLoading(false);
        toast.error(result.error);
        // toast.error("incorrect email or password");
      } else {
        setLoading(false);
        toast.success("login successfull");
        router.replace("/");
      }
    }
  };

  return (
    <div className="bg-[url('https://i.pinimg.com/564x/d2/2a/eb/d22aebf28f7ef83ea64ed21713e6c181.jpg')] bg-no-repeat bg-cover bg-center">
      <div className="bg-[#243b76] bg-opacity-70 min-h-screen flex flex-col items-center justify-center">
        <div className="bg-gray-200 w-[90%] sm:w-[70%] md:w-96 flex flex-col items-center rounded-3xl">
          <span className="text-2xl font-bold text-[#0D6EFD] p-5">
            Taking Attendance Today?
          </span>
          <div className="bg-[#0B4C61] w-full flex items-center justify-center space-x-2 p-2 rounded-tl-3xl rounded-tr-3xl">
            <span className="text-xl text-white font-semibold">Login</span>
          </div>
          <form
            onSubmit={handleSubmit}
            className="w-full flex flex-col space-y-3 my-10"
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
              <label className="pl-[10%]">Email</label>
              <div className="w-full flex flex-col items-center">
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  required
                  className="w-[80%] ring-1 ring-blue-400 rounded-sm p-1 focus:outline-none focus:ring-2 focus:ring-blue-600 px-1"
                />
              </div>
            </div>
            <div className="flex flex-col space-y-3">
              <label className="pl-[10%]">Password</label>
              <div className="w-full flex flex-col items-center">
                <input
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                  className="w-[80%] ring-1 ring-blue-400 rounded-sm p-1 focus:outline-none focus:ring-2 focus:ring-blue-600 px-1"
                />
              </div>
            </div>

            <div className="pt-5 flex items-center justify-center">
              <input
                type="submit"
                value={"login"}
                className="bg-gray-600 cursor-pointer px-8 py-2 text-white rounded-lg"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
