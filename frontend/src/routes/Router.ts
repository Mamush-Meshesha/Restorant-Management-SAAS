// /* ***Layouts**** */
// const FullLayout = Loadable(lazy(() => import("../layouts/full/FullLayout")));
// const BlankLayout = Loadable(
//   lazy(() => import("../layouts/blank/BlankLayout"))
// );

// /* ****Pages***** */
// // const Dashboard = Loadable(lazy(() => import("../views/dashboard/Dashboard")));
// const SamplePage = Loadable(
//   lazy(() => import("../views/sample-page/SamplePage"))
// );
// const Error = Loadable(lazy(() => import("../views/authentication/Error")));

// const Login = Loadable(lazy(() => import("../views/authentication/Login")));

// const Rooms = Loadable(lazy(() => import("../views/rooms/Rooms")));

// const Router = [
//   {
//     path: "/",
//     element: <FullLayout />,
//     children: [
//       { path: "/", element: <FullLayout />,
//       children: [
//       { path: "/", element: <Navigate to="/dashboard" /> },
//       { path: "/dashboard", exact: true, element: <SamplePage /> },
//       { path: "/students", exact: true, element: <SamplePage /> },
//       { path: "/teachers", exact: true, element: <SamplePage /> },
//       { path: "/classes", exact: true, element: <SamplePage /> },
//       { path: "/subjects", exact: true, element: <SamplePage /> },
//       { path: "/attendance", exact: true, element: <SamplePage /> },
//       { path: "/grades", exact: true, element: <SamplePage /> },
//       { path: "/exams", exact: true, element: <SamplePage /> },
//       { path: "/assignments", exact: true, element: <SamplePage /> },
//       { path: "/timetables", exact: true, element: <SamplePage /> },
//       { path: "/fees", exact: true, element: <SamplePage /> },
//       { path: "/events", exact: true, element: <SamplePage /> },
//       { path: "/notices", exact: true, element: <SamplePage /> },
//       { path: "/library", exact: true, element: <SamplePage /> },
//       { path: "/transport", exact: true, element: <SamplePage /> },
//       { path: "/hostel", exact: true, element: <SamplePage /> },
//       { path: "/parent-portal", exact: true, element: <SamplePage /> },
//       { path: "/staff-portal", exact: true, element: <SamplePage /> },
//       { path: "/settings", exact: true, element: <SamplePage /> },
//       { path: "/rooms", element: <Rooms /> },
//       { path: "*", element: <Navigate to="/auth/404" /> },
//     ],
//   },
//   {
//     path: "/auth",
//     element: <BlankLayout />,
//     children: [
//       { path: "404", element: <Error /> },
//       // { path: "/auth/register", element: <Register /> },
//       { path: "/login", element: <Login /> },
//       { path: "*", element: <Navigate to="/auth/404" /> },
//     ],
//   },
// ],
// ];

// export default Router;
