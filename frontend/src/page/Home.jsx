import { useState, useEffect, useRef } from "react";
import { IoMdAdd } from "react-icons/io";
import { Link } from "react-router-dom";
import { formatDate } from "../utils/dateFormat";
import { Error, Loading } from "../component/Error";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function Home() {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [certificateAssignedDate, setCertificateAssignedDate] = useState(null);
  const certificateWrapper = useRef(null);

  useEffect(() => {
    fetch("https://tutedude-task-iota.vercel.app/api/requests")
      .then((response) =>
        response.ok ? response.json() : Promise.reject("Failed to load")
      )
      .then((data) => {
        setRequests(data);
        setIsLoading(false);
      })
      .catch((error) => {
        setError(error.toString());
        setIsLoading(false);
      });
  }, []);

  const getCertificate = async (request) => {
    const input = certificateWrapper.current;
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [canvas.width, canvas.height],
    });
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    const blob = pdf.output("blob");
    const data = new FormData();
    data.append("name", request.userId.name);
    data.append("course", request.course);
    data.append("completion_date", request.completion_date);
    data.append(
      "file",
      blob,
      `${request.course}_certificate_${request.userId.name}.pdf`
    );

    axios
      .post("https://tutedude-task-iota.vercel.app/api/certificates", data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) =>
        console.log("File uploaded successfully", response.data)
      )
      .catch((error) => console.error("Error uploading file:", error));
  };

  const generateDocument = (request) => {
    setSelectedRequest(request);
    setCertificateAssignedDate(formatDate(new Date()));
    setTimeout(() => getCertificate(request), 1000);
  };

  return (
    <div className="container mx-auto p-6 bg-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-700">
          Certificate Requests
        </h1>
        <Link
          to="/generateCertificate"
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          <IoMdAdd size={20} /> Add Certificate
        </Link>
      </div>
      {isLoading ? (
        <Loading />
      ) : error ? (
        <Error message={error} />
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((request, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {request?.userId?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {request?.userId?.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {request?.course}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-4 p-3 capitalize inline-flex text-xs leading-5 font-semibold rounded-md ${
                        request.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {request.status === "approved" ? (
                      <a
                        href={request.certificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Download
                      </a>
                    ) : (
                      <>
                        <button
                          onClick={() => generateDocument(request)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Approve
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          Deny
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {selectedRequest.userId && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center p-4"
          ref={certificateWrapper}
        >
          <div className="bg-white p-10 shadow-lg rounded-lg text-center">
            <h3 className="text-xl font-bold">{selectedRequest.userId.name}</h3>
            <p className="text-sm">
              Successfully completed the {selectedRequest.course} on{" "}
              {certificateAssignedDate}.
            </p>
            <img
              src="../src/assets/certificate-preview.png"
              alt="Certificate Preview"
              className="mt-4"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
