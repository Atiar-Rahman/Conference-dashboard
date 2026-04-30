import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import DashBoardLayout from "../layout/DashBoardLayout";
import ConferenceLayout from "../layout/ConferenceLayout";
import HeroLayout from "../layout/HeroLayout";

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
import HeroInfo from "../components/hero/HeroInfo";
import HeroImage from "../components/hero/HeroImage";

import ImportantDates from "../pages/conference/ImportantDates";
import KeyNote from "../pages/conference/KeyNote";
import Register from "../pages/conference/Register";
import Welcome from "../pages/conference/Welcome";
import Track from "../pages/conference/Track";
import ConferenceCommiteeLayout from "../layout/ConferenceCommiteeLayout";
import ArchivesLayout from "../layout/ArchivesLayout";
import HeroHighlights from "../components/aboutevents/HeroHighlights";
import IndexingTarget from "../components/aboutevents/IndexingTarget";
import Sponsor from "../components/aboutevents/Sponsor";
import VenueItem from "../components/aboutevents/VenueItem";
import AboutEventLayout from "../layout/AboutEventLayout";
import TrackLayout from "../layout/TrackLayout";
import Paper from "../pages/papers/Paper";
import Sessions from "../components/Sessions";
import PaperLayout from "../layout/PaperLayout";
import CoAuthor from "../pages/papers/CoAuthor";
import ReviewAssign from "../pages/papers/ReviewAssign";
import StatusUpdate from "../pages/papers/StatusUpdate";
import Contact from "../pages/Contact";
import CallForPaper from "../pages/CallForPaper";

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
                        path:'contact',
                        element:<Contact/>
                    },
                    {
                        path:'callpapers',
                        element:<CallForPaper/>
                    },
                    {
                        path: "users",
                        element: <UsersPage />,
                    },
                    {
                        path: "conference",
                        element: <ConferencePage />,
                    },

                    // conference details
                    {
                        path: "conference/:conferencePk",
                        element: <ConferenceLayout />,
                        children: [
                            {
                                index: true,
                                element: <Navigate to="about-events" replace />,
                            },
                            // ABOUT EVENT
                            {
                                path: "about-events",
                                element: <AboutEventLayout/>,
                                children: [
                                    {
                                        index: true,
                                        element: <AboutEvents />,
                                    },
                                    {
                                        path: ":eventPk",
                                        children: [
                                            {
                                                path: "herohighlights",
                                                element: <HeroHighlights/>,
                                            },
                                            {
                                                path: "indexing-target",
                                                element: <IndexingTarget/>
                                            },
                                            {
                                                path: "sponsor",
                                                element: <Sponsor/>,
                                            },
                                            {
                                                path: "venue-item",
                                                element: <VenueItem/>,
                                            },
                                        ],
                                    },
                                ],
                            },
                            // archives 
                            {
                                path: "archives",
                                element: <ArchivesLayout/>,
                                children: [
                                    {
                                        index: true,
                                        element: <Archives />,
                                    },
                                    {
                                        path: ":archivePk",
                                        children: [
                                            {
                                                path: "archive-links",
                                                element: <ArchiveLinks />,
                                            },
                                        ],
                                    },
                                ],
                            },
                            // COMMITTEE
                            {
                                path: "committee-groups",
                                element: <ConferenceCommiteeLayout/>,
                                children: [
                                    {
                                        index: true,
                                        element: <CommitteeGroups />,
                                    },
                                    {
                                        path: ":groupPk",
                                        children: [
                                            {
                                                path: "group-member",
                                                element: <CommitteeMembers />,
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                path: "contact-infos",
                                element: <ConferenceContact />,
                            },
                            // HERO
                            {
                                path: "hero",
                                element: <HeroLayout />,
                                children: [
                                    {
                                        index: true,
                                        element: <Hero />,
                                    },
                                    {
                                        path: ":heroPk",
                                        children: [
                                            {
                                                path: "hero-info",
                                                element: <HeroInfo />,
                                            },
                                            {
                                                path: "hero-image",
                                                element: <HeroImage />,
                                            },
                                        ],
                                    },
                                ],
                            },

                            {
                                path: "importants-date",
                                element: <ImportantDates />,
                            },
                            {
                                path: "keynote",
                                element: <KeyNote />,
                            },
                            {
                                path: "register",
                                element: <Register />,
                            },
                            {
                                path: "welcome",
                                element: <Welcome />,
                            },
                            // TRACK
                            {
                                path: "track",
                                element: <TrackLayout/>,
                                children: [
                                    {
                                        index: true,
                                        element: <Track />,
                                    },
                                    {
                                        path: ":trackPk",
                                        children: [
                                            {
                                                path:'session',
                                                element:<Sessions/>
                                            },
                                            {
                                                path: "papers",
                                                element: <PaperLayout/>,
                                                children: [
                                                    {
                                                        index: true,
                                                        element: <Paper />,
                                                    },
                                                    {
                                                        path: ":paperPk",
                                                        children: [
                                                            {
                                                                path: "co-author",
                                                                element: <CoAuthor/>,
                                                            },
                                                            {
                                                                path: "review-assign",
                                                                element: <ReviewAssign/>,
                                                            },
                                                            {
                                                                path: "status-update",
                                                                element: <StatusUpdate/>,
                                                            },
                                                        ],
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    },
]);

export default router;