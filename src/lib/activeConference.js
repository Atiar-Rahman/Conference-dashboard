const ACTIVE_CONFERENCE_STORAGE_KEY = "conference_admin_active_conference_id";

export function readActiveConferenceId() {
  return localStorage.getItem(ACTIVE_CONFERENCE_STORAGE_KEY);
}

export function writeActiveConferenceId(conferenceId) {
  if (!conferenceId) {
    localStorage.removeItem(ACTIVE_CONFERENCE_STORAGE_KEY);
    return;
  }

  localStorage.setItem(
    ACTIVE_CONFERENCE_STORAGE_KEY,
    String(conferenceId)
  );
}

export function clearActiveConferenceId() {
  localStorage.removeItem(ACTIVE_CONFERENCE_STORAGE_KEY);
}
