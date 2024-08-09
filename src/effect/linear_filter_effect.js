const Cogl = imports.gi.Cogl; //import Cogl from 'gi://Cogl';
const GObject = imports.gi.GObject; //import GObject from 'gi://GObject';
const Shell = imports.gi.Cinnamon; //import Shell from 'gi://Shell';
const LinearFilterEffect = GObject.registerClass({}, class extends Shell.GLSLEffect {
    vfunc_build_pipeline() {
        this.add_glsl_snippet(Shell.SnippetHook.FRAGMENT, '', '', false);
    }
    vfunc_paint_target(node, ctx) {
        this.get_pipeline()?.set_layer_filters(0, Cogl.PipelineFilter.LINEAR_MIPMAP_LINEAR, Cogl.PipelineFilter.LINEAR);
        super.vfunc_paint_target(node, ctx);
    }
});
