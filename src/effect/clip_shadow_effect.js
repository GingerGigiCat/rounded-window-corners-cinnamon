const GObject = imports.gi.GObject;
const Shell = imports.gi.Cinnamon; //import Shell from 'gi://Shell';
// local modules
const loadShader = require("./utils/io.js").loadShader; //import { loadShader } from '../utils/io.js';
// ------------------------------------------------------------------- [imports]
const { declarations, code} = loadShader(__dirname, `../../../${__dirname}/effect/shader/clip_shadow.frag`); //const { declarations, code } = loadShader(import.meta.url, 'shader/clip_shadow.frag');
const ClipShadowEffect = GObject.registerClass({}, class extends Shell.GLSLEffect {
    vfunc_build_pipeline() {
        const hook = Shell.SnippetHook.FRAGMENT;
        this.add_glsl_snippet(hook, declarations, code, false);
    }
    vfunc_paint_target(node, ctx) {
        // Reset to default blend string.
        this.get_pipeline()?.set_blend('RGBA = ADD(SRC_COLOR, DST_COLOR*(1-SRC_COLOR[A]))');
        super.vfunc_paint_target(node, ctx);
    }
});
