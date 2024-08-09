const Gio = imports.gi.Gio//import Gio from 'gi://Gio';
// --------------------------------------------------------------- [end imports]
const load = (path) => { //These all used to have export before const
    const file = Gio.File.new_for_path(path);
    const [, contents] = file.load_contents(null);
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(contents);
};
const path = (mod_url, relative_path) => {
    const parent = Gio.File.new_for_uri(mod_url).get_parent();
    const mod_dir = parent?.get_path();
    return (Gio.File.new_for_path(`${mod_dir}/${relative_path}`).get_path() ?? '');
};
const uri = (mod_url, relative_path) => {
    const parent = Gio.File.new_for_uri(mod_url).get_parent();
    const mod_uri = parent?.get_uri();
    return `${mod_uri}/${relative_path}`;
};
const loadFile = (mod_url, relative_path) => load(path(mod_url, relative_path) ?? '');
const loadShader = (mod_url, relative_path) => {
    let [declarations, main] = load(path(mod_url, relative_path) ?? '').split(/^.*?main\(\s?\)\s?/m);
    declarations = declarations.trim();
    main = main.trim().replace(/^[{}]/gm, '').trim();
    return { declarations, code: main };
};
