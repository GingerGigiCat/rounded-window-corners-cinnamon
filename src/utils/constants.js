// This files use for store const variants will used by other modules.
/** Name of the rounded corners effect */
export const ROUNDED_CORNERS_EFFECT = 'Rounded Corners Effect';
/** Name of the shadow clipping effect  */
export const CLIP_SHADOW_EFFECT = 'Clip Shadow Effect';
/** Padding of shadow actors */
export const SHADOW_PADDING = 80;
/** Hardcoded shadow size for certain applications that have to be
 * manually clipped */
export const APP_SHADOWS = {
    kitty: [11, 35, 11, 11],
};
// TODO: Those constants should be extracted into separate variables like the
// ones above. This will be done when refactoring the files that they are used
// in.
export const constants = {
    /** Name of shadow actors */
    SHADOW_ACTOR_NAME: 'Rounded Window Shadow Actor',
    /** Name of blur effect for window */
    BLUR_EFFECT: 'Patched Blur Effect',
    /** Used to mark widget in preferences/page/custom.ts */
    DON_T_CONFIG: "Don't Configuration in Custom Page",
    /** Name of shadow actor to be added in overview */
    OVERVIEW_SHADOW_ACTOR: 'Shadow Actor (Overview)',
};
