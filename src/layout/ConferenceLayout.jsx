import { NavLink, Outlet, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";

import { readStoredAuth } from "../lib/authStorage";
import { getConference } from "../lib/api";

const sections = [
    "about-events",
    "archives",
    "committee-groups",
    "contact-infos",
    "hero",
    "importants-date",
    "keynote",
    "register",
    "welcome",
    "track",
    "registration",
    "fees",
];

const ConferenceLayout = () => {
    const { conferencePk } = useParams();
    const navigate = useNavigate();
    const token = readStoredAuth()?.access;

    const [conference, setConference] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const data = await getConference(conferencePk, token);
                setConference(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (conferencePk) load();
    }, [conferencePk, token]);

    if (loading) return <p>Loading...</p>;
    if (!conference) return <p>Not found</p>;

    return (
        <div className="space-y-6">
            {/* header */}
            <div className="bg-white p-6 rounded-xl">
                <button onClick={() => navigate("/conference")}>
                    <ArrowLeft /> Back
                </button>

                <h1 className="text-2xl font-bold">{conference.name}</h1>
            </div>

            <div className="grid grid-cols-[250px_1fr] gap-4">
                {/* sidebar */}
                <div className="bg-white p-4 rounded-xl space-y-2">
                    {sections.map((s) => (
                        <NavLink
                            key={s}
                            to={s}
                            className={({ isActive }) =>
                                `block p-2 rounded ${isActive ? "bg-black text-white" : ""}`
                            }
                        >
                            {s}
                        </NavLink>
                    ))}
                </div>

                {/* content */}
                <div className="bg-white p-6 rounded-xl">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default ConferenceLayout;