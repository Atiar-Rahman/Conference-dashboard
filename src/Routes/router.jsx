import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import DashBoardLayout from "../layout/DashBoardLayout";
import OverviewPage from "../pages/OverviewPage";
import SubmissionsPage from "../pages/SubmissionsPage";
import ReviewersPage from "../pages/ReviewersPage";
import UsersPage from "../pages/UsersPage";
import ConferencePage from "../pages/ConferencePage";
import SignIn from "../pages/auth/SignIn";
import SignUp from "../pages/auth/SignUp";
import ConferenceLayout from "../layout/ConferenceLayout";
import AboutEvents from "../components/aboutevents/AboutEvents";
import NotFoundPage from "../pages/NotFoundPage";


const router = createBrowserRouter([
    {
        path: "/login",
        element: <SignIn/>
    },
    {
        path: "/",
        element: <ProtectedRoute/>,
        errorElement:<NotFoundPage/>,
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
                        element: <ConferenceLayout />,
                        children: [
                            {
                                index: true,
                                element: (
                                    <Navigate
                                        to="about-events"
                                        replace
                                    />
                                ),
                            },
                            {
                                path: "about-events",
                                element: <AboutEvents />,
                            },
                            // {
                            //     path: "archive-links",
                            //     element: <ArchiveLinks />,
                            // },
                            // {
                            //     path: "archives",
                            //     element: <Archives />,
                            // },
                            // {
                            //     path: "committee-groups",
                            //     element: <CommitteeGroups />,
                            // },
                            // {
                            //     path: "committee-members",
                            //     element: <CommitteeMembers />,
                            // },
                            // {
                            //     path: "contact-infos",
                            //     element: <ContactInfos />,
                            // },
                            // {
                            //     path: "hero-highlights",
                            //     element: <HeroHighlights />,
                            // },
                            // {
                            //     path: "hero-info-cards",
                            //     element: <HeroInfoCards />,
                            // },
                            // {
                            //     path: "hero-sections",
                            //     element: <HeroSections />,
                            // },
                        ],
                    },
                ],
            },
        ],
    },
]);

export default router;