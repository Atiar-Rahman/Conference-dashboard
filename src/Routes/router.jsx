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
import RegistrationFees from "../pages/RegistrationFees";
import VideoSessions from "../pages/VideoSessions";
import RegisterComponent from "../pages/register/RegisterComponent";
import ConferenceRegistrationDashboard from "../pages/register/ConferenceRegistrationDashboard";
import RegistrationFeesComponent from "../pages/RegistrationFeesComponent";
import RestoreAndDeleteLayout from "../layout/RestoreAndDeleteLayout";
import RestoreTable from "../pages/RestoreTable";

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
                        path: 'contact',
                        element: <Contact />
                    },
                    {
                        path: 'callpapers',
                        element: <CallForPaper />
                    },
                    {
                        path: 'registration-fees',
                        element: <RegistrationFees />
                    },
                    {
                        path: 'video-sessions',
                        element: <VideoSessions />
                    },
                    {
                        path: "users",
                        element: <UsersPage />,
                    },
                    {
                        path: "conference",
                        element: <ConferencePage />,
                    }, 
                    {
                        path: "restore",
                        element: <RestoreAndDeleteLayout />,
                        children: [
                            {
                                index: true,
                                element: <Navigate to="conference" replace />,
                            },
                            {
                                path: "conference",
                                element: (
                                    <RestoreTable
                                        title="Conference Restore"
                                        endpoint="/api/v1/conference-restore/"
                                        columns={[
                                            { key: "title", label: "Title" },
                                            { key: "status", label: "Status" },
                                        ]}
                                    />
                                ),
                            },
                            {
                                path: "event",
                                element: (
                                    <RestoreTable
                                        title="Event Restore"
                                        endpoint="/api/v1/event-restore/"
                                        columns={[
                                            { key: "title", label: "Title" },
                                        ]}
                                    />
                                ),
                            },
                            {
                                path: "paper",
                                element: (
                                    <RestoreTable
                                        title="Paper Restore"
                                        endpoint="/api/v1/paper-restore/"
                                        columns={[
                                            { key: "title", label: "Title" },
                                        ]}
                                    />
                                ),
                            },
                            {
                                path: "review",
                                element: (
                                    <RestoreTable
                                        title="Review Restore"
                                        endpoint="/api/v1/review-restore/"
                                        columns={[
                                            { key: "id", label: "ID" },
                                        ]}
                                    />
                                ),
                            },
                            {
                                path: "reviewer",
                                element: (
                                    <RestoreTable
                                        title="Reviewer Restore"
                                        endpoint="/api/v1/reviewer-restore/"
                                        columns={[
                                            { key: "full_name", label: "Name" },
                                        ]}
                                    />
                                ),
                            },
                            {
                                path: "session",
                                element: (
                                    <RestoreTable
                                        title="Session Restore"
                                        endpoint="/api/v1/session-restore/"
                                        columns={[
                                            { key: "title", label: "Title" },
                                        ]}
                                    />
                                ),
                            },
                            {
                                path: "track",
                                element: (
                                    <RestoreTable
                                        title="Track Restore"
                                        endpoint="/api/v1/track-restore/"
                                        columns={[
                                            { key: "name", label: "Name" },
                                        ]}
                                    />
                                ),
                            },
                        ],
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
                                element: <AboutEventLayout />,
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
                                                element: <HeroHighlights />,
                                            },
                                            {
                                                path: "indexing-target",
                                                element: <IndexingTarget />
                                            },
                                            {
                                                path: "sponsor",
                                                element: <Sponsor />,
                                            },
                                            {
                                                path: "venue-item",
                                                element: <VenueItem />,
                                            },
                                        ],
                                    },
                                ],
                            },
                            // archives 
                            {
                                path: "archives",
                                element: <ArchivesLayout />,
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
                                element: <ConferenceCommiteeLayout />,
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
                            // REGISTER
                            {
                                path: "registration",
                                element: <RegisterComponent />,
                            },

                            // REGISTRATION DASHBOARD
                            {
                                path: "registration/:registrationId",
                                element: <ConferenceRegistrationDashboard />,
                            },
                            {
                                path:'fees',
                                element:<RegistrationFeesComponent/>
                            },
                            // TRACK
                            {
                                path: "track",
                                element: <TrackLayout />,
                                children: [
                                    {
                                        index: true,
                                        element: <Track />,
                                    },
                                    {
                                        path: ":trackPk",
                                        children: [
                                            {
                                                path: 'session',
                                                element: <Sessions />
                                            },
                                            {
                                                path: "papers",
                                                element: <PaperLayout />,
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
                                                                element: <CoAuthor />,
                                                            },
                                                            {
                                                                path: "review-assign",
                                                                element: <ReviewAssign />,
                                                            },
                                                            {
                                                                path: "status-update",
                                                                element: <StatusUpdate />,
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