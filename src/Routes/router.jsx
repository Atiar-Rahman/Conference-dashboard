import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import DashBoardLayout from "../layout/DashBoardLayout";
import OverviewPage from "../pages/OverviewPage";
import SubmissionsPage from "../pages/SubmissionsPage";
import ReviewersPage from "../pages/ReviewersPage";
import UsersPage from "../pages/UsersPage";
import ConferencePage from "../pages/ConferencePage";
import SignIn from "../pages/auth/SignIn";
import SignUp from "../pages/auth/SignUp";


const router = createBrowserRouter([
    {
        path: "/login",
        element: <SignIn/>
    },
    {
        path:'/signup',
        element:<SignUp/>
    },
    {
        path: "/",
        element: <ProtectedRoute/>,
        children: [
            {
                element: <DashBoardLayout/>,
                children: [
                    {
                        index: true,
                        element: <OverviewPage/>
                    },
                    {
                        path: "submissions",
                        element: <SubmissionsPage/>
                    },
                    {
                        path: "reviewers",
                        element: <ReviewersPage/>,
                    },
                    {
                        path: "users",
                        element: <UsersPage/>
                    },
                    {
                        path: "conference",
                        element: <ConferencePage/>,
                    }
                ],
            },
        ],
    },
]);

export default router;