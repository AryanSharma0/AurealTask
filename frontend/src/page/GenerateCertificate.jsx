import { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import axios from "axios";
import { Link } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { RenderInput } from "../component/Input";

function GenerateCertificate() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    course: "",
    password: "",
    completion_date: new Date().toLocaleDateString(),
  });
  const [loading, setLoading] = useState(false);
  const certificateWrapper = useRef(null);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }

    if (!formData.course.trim()) {
      errors.course = "Course is required";
    }

    if (!formData.password.trim()) {
      errors.password = "Password is required";
    }

    setErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const downloadPdfDocument = async () => {
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    const input = certificateWrapper.current;
    html2canvas(input).then(async (canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      const blob = pdf.output("blob");
      const data = new FormData();
      data.append("name", formData.name);
      data.append("course", formData.course);
      data.append("email", formData.email);
      data.append("password", formData.password);
      data.append("completion_date", formData.completion_date);
      data.append("file", blob, `${formData.name}_certificate.pdf`);
      try {
        await axios.post(
          "https://tutedude-task-iota.vercel.app/api/certificates/generateNewCertificateWithNewUser",
          data,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        alert("File uploaded successfully");
        setFormData({
          name: "",
          email: "",
          course: "",
          password: "",
          completion_date: new Date().toLocaleDateString(),
        });
      } catch (error) {
        console.error("Error uploading file:", error);
      }
      setLoading(false);
    });
  };

  return (
    <div className="flex flex-col lg:flex-row p-5 gap-10 items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full lg:w-1/2 space-y-4 bg-white p-8 shadow-lg rounded-lg">
        <div className="flex items-center">
          <Link to={"/"}>
            <IoIosArrowBack size={32} color="black" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">
            ACM Certificate Generator
          </h1>
        </div>
        <p className="text-gray-600">
          Please enter your details to generate the certificate.
        </p>
        {loading ? (
          <div role="status" className="flex justify-center items-center">
            <svg
              aria-hidden="true"
              className="w-10 h-10 text-gray-200 animate-spin dark:text-gray-600 fill-yellow-600"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
            <span className="sr-only">Loading...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {RenderInput(
              "Name",
              "name",
              formData.name,
              handleInputChange,
              errors.name
            )}
            {RenderInput(
              "Email",
              "email",
              formData.email,
              handleInputChange,
              errors.email
            )}
            {RenderInput(
              "Course",
              "course",
              formData.course,
              handleInputChange,
              errors.course
            )}
            {RenderInput(
              "Password",
              "password",
              formData.password,
              handleInputChange,
              errors.password,
              "password"
            )}
            <button
              onClick={downloadPdfDocument}
              className="mt-4 w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Download PDF
            </button>
          </div>
        )}
      </div>
      <div className="mt-20 h-fit w-fit relative" ref={certificateWrapper}>
        <img
          src="../src/assets/Screenshot from 2024-05-08 19-06-54.png"
          alt="Certificate"
        />
        <div className="absolute h-full w-full top-0 text-[20px] font-bold text-slate-900 flex flex-col -mt-12  justify-center font-sans items-center">
          <h4 className="text-5xl text-yellow-500">{formData.name}</h4>
          <p className="w-[55%] pt-6 text-center text-[18px]">
            For successfully completing the {formData.course} course on{" "}
            {formData.completion_date}.
          </p>
        </div>
        <div className="absolute bottom-[55px] right-[52px] font-bold text-sm">
          {formData.publicId}
        </div>
      </div>
    </div>
  );
}

export default GenerateCertificate;
