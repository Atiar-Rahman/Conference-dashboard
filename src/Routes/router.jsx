import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import DashBoardLayout from "../layout/DashBoardLayout";
import ConferenceLayout from "../layout/ConferenceLayout";

import OverviewPage from "../pages/OverviewPage";
import SubmissionsPage from "../pages/SubmissionsPage";
import ReviewersPage from "../pages/ReviewersPage";
import UsersPage from "../pages/UsersPage";
import ConferencePage from "../pages/ConferencePage";

import SignIn from "../pages/auth/SignIn";
import NotFoundPage from "../pages/NotFoundPage";

import AboutEvents from "../components/aboutevents/AboutEvents";
import ArchiveLinks from "../components/aboutevents/ArchiveLinks";
import Archives from "../components/aboutevents/Archives";
import CommitteeGroups from "../components/aboutevents/CommitteeGroups";
import CommitteeMembers from "../components/aboutevents/CommitteeMembers";
import ConferenceContact from "../components/aboutevents/ConferenceContact";
import Hero from "../pages/conference/Hero";
import ImportantDates from "../pages/conference/ImportantDates";
import KeyNote from "../pages/conference/KeyNote";

const router = createBrowserRouter([
    {
        path: "/login",
        element: <SignIn />,
    },
    {
        path: "/",
        element: <ProtectedRoute />,
        errorElement: <NotFoundPage />,
        children: [
            {
                element: <DashBoardLayout />,
                children: [
                    {
                        index: true,
                        element: <OverviewPage />,
                    },
                    {
                        path: "submissions",
                        element: <SubmissionsPage />,
                    },
                    {
                        path: "reviewers",
                        element: <ReviewersPage />,
                    },
                    {
                        path: "users",
                        element: <UsersPage />,
                    },

                    // list page
                    {
                        path: "conference",
                        element: <ConferencePage />,
                    },

                    // single conference
                    {
                        path: "conference/:conferencePk",
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
                            {
                                path: "archive-links",
                                element: <ArchiveLinks />,
                            },
                            {
                                path: "archives",
                                element: <Archives />,
                            },
                            {
                                path: "committee-groups",
                                element: <CommitteeGroups />,
                            },
                            {
                                path: "committee-members",
                                element: <CommitteeMembers />,
                            },
                            {
                                path: "contact-infos",
                                element: <ConferenceContact/>,
                            },
                            {
                                path:'hero',
                                element:<Hero/>
                            },
                            {
                                path:'importants-date',
                                element:<ImportantDates/>
                            },
                            {
                                path:'keynote',
                                element:<KeyNote/>
                            }
                        ],
                    },
                ],
            },
        ],
    },
]);

export default router;