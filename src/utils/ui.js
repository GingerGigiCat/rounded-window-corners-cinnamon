// imports.gi
const Gio = imports.gi.Gio; //import Gio from 'gi://Gio';
const Meta = imports.gi.Meta; //import Meta from 'gi://Meta'; //TODO: GOT HERE
// gnome modules
import { Extension, gettext as _, } from 'resource:///org/gnome/shell/extensions/extension.js';
// local modules
import { ROUNDED_CORNERS_EFFECT } from './constants.js';
import { load } from './io.js';
import { _log, _logError } from './log.js';
import { settings } from './settings.js';
// --------------------------------------------------------------- [end imports]
export const computeWindowContentsOffset = (meta_window) => {
    const bufferRect = meta_window.get_buffer_rect();
    const frameRect = meta_window.get_frame_rect();
    return [
        frameRect.x - bufferRect.x,
        frameRect.y - bufferRect.y,
        frameRect.width - bufferRect.width,
        frameRect.height - bufferRect.height,
    ];
};
export var AppType;
(function (AppType) {
    AppType["LibHandy"] = "LibHandy";
    AppType["LibAdwaita"] = "LibAdwaita";
    AppType["Other"] = "Other";
})(AppType || (AppType = {}));
/**
 * Query application type for a Meta.Window, used to skip add rounded
 * corners effect to some window.
 * @returns Application Type: LibHandy | LibAdwaita | Other
 */
export const getAppType = (meta_window) => {
    try {
        // May cause Permission error
        const contents = load(`/proc/${meta_window.get_pid()}/maps`);
        if (contents.match(/libhandy-1.so/)) {
            return AppType.LibHandy;
        }
        if (contents.match(/libadwaita-1.so/)) {
            return AppType.LibAdwaita;
        }
        return AppType.Other;
    }
    catch (e) {
        _logError(e);
        return AppType.Other;
    }
};
/**
 * Get scale factor of a Meta.window, if win is undefined, return
 * scale factor of current monitor
 */
export const WindowScaleFactor = (win) => {
    const features = Gio.Settings.new('org.gnome.mutter').get_strv('experimental-features');
    // When enable fractional scale in Wayland, return 1
    if (Meta.is_wayland_compositor() &&
        features.includes('scale-monitor-framebuffer')) {
        return 1;
    }
    const monitor_index = win
        ? win.get_monitor()
        : global.display.get_current_monitor();
    return global.display.get_monitor_scale(monitor_index);
};
/**
 * Add Item into background menu, now we can open preferences page by right
 * click in background
 * @param menu - BackgroundMenu to add
 */
export const AddBackgroundMenuItem = (menu) => {
    const openprefs_item = _('Rounded Corners Settings...');
    for (const item of menu._getMenuItems()) {
        if (item.label?.text === openprefs_item) {
            return;
        }
    }
    menu.addAction(openprefs_item, () => {
        const extension = Extension.lookupByURL(import.meta.url);
        try {
            extension.openPreferences();
        }
        catch {
            extension.openPreferences();
        }
    });
};
/** Find all Background menu, then add extra item to it */
export const SetupBackgroundMenu = () => {
    for (const _bg of global.windowGroup.firstChild.get_children()) {
        _log('Found Desktop Background obj', _bg);
        const menu = _bg._backgroundMenu;
        AddBackgroundMenuItem(menu);
    }
};
export const RestoreBackgroundMenu = () => {
    const remove_menu_item = (menu) => {
        const items = menu._getMenuItems();
        const openprefs_item = _('Rounded Corners Settings...');
        for (const i of items) {
            if (i?.label?.text === openprefs_item) {
                i.destroy();
                break;
            }
        }
    };
    for (const _bg of global.windowGroup.firstChild.get_children()) {
        const menu = _bg._backgroundMenu;
        remove_menu_item(menu);
        _log(`Added Item of ${menu}Removed`);
    }
};
/**
 * Get the correct settings object for a window.
 *
 * @param win - The window to get the settings for.
 */
export function getRoundedCornersCfg(win) {
    const global_cfg = settings().global_rounded_corner_settings;
    const custom_cfg_list = settings().custom_rounded_corner_settings;
    const k = win.get_wm_class_instance();
    if (k == null || !custom_cfg_list[k] || !custom_cfg_list[k].enabled) {
        return global_cfg;
    }
    const custom_cfg = custom_cfg_list[k];
    // Need to skip border radius item from custom settings
    custom_cfg.border_radius = global_cfg.border_radius;
    return custom_cfg;
}
/**
 * Check whether a window should have rounded corners.
 *
 * @param win - The window to check.
 * @returns Whether the window should have rounded corners.
 */
export function shouldEnableEffect(win) {
    // DING (Desktop Icons NG) is a extensions that create a gtk
    // application to show desktop grid on background, we need to
    // skip it coercively.
    // https://extensions.gnome.org/extension/2087/desktop-icons-ng-ding/
    if (win.gtkApplicationId === 'com.rastersoft.ding') {
        return false;
    }
    // Skip applications in black list.
    const wmClassInstance = win.get_wm_class_instance();
    if (wmClassInstance == null) {
        _log(`Warning: wm_class_instance of ${win}: ${win.title} is null`);
        return false;
    }
    if (settings().black_list.includes(wmClassInstance)) {
        return false;
    }
    // Check type of window, only need to add rounded corners to normal
    // window and dialog.
    const normalType = [
        Meta.WindowType.NORMAL,
        Meta.WindowType.DIALOG,
        Meta.WindowType.MODAL_DIALOG,
    ].includes(win.windowType);
    if (!normalType) {
        return false;
    }
    // Skip libhandy / libadwaita applications according to settings.
    const appType = win._appType ?? getAppType(win);
    win._appType = appType; // cache result
    _log(`Check Type of window:${win.title} => ${AppType[appType]}`);
    if (settings().skip_libadwaita_app && appType === AppType.LibAdwaita) {
        return false;
    }
    if (settings().skip_libhandy_app && appType === AppType.LibHandy) {
        return false;
    }
    // Skip maximized / fullscreen windows according to settings.
    const maximized = win.maximizedHorizontally || win.maximizedVertically;
    const fullscreen = win.fullscreen;
    const cfg = getRoundedCornersCfg(win);
    return (!(maximized || fullscreen) ||
        (maximized && cfg.keep_rounded_corners.maximized) ||
        (fullscreen && cfg.keep_rounded_corners.fullscreen));
}
/**
 * Get Rounded corners effect from a window actor
 */
export function get_rounded_corners_effect(actor) {
    const win = actor.metaWindow;
    const name = ROUNDED_CORNERS_EFFECT;
    return win.get_client_type() === Meta.WindowClientType.X11
        ? actor.firstChild.get_effect(name)
        : actor.get_effect(name);
}
