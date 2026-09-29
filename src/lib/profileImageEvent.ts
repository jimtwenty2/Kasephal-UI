/**
 * Cross-component signal for "the current user's profile image changed".
 *
 * The navbar fetches the profile image once on mount, so a save in the Edit
 * Profile modal won't reach it via React state or router.refresh() (that only
 * re-runs server components). The modal dispatches this event with the newly
 * saved profileUrl (a bare filename or full URL) and the navbar updates live.
 */
export const PROFILE_IMAGE_UPDATED_EVENT = "profile:image-updated";

export type ProfileImageUpdatedDetail = {
  profileUrl?: string | null;
};

export function emitProfileImageUpdated(profileUrl?: string | null) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<ProfileImageUpdatedDetail>(PROFILE_IMAGE_UPDATED_EVENT, {
      detail: { profileUrl },
    }),
  );
}
