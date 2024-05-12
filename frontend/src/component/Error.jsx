export const Loading = () => (
  <div className="w-full text-center bg-gray-100 p-2">
    <p>Loading...</p>
  </div>
);

export const Error = ({ message }) => (
  <div className="w-full text-center bg-gray-100 p-2">
    <p>Sorry! Error while loading data: {message}</p>
  </div>
);
